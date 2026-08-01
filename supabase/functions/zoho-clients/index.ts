/*
 * zoho-clients — the Clients tab's data source.
 *
 * Two actions: `list` (clients, searchable) and `detail` (one client plus their
 * policies).
 *
 * ── On reading Zoho live rather than from a synced table ──────────────────
 * Earlier I argued the portal should read Supabase tables fed by a scheduled
 * sync, because Zoho meters API credits per org. That still holds for anything
 * that aggregates across ALL clients — a report touching every record would
 * burn credits fast and be slow. It does not hold for a handful of advisors
 * browsing one client at a time, which is a few calls per view. So: live now,
 * sync when we build the reports. Building the sync first would have meant
 * modelling a schema I cannot yet see.
 *
 * ── On not knowing where policies live ────────────────────────────────────
 * This org's CRM has not been introspected yet, so the policy module is DETECTED
 * at runtime and reported back in the response as `policyModule`. The UI shows
 * it. If the guess is wrong, set ZOHO_POLICY_MODULE to the right api_name and
 * nothing else has to change. Fields are returned as-is rather than mapped to
 * names I would be inventing.
 */

import { zohoFetch, ZohoError } from '../_shared/zoho.ts'
import { requireStaff, cors, json } from '../_shared/zohoAuth.ts'

/* Which module holds the client record. Accounts is the CRM default for an
 * organisation; an individual-lines broker may want Contacts instead. */
const CLIENT_MODULE = Deno.env.get('ZOHO_CLIENT_MODULE') || 'Accounts'

interface ZohoModule {
  api_name: string
  plural_label: string
  generated_type: string
  api_supported: boolean
}

/*
 * Cached for the life of the instance. Module layout changes about never, and
 * re-detecting on every request would spend a credit to learn the same answer.
 */
let policyModuleCache: string | null = null

async function detectPolicyModule(): Promise<string | null> {
  const override = Deno.env.get('ZOHO_POLICY_MODULE')
  if (override) return override
  if (policyModuleCache) return policyModuleCache

  const res = await zohoFetch<{ modules: ZohoModule[] }>('/crm/v7/settings/modules')
  const modules = (res.modules ?? []).filter((m) => m.api_supported)

  // Strongest signal first: something actually called policies. Then a custom
  // module mentioning cover/insurance. Deals last — it is the CRM default for
  // "the thing being sold", so it is a fallback, not a match.
  const byName = modules.find((m) => /polic/i.test(`${m.api_name} ${m.plural_label}`))
  const byCustom = modules.find(
    (m) => m.generated_type === 'custom' && /cover|insur|risk/i.test(`${m.api_name} ${m.plural_label}`),
  )
  const anyCustom = modules.find((m) => m.generated_type === 'custom')
  const found = byName ?? byCustom ?? anyCustom ?? null

  policyModuleCache = found?.api_name ?? null
  return policyModuleCache
}

/* Zoho returns a lot of plumbing on every record. None of it belongs on screen. */
const NOISE = new Set([
  'id', '$approval', '$approval_state', '$process_flow', '$editable', '$orchestration',
  '$in_merge', '$has_more', '$sharing_permission', '$state', '$locked_for_me', '$zia_owner_assignment',
  '$review', '$review_process', '$canvas_id', '$layout_id', '$wizard_connection_path',
  '$field_states', '$line_tax', '$pathfinder', 'Locked__s', 'Tag', 'Record_Image', '$currency_symbol',
  'Created_By', 'Modified_By', 'Created_Time', 'Modified_Time', 'Last_Activity_Time', 'Owner',
  'Unsubscribed_Mode', 'Unsubscribed_Time', 'Change_Log_Time__s', 'Enrich_Status__s',
])

/** Flatten a Zoho record into label/value pairs a table can render. */
function presentable(record: Record<string, unknown>): Array<{ key: string; value: string }> {
  return Object.entries(record)
    .filter(([k, v]) => !NOISE.has(k) && !k.startsWith('$') && v !== null && v !== '' && v !== undefined)
    .map(([k, v]) => {
      // Lookups arrive as { id, name }; the name is the only useful half here.
      const value =
        typeof v === 'object' && v !== null && 'name' in (v as Record<string, unknown>)
          ? String((v as Record<string, unknown>).name)
          : Array.isArray(v)
            ? v.length ? `${v.length} item(s)` : ''
            : typeof v === 'object'
              ? JSON.stringify(v)
              : String(v)
      return { key: k.replace(/_/g, ' '), value }
    })
    .filter((f) => f.value !== '')
}

