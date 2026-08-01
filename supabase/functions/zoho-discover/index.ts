/*
 * zoho-discover — a one-off look at how this Zoho org is actually shaped.
 *
 * Everything downstream depends on two unknowns that no amount of reading the
 * docs can settle: where policies live in this CRM (a custom module? Deals
 * renamed? fields on Accounts?), and whether a Books invoice can be joined to a
 * CRM customer by id or only by guessing at names.
 *
 * So this asks Zoho rather than assuming, and is meant to be run a handful of
 * times and then deleted.
 *
 * IT RETURNS SHAPE, NEVER CONTENT. Module names, field api_names, and the set of
 * keys present on a Books contact — no field values, so no customer data leaves
 * Zoho. That is deliberate: a diagnostics endpoint is exactly the kind of thing
 * that quietly becomes a data export.
 *
 * Authorised by the portal_staff allowlist, using the caller's own session —
 * the same gate as the portal itself. An earlier version compared against
 * SUPABASE_SERVICE_ROLE_KEY, which meant the most dangerous credential in the
 * project had to be copied around by hand to run a diagnostic. A staff session
 * the caller already holds is both safer and less work.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { zohoFetch, booksOrgId, ZohoError } from '../_shared/zoho.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })

interface ZohoModule {
  api_name: string
  module_name: string
  plural_label: string
  generated_type: string
  api_supported: boolean
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const authHeader = req.headers.get('Authorization') ?? ''
  const url = Deno.env.get('SUPABASE_URL')
  const anon = Deno.env.get('SUPABASE_ANON_KEY')

  // Presence only, never values — enough to diagnose a misconfigured function
  // from the logs without putting key material in them.
  console.log('env present:', {
    SUPABASE_URL: Boolean(url),
    SUPABASE_ANON_KEY: Boolean(anon),
    ZOHO_CLIENT_ID: Boolean(Deno.env.get('ZOHO_CLIENT_ID')),
    ZOHO_CLIENT_SECRET: Boolean(Deno.env.get('ZOHO_CLIENT_SECRET')),
    ZOHO_REFRESH_TOKEN: Boolean(Deno.env.get('ZOHO_REFRESH_TOKEN')),
    ZOHO_BOOKS_ORG_ID: Boolean(Deno.env.get('ZOHO_BOOKS_ORG_ID')),
    hasAuthHeader: authHeader.length > 0,
  })

  if (!url || !anon) return json({ error: 'function-misconfigured' }, 500)
  if (!authHeader) return json({ error: 'sign-in-required' }, 401)

  /*
   * Ask the database, with the caller's own token, whether they are staff. This
   * reuses is_portal_staff() rather than re-implementing the rule, so revoking
   * someone in portal_staff revokes them here too, with no redeploy.
   */
  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: isStaff, error: staffError } = await supabase.rpc('is_portal_staff')
  if (staffError) {
    console.error('staff check failed', staffError.message)
    return json({ error: 'staff-check-failed' }, 403)
  }
  if (isStaff !== true) return json({ error: 'not-staff' }, 403)

  try {
    /* ── 1. What modules exist, and which look like policies ─────────────── */
    const modules = await zohoFetch<{ modules: ZohoModule[] }>('/crm/v7/settings/modules')

    const usable = (modules.modules ?? [])
      .filter((m) => m.api_supported)
      .map((m) => ({ api_name: m.api_name, label: m.plural_label, type: m.generated_type }))

    const candidates = usable.filter((m) =>
      m.type === 'custom' ||
      /polic|cover|insur|deal|potential/i.test(`${m.api_name} ${m.label}`),
    )

    const fieldsByModule: Record<string, string[] | { error: string }> = {}
    for (const m of candidates.slice(0, 12)) {
      try {
        const f = await zohoFetch<{ fields: Array<{ api_name: string; data_type: string }> }>(
          `/crm/v7/settings/fields?module=${encodeURIComponent(m.api_name)}`,
        )
        fieldsByModule[m.api_name] = (f.fields ?? []).map((x) => `${x.api_name}:${x.data_type}`)
      } catch (e) {
        fieldsByModule[m.api_name] = { error: e instanceof Error ? e.message : 'failed' }
      }
    }

    /* ── 2. Can a Books customer be joined to a CRM record by id? ─────────── */
    let booksJoin: Record<string, unknown>
    try {
      const contacts = await zohoFetch<{ contacts: Array<Record<string, unknown>> }>(
        `/books/v3/contacts?organization_id=${booksOrgId()}&per_page=1`,
      )
      const sample = contacts.contacts?.[0]
      booksJoin = sample
        ? {
            contactFieldsPresent: Object.keys(sample).sort(),
            crmLinkFields: Object.keys(sample).filter((k) => /zcrm|crm/i.test(k)),
          }
        : { note: 'no contacts in Books yet — cannot tell whether the CRM link exists' }
    } catch (e) {
      booksJoin = { error: e instanceof Error ? e.message : 'books call failed' }
    }

    /* ── 3. Does the invoice shape carry a customer id we can group by? ───── */
    let invoiceShape: unknown
    try {
      const inv = await zohoFetch<{ invoices: Array<Record<string, unknown>> }>(
        `/books/v3/invoices?organization_id=${booksOrgId()}&per_page=1`,
      )
      invoiceShape = inv.invoices?.[0]
        ? { invoiceFieldsPresent: Object.keys(inv.invoices[0]).sort() }
        : { note: 'no invoices in Books yet' }
    } catch (e) {
      invoiceShape = { error: e instanceof Error ? e.message : 'books call failed' }
    }

    return json({
      ok: true,
      moduleCount: usable.length,
      modules: usable,
      likelyPolicyModules: candidates.map((c) => c.api_name),
      fieldsByModule,
      booksJoin,
      invoiceShape,
    })
  } catch (e) {
    const status = e instanceof ZohoError ? e.status : 500
    const detail = e instanceof ZohoError ? e.detail : null
    console.error('zoho-discover failed', e)
    return json({ ok: false, error: e instanceof Error ? e.message : 'failed', detail }, status)
  }
})
