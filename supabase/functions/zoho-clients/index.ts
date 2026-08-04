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
 * ── On where policies live ────────────────────────────────────────────────
 * Cover is split across several modules in this CRM — Medical and Life
 * Policies, Motor Policies, General Insurance, Policy Details, Renewal Policy
 * Details — so all of them are read and the results grouped by module. Which
 * module a policy sits in is information, not plumbing.
 *
 * The modules are detected rather than hardcoded, so one added in Zoho appears
 * here without a deploy. ZOHO_POLICY_MODULES overrides the detection with a
 * comma-separated list of api_names if it ever picks wrongly.
 *
 * Fields are rendered from whatever the record carries rather than mapped to
 * names chosen in advance: the policy layout spans motor, property and medical
 * fields, so any one record is mostly blank, and a fixed field list would show
 * a wall of empties.
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
let policyModulesCache: Array<{ api_name: string; label: string }> | null = null

/*
 * ALL the policy modules, not one.
 *
 * This CRM splits cover across Medical and Life Policies, Motor Policies,
 * General Insurance, Policy Details and Renewal Policy Details. An earlier
 * version picked a single best match, which would have shown a client's motor
 * cover and silently omitted their medical — plausible-looking and incomplete,
 * which is worse than an obvious failure.
 *
 * Claims are excluded: a claims register is a different thing from cover, and
 * mixing them under one heading would misrepresent both.
 */
async function detectPolicyModules(): Promise<Array<{ api_name: string; label: string }>> {
  const override = Deno.env.get('ZOHO_POLICY_MODULES')
  if (override) {
    return override.split(',').map((s) => ({ api_name: s.trim(), label: s.trim() }))
  }
  if (policyModulesCache) return policyModulesCache

  const res = await zohoFetch<{ modules: ZohoModule[] }>('/crm/v7/settings/modules')

  policyModulesCache = (res.modules ?? [])
    .filter((m) => m.api_supported)
    .filter((m) => {
      const hay = `${m.api_name} ${m.plural_label}`
      return /polic|insur|cover/i.test(hay) && !/claim/i.test(hay)
    })
    .map((m) => ({ api_name: m.api_name, label: m.plural_label || m.api_name }))

  return policyModulesCache
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

/*
 * What an advisor looks for first on a policy, in that order. Everything else
 * follows alphabetically. Matched loosely because the same idea is named
 * differently across five modules — "Select Policy Type" here, "Policy Type"
 * there.
 */
const FIELD_PRIORITY = [
  /policy number/i, /policy type/i, /insurance company/i, /insured name/i,
  /issue date/i, /expiry|renewal date/i, /status/i, /sum assured/i, /premium/i,
]

function priorityOf(key: string): number {
  const i = FIELD_PRIORITY.findIndex((re) => re.test(key))
  return i === -1 ? FIELD_PRIORITY.length : i
}

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
    // Empty fields are already dropped above, which matters here: this CRM's
    // policy layout carries motor, property and medical fields on every record,
    // so most of any given policy is blank and would otherwise be a wall of "—".
    .sort((a, b) => priorityOf(a.key) - priorityOf(b.key) || a.key.localeCompare(b.key))
}

/*
 * Which fields a module actually has.
 *
 * v7 makes `fields` MANDATORY when fetching all records — omitting it is a 400
 * REQUIRED_PARAM_MISSING, not a default-everything. (v2 allowed it, which is why
 * most examples online do not pass it.) Asking for a field the module does not
 * have is also an error, and the client module might be Accounts or Contacts
 * with entirely different names, so the list is read from the module rather than
 * hardcoded. Cached per instance; layouts change about never.
 */
interface ZohoField {
  api_name: string
  data_type: string
  lookup?: { module?: { api_name?: string } }
}

const fieldCache = new Map<string, ZohoField[]>()

async function fieldMetaFor(module: string): Promise<ZohoField[]> {
  const hit = fieldCache.get(module)
  if (hit) return hit

  const res = await zohoFetch<{ fields?: ZohoField[] }>(
    `/crm/v7/settings/fields?module=${encodeURIComponent(module)}`,
  )
  const fields = res.fields ?? []
  fieldCache.set(module, fields)
  return fields
}

async function fieldsFor(module: string): Promise<Set<string>> {
  return new Set((await fieldMetaFor(module)).map((f) => f.api_name))
}

/**
 * The field on a policy module that points back at the client — "Insured Name",
 * "Account Name", whatever this org called it. Found by asking which lookup
 * targets the client module, rather than guessing the label.
 */