async function listClients(query: string, page: number) {
  const per = 50
  // search vs plain list: Zoho's word search covers name, email and phone in one
  // call, which is what the box above the table is for.
  const path = query
    ? `/crm/v7/${CLIENT_MODULE}/search?word=${encodeURIComponent(query)}&page=${page}&per_page=${per}`
    : `/crm/v7/${CLIENT_MODULE}?page=${page}&per_page=${per}&sort_by=Modified_Time&sort_order=desc`

  const res = await zohoFetch<{
    data?: Array<Record<string, unknown>>
    info?: { more_records?: boolean; page?: number }
  }>(path)

  const rows = (res.data ?? []).map((r) => ({
    id: String(r.id),
    name: String(r.Account_Name ?? r.Full_Name ?? r.Last_Name ?? r.Name ?? 'Unnamed'),
    email: (r.Email ?? r.Primary_Email ?? null) as string | null,
    phone: (r.Phone ?? r.Mobile ?? null) as string | null,
    city: (r.Billing_City ?? r.Mailing_City ?? null) as string | null,
  }))

  return { rows, hasMore: Boolean(res.info?.more_records), page }
}

async function clientDetail(id: string) {
  const record = await zohoFetch<{ data?: Array<Record<string, unknown>> }>(
    `/crm/v7/${CLIENT_MODULE}/${encodeURIComponent(id)}`,
  )
  const client = record.data?.[0]
  if (!client) return { found: false as const }

  const policyModule = await detectPolicyModule()
  let policies: Array<{ id: string; fields: Array<{ key: string; value: string }> }> = []
  let policyNote: string | null = null

  if (!policyModule) {
    policyNote = 'No policy-like module found in this CRM.'
  } else {
    try {
      // The related-list endpoint is the correct way to get "this account's X",
      // and it works regardless of what the lookup field happens to be called.
      const rel = await zohoFetch<{ data?: Array<Record<string, unknown>> }>(
        `/crm/v7/${CLIENT_MODULE}/${encodeURIComponent(id)}/${encodeURIComponent(policyModule)}`,
      )
      policies = (rel.data ?? []).map((p) => ({ id: String(p.id), fields: presentable(p) }))
      if (!policies.length) policyNote = 'No records in this module for this client.'
    } catch (e) {
      // A 400 here usually means the module is not a related list of the client
      // module — worth saying plainly rather than showing an empty table that
      // implies the client genuinely has no policies.
      policyNote = `Could not read ${policyModule} as a related list (${
        e instanceof Error ? e.message : 'failed'
      }). It may not be linked to ${CLIENT_MODULE}.`
    }
  }

  return {
    found: true as const,
    client: {
      id: String(client.id),
      name: String(client.Account_Name ?? client.Full_Name ?? client.Last_Name ?? 'Unnamed'),
      fields: presentable(client),
    },
    policyModule,
    policyNote,
    policies,
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const denied = await requireStaff(req)
  if (denied) return denied

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* list with defaults */ }

  const action = String(body.action ?? 'list')

  try {
    if (action === 'detail') {
      const id = String(body.id ?? '')
      if (!id) return json({ error: 'id-required' }, 400)
      return json(await clientDetail(id))
    }

    const result = await listClients(
      String(body.query ?? '').trim(),
      Math.max(1, Number(body.page ?? 1)),
    )
    return json({ ...result, clientModule: CLIENT_MODULE })
  } catch (e) {
    const status = e instanceof ZohoError ? e.status : 500
    console.error('zoho-clients failed', e)
    return json(
      {
        error: e instanceof Error ? e.message : 'failed',
        // 429 is Zoho's rate limit; the UI says something useful about it.
        rateLimited: status === 429,
      },
      status,
    )
  }
})
