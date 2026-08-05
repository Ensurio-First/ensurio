/*
 * zoho-clients — the Clients tab's data source.
 *
 * Three actions: `list` (clients, searchable), `counts` (policy totals and the
 * next renewal date for a page of clients) and `detail` (one client plus their
 * policies).
 *
 * ── On reading Zoho live rather than from a synced table ──────────────────
 * Earlier I argued the portal should read Supabase tables fed by a scheduled
 * sync, because Zoho meters API credits per org. That still holds for anything
 * that aggregates across ALL clients — a report touching every record would
 * burn credits fast and be slow. It does not hold for a handful of advisors
 * browsing one client at a time, which is a few calls per view. So: live now,
 * sync when we build the reports.
 *
 * ── What the CRM actually contains ────────────────────────────────────────
 * Introspected against the live org rather than guessed. Cover is split across
 * five modules, and they are NOT equivalent:
 *
 *   Motor_Policies          Policy_Issued_on / Policy_Expires_on   (date)
 *   Medical_Policies        Policy_Issued_on / Policy_Expires_on   (date)
 *   General_Insurance       Policy_Issued_on / Policy_Expires_on   (date)
 *   Policy_Details          Policy_Issue_Date / Policy_Expiry_Date (date)
 *   Renewal_Policy_Details  Policy_Issued_Date / Policy_Expiry_Date (datetime)
 *
 * The first three are the live book: client link and both dates populated
 * throughout, expiries running into 2027. The last two are not. Policy_Details
 * is an endorsement ledger — about two thirds of a 200-record sample had no
 * expiry date at all and most rows are Status "Endorsement". Renewal_Policy_
 * Details is a dead archive: even its most recently modified rows are 2020-2022
 * policies, and roughly a third carry no client link.
 *
 * That drives two decisions below. Renewal dates are computed from the live
 * modules only — an archive that expired in 2022 is not a renewal, and letting
 * it win the "next expiry" column would put a permanent false alarm against
 * half the book. The policy COUNT still spans all five, because a record linked
 * to the client is a record linked to the client and quietly dropping some
 * would understate what the CRM holds.
 *
 * ── On field names ────────────────────────────────────────────────────────
 * Every module names the same idea differently — the client lookup is
 * `Customer_Name` in four of them and `Account` in Policy_Details; the insurer
 * is `Insurance_Provider` here and `Insurance_Company` there; Motor's policy
 * type is `Cover_Type` but labelled "Policy Type". So fields are resolved from
 * module metadata by data type plus a label/api-name pattern, never hardcoded.
 * Anything not resolved falls through to the generic field list, so a module
 * that names things unexpectedly still renders rather than showing blanks.
 */

import { zohoFetch, ZohoError } from '../_shared/zoho.ts'
import { requireStaff, cors, json } from '../_shared/zohoAuth.ts'

/* Which module holds the client record. Accounts is the CRM default for an
 * organisation; an individual-lines broker may want Contacts instead. */
const CLIENT_MODULE = Deno.env.get('ZOHO_CLIENT_MODULE') || 'Accounts'

/*
 * Modules whose records are history rather than current cover. They still get
 * counted and are still readable in the detail panel, but under a separate
 * heading and excluded from renewal maths. Overridable because "legacy" is a
 * judgement about this org's data, not a fact about the schema.
 */
const LEGACY_MODULES = new Set(
  (Deno.env.get('ZOHO_LEGACY_POLICY_MODULES') ?? 'Policy_Details,Renewal_Policy_Details')
    .split(',').map((s) => s.trim()).filter(Boolean),
)

interface ZohoModule {
  api_name: string
  plural_label: string
  generated_type: string
  api_supported: boolean
}

interface PolicyModule {
  api_name: string
  label: string
  legacy: boolean
}

/*
 * Cached for the life of the instance. Module layout changes about never, and
 * re-detecting on every request would spend a credit to learn the same answer.
 */
let policyModulesCache: PolicyModule[] | null = null

/*
 * ALL the policy modules, not one.
 *
 * An earlier version picked a single best match, which would have shown a
 * client's motor cover and silently omitted their medical — plausible-looking
 * and incomplete, which is worse than an obvious failure.
 *
 * Claims are excluded: a claims register is a different thing from cover, and
 * mixing them under one heading would misrepresent both. Subforms and field
 * trackers are excluded too — they are api_supported and would otherwise slip
 * through the name match.
 */