async function clientLookupField(module: string): Promise<string | null> {
  const fields = await fieldMetaFor(module)
  const match = fields.find(
    (f) => f.data_type === 'lookup' && f.lookup?.module?.api_name === CLIENT_MODULE,
  )
  return match?.api_name ?? null
}

// Ordered by usefulness in a list row. Whichever of these the module has is
// what gets requested; the rest are ignored rather than erroring.
const LIST_FIELDS = [
  'Account_Name', 'Full_Name', 'Last_Name', 'First_Name', 'Company',
  'Email', 'Primary_Email', 'Secondary_Email',
  'Phone', 'Mobile',
  'Billing_City', 'Mailing_City', 'Website', 'Account_Type',
]

async function listClients(query: string, page: number) {
  const per = 50

  const available = await fieldsFor(CLIENT_MODULE)
  const chosen = LIST_FIELDS.filter((f) => available.has(f))
  // A module with none of the expected names still has to return something
  // rather than a 400, so fall back to whatever it does have.
  const fields = (chosen.length ? chosen : [...available].slice(0, 10)).join(',')

  // search vs plain list: Zoho's word search covers name, email and phone in one
  // call, which is what the box above the table is for.
  const path = query
    ? `/crm/v7/${CLIENT_MODULE}/search?word=${encodeURIComponent(query)}&page=${page}&per_page=${per}&fields=${encodeURIComponent(fields)}`
    : `/crm/v7/${CLIENT_MODULE}?page=${page}&per_page=${per}&sort_by=Modified_Time&sort_order=desc&fields=${encodeURIComponent(fields)}`

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

/*
 * Policy counts for a page of clients.
 *
 * The obvious implementation — fetch each client's related lists and count —
 * is 50 clients × 5 modules = 250 API calls for one page. Zoho meters credits
 * per org, shared with everything else, so that is not a rounding error.
 *
 * COQL does it in ONE call per module: COUNT grouped by the client lookup,
 * filtered to the ids actually on screen. Five calls, one credit each, however
 * many clients are listed.
 *
 * Limits that shape this: `in` takes at most 100 values, so ids are chunked;
 * aggregate function names must be UPPERCASE; a query returning under 200 rows
 * costs a single credit.
 */
async function policyCounts(ids: string[]) {
  const counts: Record<string, { total: number; byModule: Record<string, number> }> = {}
  for (const id of ids) counts[id] = { total: 0, byModule: {} }
  if (!ids.length) return { counts, partial: false }

  const modules = await detectPolicyModules()
  let partial = false

  const chunks: string[][] = []
  for (let i = 0; i < ids.length; i += 100) chunks.push(ids.slice(i, i + 100))

  await Promise.all(
    modules.map(async (m) => {
      const lookup = await clientLookupField(m.api_name)
      // No lookup to the client module means these records cannot be attributed
      // to a client at all — silently counting zero would be a lie, so the
      // response is marked partial and the UI stops claiming a total.
      if (!lookup) { partial = true; return }

      try {
        for (const chunk of chunks) {
          const list = chunk.map((i) => `'${i}'`).join(',')
          const res = await zohoFetch<{ data?: Array<Record<string, unknown>> }>(
            '/crm/v7/coql',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                select_query:
                  `select ${lookup}, COUNT(id) from ${m.api_name} ` +
                  `where ${lookup} in (${list}) group by ${lookup}`,
              }),
            },
          )

          for (const row of res.data ?? []) {
            /*
             * The aggregate's key is not documented consistently — it comes back
             * as "count", "COUNT(id)" or similar depending on version. Rather
             * than depend on one spelling, take the lookup's id from the lookup
             * column and the count from whichever value is a number.
             */
            const lookupVal = row[lookup]
            const clientId =
              typeof lookupVal === 'object' && lookupVal !== null
                ? String((lookupVal as Record<string, unknown>).id ?? '')
                : String(lookupVal ?? '')

            const n = Object.entries(row)
              .filter(([k]) => k !== lookup)
              .map(([, v]) => Number(v))
              .find((v) => Number.isFinite(v))

            if (clientId && counts[clientId] && n) {
              counts[clientId].byModule[m.label] = (counts[clientId].byModule[m.label] ?? 0) + n
              counts[clientId].total += n
            }
          }
        }
      } catch (e) {
        // One module failing must not silently understate every client's total.
        console.error(`counts failed for ${m.api_name}`, e instanceof Error ? e.message : e)
        partial = true
      }
    }),
  )

  return { counts, partial }
}

