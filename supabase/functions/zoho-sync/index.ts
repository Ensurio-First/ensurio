/*
 * zoho-sync — pulls the CRM into public.crm_clients / crm_policies.
 *
 * ── Why a mirror at all ───────────────────────────────────────────────────
 * The Clients tab used to read Zoho live: one list call plus eight COQL
 * aggregates per view, two to five seconds, repeated on every tab switch.
 * Zoho meters credits per org and caps access-token mints per ten minutes, so
 * that design did not merely feel slow — it fell over when the tab was used the
 * way a tab gets used.
 *
 * It also could not do the thing the tab is for. Expiry lives on the policy
 * modules, so Zoho cannot order a CLIENT query by renewal date; the live
 * version could only sort the fifty rows already on screen. Postgres sorts the
 * whole book.
 *
 * ── Incremental by Modified_Time ──────────────────────────────────────────
 * Records come back newest-modified first, and the pass stops at the first one
 * older than the previous successful sync. A routine run therefore costs a
 * page or two per module rather than the whole CRM. `mode: full` ignores the
 * watermark, which is what a first run and any recovery needs.
 *
 * Deletions are the known gap: a record deleted in Zoho stops being returned
 * rather than being reported, so an incremental pass cannot see it. A full pass
 * marks anything it did not touch — see `prune` below.
 */

import { zohoFetch, ZohoError } from '../_shared/zoho.ts'
import { requireStaff, cors, json } from '../_shared/zohoAuth.ts'
import {
  CLIENT_MODULE, detectPolicyModules, readableFields, shapeOf,
  text, lookupId, asDate,
} from '../_shared/zohoCrm.ts'
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2'

/* Zoho's maximum page size. Fewer, larger pages is fewer credits. */
const PER_PAGE = 200

/* A guard, not a target. Something has gone wrong if a sync needs this many. */
const MAX_PAGES_PER_MODULE = 60

function db(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('service-role env missing')
  return createClient(url, key, { auth: { persistSession: false } })
}

interface PageResult {
  rows: Array<Record<string, unknown>>
  calls: number
}

/**
 * Every record modified since `since`, newest first.
 *
 * Paging stops on three conditions: Zoho says there are no more, a record older
 * than the watermark appears, or the page guard trips. The watermark check is
 * what makes this incremental — and it is only safe because the sort is by
 * Modified_Time descending, so the first old record means the rest are older.
 */
async function readSince(
  module: string,
  fields: string[],
  since: string | null,
): Promise<PageResult> {
  const rows: Array<Record<string, unknown>> = []
  let calls = 0
  let pageToken: string | null = null

  for (let page = 1; page <= MAX_PAGES_PER_MODULE; page++) {
    const q = new URLSearchParams({
      fields: fields.join(','),
      per_page: String(PER_PAGE),
      sort_by: 'Modified_Time',
      sort_order: 'desc',
    })
    // Past 2000 records Zoho stops accepting `page` and wants the token it
    // handed back on the previous call.
    if (pageToken) q.set('page_token', pageToken)
    else q.set('page', String(page))

    const res = await zohoFetch<{
      data?: Array<Record<string, unknown>>
      info?: { more_records?: boolean; next_page_token?: string | null }
    }>(`/crm/v7/${module}?${q}`)
    calls++

    const batch = res.data ?? []
    if (!batch.length) break

    let reachedWatermark = false
    for (const r of batch) {
      const modified = String(r.Modified_Time ?? '')
      if (since && modified && modified <= since) { reachedWatermark = true; break }
      rows.push(r)
    }

    if (reachedWatermark || !res.info?.more_records) break
    pageToken = res.info?.next_page_token ?? null
  }

  return { rows, calls }
}

/* Upserts in batches. One statement per 500 rows keeps a big first sync from
 * building a single request Postgres has to parse in one go. */
async function upsert(sb: SupabaseClient, table: string, rows: unknown[]) {
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await sb.from(table).upsert(rows.slice(i, i + 500), { onConflict: 'id' })
    if (error) throw new Error(`${table} upsert failed: ${error.message}`)
  }
}

async function syncClients(sb: SupabaseClient, since: string | null) {
  // The list columns, plus whatever else the module has, so `raw` is complete.
  const fields = await readableFields(CLIENT_MODULE)
  const { rows, calls } = await readSince(CLIENT_MODULE, fields, since)

  const mapped = rows.map((r) => ({
    id: String(r.id),
    name: text(r.Account_Name ?? r.Full_Name ?? r.Last_Name ?? r.Name) ?? 'Unnamed',
    email: text(r.Email ?? r.Primary_Email),
    phone: text(r.Phone ?? r.Mobile),
    city: text(r.Billing_City ?? r.Mailing_City),
    raw: r,
    modified_at: r.Modified_Time ?? null,
    synced_at: new Date().toISOString(),
  }))

  await upsert(sb, 'crm_clients', mapped)
  return { seen: mapped.length, calls }
}

