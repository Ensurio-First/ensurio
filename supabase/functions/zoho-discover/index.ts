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
 * Service-role only. It is not for the portal and not for the public.
 */

import { zohoFetch, booksOrgId, ZohoError } from '../_shared/zoho.ts'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

/*
 * Constant-time-ish comparison. String equality on a secret leaks its prefix
 * through timing; the cost of avoiding that here is one line.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

interface ZohoModule {
  api_name: string
  module_name: string
  plural_label: string
  generated_type: string
  creatable: boolean
  api_supported: boolean
}

Deno.serve(async (req: Request) => {
  const auth = req.headers.get('Authorization') ?? ''
  const presented = auth.replace(/^Bearer\s+/i, '')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  if (!serviceKey || !safeEqual(presented, serviceKey)) {
    return json({ error: 'forbidden' }, 403)
  }

  try {
    /* ── 1. What modules exist, and which look like policies ─────────────── */
    const modules = await zohoFetch<{ modules: ZohoModule[] }>('/crm/v7/settings/modules')

    const usable = (modules.modules ?? [])
      .filter((m) => m.api_supported)
      .map((m) => ({
        api_name: m.api_name,
        label: m.plural_label,
        type: m.generated_type, // 'default' | 'custom' | 'subform' | ...
      }))

    // Anything a policy might plausibly be filed under, so the fields of the
    // likely candidates come back in the same round trip.
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
            // Keys only. The values are a real customer's details.
            contactFieldsPresent: Object.keys(sample).sort(),
            // These are what the CRM-Books integration adds. Present means the
            // join is an id lookup; absent means name/email matching, which is
            // the fragile path worth avoiding.
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