/*
 * COQL cannot select every field type — subforms and multi-select lookups are
 * fetched separately by the API and asking for them fails the whole query.
 */
const COQL_UNSUPPORTED = new Set([
  'subform', 'multiselectlookup', 'multiuserlookup', 'linking', 'RRULE', 'ALARM',
])

/*
 * One client's policies from one module.
 *
 * Uses COQL rather than the related-records endpoint. That endpoint wants the
 * RELATED LIST api_name, which is not the module api_name — on this org the
 * policy modules are CustomModule1, CustomModule6 and so on, while their related
 * lists carry their own labels ("Claims Under Policies"). COQL needs only the
 * module api_name and the lookup field, both of which come from metadata, so
 * there is nothing left to guess.
 */
async function policiesForClient(module: string, clientId: string) {
  const lookup = await clientLookupField(module)
  if (!lookup) throw new Error(`no lookup to ${CLIENT_MODULE}`)

  const meta = await fieldMetaFor(module)
  // COQL caps the select list at 50 fields.
  const selectable = meta
    .filter((f) => !COQL_UNSUPPORTED.has(f.data_type) && !NOISE.has(f.api_name))
    .map((f) => f.api_name)
    .slice(0, 49)

  const fields = ['id', ...selectable].join(', ')

  const res = await zohoFetch<{ data?: Array<Record<string, unknown>> }>('/crm/v7/coql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      select_query:
        `select ${fields} from ${module} where ${lookup} = '${clientId}' limit 200`,
    }),
  })

  return (res.data ?? []).map((p) => ({ id: String(p.id), fields: presentable(p) }))
}

async function clientDetail(id: string) {
  const record = await zohoFetch<{ data?: Array<Record<string, unknown>> }>(
    `/crm/v7/${CLIENT_MODULE}/${encodeURIComponent(id)}`,
  )
  const client = record.data?.[0]
  if (!client) return { found: false as const }

  const modules = await detectPolicyModules()

  /*
   * One call per module, concurrently. Five sequential round trips to Zoho for
   * a single panel is a visible wait; in parallel it is one round trip's worth.
   * A module that fails is reported on its own rather than failing the panel —
   * a client's motor policies are still worth seeing when the medical module
   * is not linked to Accounts.
   */
  const groups = await Promise.all(
    modules.map(async (m) => {
      try {
        const policies = await policiesForClient(m.api_name, id)
        return { module: m.api_name, label: m.label, policies, note: null as string | null }
      } catch (e) {
        return {
          module: m.api_name,
          label: m.label,
          policies: [],
          note: `Could not read ${m.label} (${e instanceof Error ? e.message : 'failed'}).`,
        }
      }
    }),
  )

  // Modules with nothing in them are dropped from the response: five empty
  // headings per client is noise. Failures are kept, because those are not the
  // same as "no policies" and the difference matters.
  const shown = groups.filter((g) => g.policies.length > 0 || g.note)

  return {
    found: true as const,
    client: {
      id: String(client.id),
      name: String(client.Account_Name ?? client.Full_Name ?? client.Last_Name ?? 'Unnamed'),
      fields: presentable(client),
    },
    policyModules: modules.map((m) => m.api_name),
    policyGroups: shown,
    totalPolicies: groups.reduce((n, g) => n + g.policies.length, 0),
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

    /*
     * Counts are a separate call from the list on purpose: the table renders
     * immediately and the numbers arrive after, rather than the whole page
     * waiting on five aggregate queries. It also means a counts failure costs
     * the counts and not the client list.
     */
    if (action === 'counts') {
      const ids = Array.isArray(body.ids) ? body.ids.map(String).filter(Boolean) : []
      return json(await policyCounts(ids))
    }

    const result = await listClients(
      String(body.query ?? '').trim(),
      Math.max(1, Number(body.page ?? 1)),
    )
    return json({ ...result, clientModule: CLIENT_MODULE })
  } catch (e) {
    const status = e instanceof ZohoError ? e.status : 500
    const detail = e instanceof ZohoError ? (e.detail as Record<string, unknown> | undefined) : undefined
    console.error('zoho-clients failed', e instanceof Error ? e.message : e, detail)
    return json(
      {
        error: e instanceof Error ? e.message : 'failed',
        // Zoho's own code and details, surfaced so the next failure diagnoses
        // itself on screen instead of needing a trip through the logs.
        zohoCode: detail?.code ?? null,
        zohoDetails: detail?.details ?? null,
        // 429 is Zoho's rate limit; the UI says something useful about it.
        rateLimited: status === 429,
      },
      status,
    )
  }
})