async function syncPolicies(sb: SupabaseClient, since: string | null) {
  const modules = await detectPolicyModules()
  let seen = 0
  let calls = 0
  const perModule: Record<string, number> = {}

  /*
   * Sequential, not parallel. This is the opposite of the read path's fan-out
   * and deliberately so: a sync has no one waiting on it, and five modules
   * paging at once is five times the burst against an API that rate-limits.
   */
  for (const m of modules) {
    const shape = await shapeOf(m.api_name)
    // Without a lookup to the client module these records cannot be attributed
    // to anyone, so they would land as permanent orphans. Skipped and reported.
    if (!shape.lookup) { perModule[m.api_name] = -1; continue }

    const fields = await readableFields(m.api_name)
    const { rows, calls: c } = await readSince(m.api_name, fields, since)
    calls += c

    const mapped = rows.map((r) => ({
      id: String(r.id),
      module: m.api_name,
      module_label: m.label,
      legacy: m.legacy,
      client_id: lookupId(r[shape.lookup!]),
      policy_number: shape.number ? text(r[shape.number]) : null,
      policy_type: shape.type ? text(r[shape.type]) : null,
      insurer: shape.insurer ? text(r[shape.insurer]) : null,
      status: shape.status ? text(r[shape.status]) : null,
      premium: shape.premium ? text(r[shape.premium]) : null,
      issued_on: shape.issued ? asDate(r[shape.issued]) : null,
      expires_on: shape.expiry ? asDate(r[shape.expiry]) : null,
      raw: r,
      modified_at: r.Modified_Time ?? null,
      synced_at: new Date().toISOString(),
    }))

    await upsert(sb, 'crm_policies', mapped)
    seen += mapped.length
    perModule[m.api_name] = mapped.length
  }

  return { seen, calls, perModule }
}

/*
 * Records deleted in Zoho simply stop being returned, so no pass can observe
 * one directly. After a FULL sync every live record has just been re-stamped,
 * which means anything still carrying an older synced_at is gone from the CRM
 * and is deleted here too. Never run after an incremental pass — that would
 * delete the entire book except the handful of recently modified rows.
 */
async function prune(sb: SupabaseClient, startedAt: string) {
  const dropped: Record<string, number> = {}
  for (const table of ['crm_policies', 'crm_clients']) {
    const { data, error } = await sb.from(table).delete().lt('synced_at', startedAt).select('id')
    if (error) throw new Error(`${table} prune failed: ${error.message}`)
    dropped[table] = data?.length ?? 0
  }
  return dropped
}

async function runSync(mode: 'incremental' | 'full') {
  const sb = db()
  const startedAt = new Date().toISOString()

  const { data: run, error: runErr } = await sb
    .from('crm_sync_runs')
    .insert({ mode, started_at: startedAt })
    .select('id')
    .single()
  if (runErr) throw new Error(`could not open sync run: ${runErr.message}`)

  try {
    /*
     * The watermark is the START of the last successful run, not its end. A
     * record modified while that run was mid-flight may have been read before
     * the edit landed, and starting from the finish time would skip it forever.
     * Re-reading a few records is free; missing one is not.
     */
    let since: string | null = null
    if (mode === 'incremental') {
      const { data: last } = await sb
        .from('crm_sync_runs')
        .select('started_at')
        .eq('ok', true)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      since = last?.started_at ?? null
    }

    const clients = await syncClients(sb, since)
    const policies = await syncPolicies(sb, since)
    const pruned = mode === 'full' ? await prune(sb, startedAt) : null

    await sb.from('crm_sync_runs').update({
      finished_at: new Date().toISOString(),
      ok: true,
      clients_seen: clients.seen,
      policies_seen: policies.seen,
      api_calls: clients.calls + policies.calls,
      detail: { since, perModule: policies.perModule, pruned },
    }).eq('id', run.id)

    return {
      ok: true,
      mode,
      since,
      clients: clients.seen,
      policies: policies.seen,
      apiCalls: clients.calls + policies.calls,
      perModule: policies.perModule,
      pruned,
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'sync failed'
    await sb.from('crm_sync_runs').update({
      finished_at: new Date().toISOString(),
      ok: false,
      error: message,
    }).eq('id', run.id)
    throw e
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* defaults */ }

  const mode = body.mode === 'full' ? 'full' : 'incremental'

  /*
   * Two callers, two ways in. A staff member pressing "Sync now" arrives with a
   * user JWT and goes through the same allowlist as everything else. The cron
   * job has no user, so it presents a shared secret instead — checked with a
   * length-equality guard rather than a plain === to avoid leaking the answer
   * one character at a time.
   */
  const secret = Deno.env.get('ZOHO_SYNC_SECRET')
  const offered = req.headers.get('x-sync-secret') ?? ''
  const machine = Boolean(secret && offered.length === secret.length && offered === secret)

  if (!machine) {
    const denied = await requireStaff(req)
    if (denied) return denied
  }

  try {
    return json(await runSync(mode))
  } catch (e) {
    const status = e instanceof ZohoError ? e.status : 500
    console.error('zoho-sync failed', e instanceof Error ? e.message : e)
    return json({ ok: false, error: e instanceof Error ? e.message : 'sync failed' }, status)
  }
})