async function detectPolicyModules(): Promise<PolicyModule[]> {
  const override = Deno.env.get('ZOHO_POLICY_MODULES')
  if (override) {
    return override.split(',').map((s) => s.trim()).filter(Boolean).map((api_name) => ({
      api_name, label: api_name, legacy: LEGACY_MODULES.has(api_name),
    }))
  }
  if (policyModulesCache) return policyModulesCache

  const res = await zohoFetch<{ modules: ZohoModule[] }>('/crm/v7/settings/modules')

  policyModulesCache = (res.modules ?? [])
    .filter((m) => m.api_supported)
    .filter((m) => m.generated_type === 'custom' || m.generated_type === 'default')
    .filter((m) => {
      const hay = `${m.api_name} ${m.plural_label}`
      return /polic|insur|cover/i.test(hay) && !/claim/i.test(hay)
    })
    .map((m) => ({
      api_name: m.api_name,
      label: m.plural_label || m.api_name,
      legacy: LEGACY_MODULES.has(m.api_name),
    }))

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
  'Exchange_Rate', 'Currency', 'Layout', 'Record_Status__s',
])

/** Flatten a Zoho record into label/value pairs a table can render. */
function presentable(
  record: Record<string, unknown>,
  skip: Set<string> = new Set(),
): Array<{ key: string; value: string }> {
  return Object.entries(record)
    .filter(([k, v]) =>
      !NOISE.has(k) && !skip.has(k) && !k.startsWith('$') &&
      v !== null && v !== '' && v !== undefined)
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
    // Empty fields are already dropped above, which matters here: the policy
    // layouts carry motor, property and medical fields on every record, so most
    // of any given policy is blank and would otherwise be a wall of "—".
    .sort((a, b) => a.key.localeCompare(b.key))
}

/*
 * Which fields a module actually has.
 *
 * v7 makes `fields` MANDATORY when fetching all records — omitting it is a 400
 * REQUIRED_PARAM_MISSING, not a default-everything. (v2 allowed it, which is why
 * most examples online do not pass it.) Cached per instance; layouts change
 * about never.
 */
interface ZohoField {
  api_name: string
  field_label?: string
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
 * Find one field by data type and a pattern tested against BOTH api_name and
 * field_label — the two disagree often enough here that matching either alone
 * misses. Motor's `Cover_Type` is labelled "Policy Type"; Policy_Details'
 * `Account` is labelled "Customer Name".
 */
function findField(
  meta: ZohoField[],
  types: string[],
  pattern: RegExp,
): string | null {
  const hit = meta.find((f) =>
    types.includes(f.data_type) && pattern.test(`${f.api_name} ${f.field_label ?? ''}`))
  return hit?.api_name ?? null
}

interface PolicyShape {
  lookup: string | null
  expiry: string | null
  expiryIsDateTime: boolean
  issued: string | null
  number: string | null
  type: string | null
  insurer: string | null
  status: string | null
  premium: string | null
}

const shapeCache = new Map<string, PolicyShape>()

/**
 * Where the interesting values live on a given policy module.
 *
 * `expiry` deliberately excludes anything matching "endorsement" or "renewal
 * receiver" — Policy_Details carries an `Endorsement_date` text field that a
 * looser pattern would happily mistake for the policy's own expiry.
 */
async function shapeOf(module: string): Promise<PolicyShape> {
  const hit = shapeCache.get(module)
  if (hit) return hit

  const meta = await fieldMetaFor(module)
  const expiry = findField(meta, ['date', 'datetime'], /expir/i)
  const expiryMeta = meta.find((f) => f.api_name === expiry)

  const shape: PolicyShape = {
    // Found by asking which lookup targets the client module rather than
    // guessing the label, because this org uses two different names for it.
    lookup: meta.find(
      (f) => f.data_type === 'lookup' && f.lookup?.module?.api_name === CLIENT_MODULE,
    )?.api_name ?? null,
    expiry,
    expiryIsDateTime: expiryMeta?.data_type === 'datetime',
    issued: findField(meta, ['date', 'datetime'], /issue/i),
    // `Name` is the Policy Number in every one of these modules.
    number: meta.some((f) => f.api_name === 'Name') ? 'Name' : null,
    type: findField(meta, ['picklist'], /polic\w*.?type|cover.?type|select.?polic/i),
    insurer: findField(meta, ['picklist'], /insurance.?(provider|company)/i),
    status: findField(meta, ['picklist'], /polic\w*.?status|status.*polic/i),
    // Anchored, because every module also carries `Premium_Paid_by_Customer`
    // and similar; metadata order puts the base premium first, so the first
    // currency field starting with "Premium" is the one wanted.
    premium: findField(meta, ['currency'], /^premium/i),
  }

  shapeCache.set(module, shape)
  return shape
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

/** `in (…)` takes at most 100 values, so ids are chunked. */
function chunked(ids: string[], size = 100): string[][] {
  const out: string[][] = []
  for (let i = 0; i < ids.length; i += size) out.push(ids.slice(i, i + size))
  return out
}

async function coql<T = Record<string, unknown>>(select_query: string) {
  return await zohoFetch<{ data?: T[] }>('/crm/v7/coql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ select_query }),
  })
}

/** The lookup column comes back as { id, name } on grouped rows. */
function lookupId(row: Record<string, unknown>, lookup: string): string {
  const v = row[lookup]
  return typeof v === 'object' && v !== null
    ? String((v as Record<string, unknown>).id ?? '')
    : String(v ?? '')
}

/*
 * Policy counts and next renewal for a page of clients.
 *
 * The obvious implementation — fetch each client's related lists and count —
 * is 50 clients × 5 modules = 250 API calls for one page. Zoho meters credits
 * per org, shared with everything else, so that is not a rounding error.
 *
 * COQL does it in ONE call per module: COUNT grouped by the client lookup,
 * filtered to the ids actually on screen. However many clients are listed, this
 * is five aggregate queries plus three more for the renewal dates — the live
 * modules only, per the note at the top of this file.
 *
 * Limits that shape this: `in` takes at most 100 values, aggregate function
 * names must be UPPERCASE, and a query returning under 200 rows costs a single
 * credit.
 */
async function policyCounts(ids: string[]) {
  const counts: Record<string, {
    total: number
    byModule: Record<string, number>
    nextExpiry: string | null
    nextExpiryModule: string | null
  }> = {}
  for (const id of ids) {
    counts[id] = { total: 0, byModule: {}, nextExpiry: null, nextExpiryModule: null }
  }
  if (!ids.length) return { counts, partial: false }

  const modules = await detectPolicyModules()
  const chunks = chunked(ids)
  let partial = false

  // Zoho stores these as plain calendar dates, so the cutoff is a plain date
  // too — no timezone maths, and a policy expiring today still counts as due.
  const today = new Date().toISOString().slice(0, 10)

  await Promise.all(
    modules.map(async (m) => {
      const shape = await shapeOf(m.api_name)
      // No lookup to the client module means these records cannot be attributed
      // to a client at all — silently counting zero would be a lie, so the
      // response is marked partial and the UI stops claiming a total.
      if (!shape.lookup) { partial = true; return }
      const lookup = shape.lookup

      try {
        for (const chunk of chunks) {
          const list = chunk.map((i) => `'${i}'`).join(',')

          const res = await coql(
            `select ${lookup}, COUNT(id) from ${m.api_name} ` +
            `where ${lookup} in (${list}) group by ${lookup}`,
          )

          for (const row of res.data ?? []) {
            /*
             * The aggregate's key is not documented consistently — it comes back
             * as "count", "COUNT(id)" or similar depending on version. Rather
             * than depend on one spelling, take the client id from the lookup
             * column and the count from whichever value is a number.
             */
            const clientId = lookupId(row, lookup)
            const n = Object.entries(row)
              .filter(([k]) => k !== lookup)
              .map(([, v]) => Number(v))
              .find((v) => Number.isFinite(v))

            if (clientId && counts[clientId] && n) {
              counts[clientId].byModule[m.label] = (counts[clientId].byModule[m.label] ?? 0) + n
              counts[clientId].total += n
            }
          }

          /*
           * Next renewal, from the live modules only. MIN over expiries still
           * ahead of today is the date an advisor has to act on; MIN over all
           * of them would just report when the client's oldest policy lapsed.
           */
          if (m.legacy || !shape.expiry || shape.expiryIsDateTime) continue

          const due = await coql(
            `select ${lookup}, MIN(${shape.expiry}) from ${m.api_name} ` +
            `where ${lookup} in (${list}) and ${shape.expiry} >= '${today}' ` +
            `group by ${lookup}`,
          )

          for (const row of due.data ?? []) {
            const clientId = lookupId(row, lookup)
            // MIN of a date comes back as a date string, so it is picked out by
            // shape rather than by being the only number on the row.
            const when = Object.entries(row)
              .filter(([k]) => k !== lookup)
              .map(([, v]) => (typeof v === 'string' ? v.slice(0, 10) : ''))
              .find((v) => /^\d{4}-\d{2}-\d{2}$/.test(v))

            const entry = clientId ? counts[clientId] : undefined
            if (entry && when && (!entry.nextExpiry || when < entry.nextExpiry)) {
              entry.nextExpiry = when
              entry.nextExpiryModule = m.label
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

function asDate(v: unknown): string | null {
  if (typeof v !== 'string' || !v) return null
  // Renewal_Policy_Details stores datetimes with a +04:00 offset. Taking the
  // leading date is what the CRM shows and avoids a UTC render shifting a
  // policy a day earlier than the broker wrote it.
  const m = v.match(/^\d{4}-\d{2}-\d{2}/)
  return m ? m[0] : null
}

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
  const shape = await shapeOf(module)
  if (!shape.lookup) throw new Error(`no lookup to ${CLIENT_MODULE}`)

  const meta = await fieldMetaFor(module)
  // COQL caps the select list at 50 fields.
  const selectable = meta
    .filter((f) => !COQL_UNSUPPORTED.has(f.data_type) && !NOISE.has(f.api_name))
    .map((f) => f.api_name)
    .slice(0, 49)

  const fields = ['id', ...selectable].join(', ')

  const res = await coql(
    `select ${fields} from ${module} where ${shape.lookup} = '${clientId}' limit 200`,
  )

  // Everything promoted to a named column is dropped from the generic list, so
  // the same value never appears twice in one card.
  const promoted = new Set(
    [shape.number, shape.type, shape.insurer, shape.status, shape.premium,
      shape.issued, shape.expiry, shape.lookup].filter(Boolean) as string[],
  )

  const val = (p: Record<string, unknown>, key: string | null) => {
    if (!key) return null
    const v = p[key]
    if (v === null || v === undefined || v === '') return null
    return typeof v === 'object' && 'name' in (v as Record<string, unknown>)
      ? String((v as Record<string, unknown>).name)
      : String(v)
  }

  return (res.data ?? [])
    .map((p) => ({
      id: String(p.id),
      number: val(p, shape.number),
      type: val(p, shape.type),
      insurer: val(p, shape.insurer),
      status: val(p, shape.status),
      premium: val(p, shape.premium),
      issuedOn: asDate(shape.issued ? p[shape.issued] : null),
      expiresOn: asDate(shape.expiry ? p[shape.expiry] : null),
      fields: presentable(p, promoted),
    }))
    // Soonest to lapse first, and policies with no expiry last — those are the
    // endorsement rows, which are context rather than something to act on.
    .sort((a, b) => {
      if (a.expiresOn && b.expiresOn) return b.expiresOn.localeCompare(a.expiresOn)
      if (a.expiresOn) return -1
      if (b.expiresOn) return 1
      return (b.issuedOn ?? '').localeCompare(a.issuedOn ?? '')
    })
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
        return { module: m.api_name, label: m.label, legacy: m.legacy, policies, note: null as string | null }
      } catch (e) {
        return {
          module: m.api_name,
          label: m.label,
          legacy: m.legacy,
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

  const live = shown.filter((g) => !g.legacy)
  const today = new Date().toISOString().slice(0, 10)
  const active = live.flatMap((g) => g.policies).filter((p) => p.expiresOn && p.expiresOn >= today)

  return {
    found: true as const,
    client: {
      id: String(client.id),
      name: String(client.Account_Name ?? client.Full_Name ?? client.Last_Name ?? 'Unnamed'),
      fields: presentable(client),
    },
    policyModules: modules.map((m) => m.api_name),
    policyGroups: live,
    historicalGroups: shown.filter((g) => g.legacy),
    totalPolicies: groups.reduce((n, g) => n + g.policies.length, 0),
    activePolicies: active.length,
    nextExpiry: active.map((p) => p.expiresOn!).sort()[0] ?? null,
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
     * waiting on eight aggregate queries. It also means a counts failure costs
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
