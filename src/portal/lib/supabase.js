import { createClient } from '@supabase/supabase-js'

/*
 * The portal's own Supabase client.
 *
 * Separate from src/lib/supabase.js on purpose: that one is the anonymous
 * client the public site uses to post leads, and it must never carry a staff
 * session. This is a different build with a different storage key, so a signed-
 * in advisor on the portal cannot leak a session into the marketing site (or
 * the reverse) if the two are ever served from the same origin.
 *
 * Same env vars as the public site. The anon key is safe to ship — RLS is what
 * protects the data, and the policies require an allowlisted staff JWT.
 */
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(url && anonKey)

export const supabase = isConfigured
  ? createClient(url, anonKey, {
      auth: {
        storageKey: 'insurefirst-portal-auth',
        persistSession: true,
        autoRefreshToken: true,
        // The magic link comes back as a hash fragment; let the client consume
        // it on load rather than leaving the token sitting in the URL bar.
        detectSessionInUrl: true,
      },
    })
  : null

/*
 * An expired access token is reported as a 401, not as an answer.
 *
 * PostgREST uses PGRST301 for an expired JWT, but the shape has moved between
 * versions and supabase-js sometimes surfaces only the message, so the text is
 * checked too rather than trusting one code.
 */
function isAuthError(error) {
  const code = String(error?.code ?? '')
  if (code === 'PGRST301' || code === 'PGRST302' || code === '401') return true
  return /\bjwt\b|token .*expired|expired .*token/i.test(String(error?.message ?? ''))
}

/**
 * Is the signed-in user actually staff?
 *
 * Signing in only proves control of an email address. Authorisation lives in
 * the portal_staff allowlist, and every policy is gated on it — so without this
 * check a non-staff account would reach the dashboard and simply see an empty
 * table, which reads as "no leads yet" rather than "you should not be here".
 *
 * Four answers, not two. "You are not staff" and "I could not ask" are opposite
 * problems and this used to collapse both into false — so an access token that
 * expired while the tab sat open told an allowlisted advisor they had been
 * removed from the roster, and invited them to go and bother an admin about a
 * roster that was never wrong. The session is refreshed once and the question
 * asked again before any of that is concluded.
 *
 * @returns {Promise<true|false|'expired'|'error'>}
 */
export async function isStaff() {
  if (!supabase) return false

  let { data, error } = await supabase.rpc('is_portal_staff')

  if (error && isAuthError(error)) {
    // autoRefreshToken handles this on a timer, which does not help if the
    // machine slept through the window or the tab was throttled. Force it.
    const { error: refreshFailed } = await supabase.auth.refreshSession()
    if (refreshFailed) return 'expired'

    ;({ data, error } = await supabase.rpc('is_portal_staff'))
    if (error) return isAuthError(error) ? 'expired' : 'error'
  }

  if (error) {
    console.error('staff check failed', error)
    return 'error'
  }
  return data === true
}

/**
 * Every lead, newest first. RLS does the filtering — an unauthorised caller
 * gets an empty array rather than an error.
 *
 * @returns {Promise<Array<object>>}
 */
export async function fetchLeads() {
  if (!supabase) throw new Error('not-configured')
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Call an edge function with the signed-in staff session.
 *
 * supabase.functions.invoke attaches the session token, which is what the
 * function's staff check reads — so authorisation is the portal_staff allowlist
 * in both places, with no second rule to keep in step.
 *
 * invoke() reports a non-2xx as an opaque "Edge Function returned a non-2xx
 * status code", which tells a person nothing. The real body is on error.context,
 * so it is unwrapped here and the function's own message surfaces instead.
 */
export async function invokeFn(name, body = {}) {
  if (!supabase) throw new Error('not-configured')

  const { data, error } = await supabase.functions.invoke(name, { body })
  if (!error) return data

  let detail = null
  try { detail = await error.context?.json() } catch { /* not json */ }

  if (detail?.rateLimited) {
    throw new Error('Zoho is rate limiting us. Wait a minute and try again.')
  }
  if (detail?.error === 'not-staff' || detail?.error === 'sign-in-required') {
    throw new Error('Your portal access could not be confirmed — try signing in again.')
  }

  // Zoho's own error code says far more than the HTTP status does, so it goes
  // on screen rather than only into the logs.
  const zoho = detail?.zohoCode
    ? ` [${detail.zohoCode}${detail.zohoDetails?.api_name ? `: ${detail.zohoDetails.api_name}` : ''}]`
    : ''
  throw new Error(`${detail?.error || error.message || 'Request failed.'}${zoho}`)
}

/* ── CRM mirror ───────────────────────────────────────────────────────────
 *
 * These read public.crm_* rather than calling Zoho. The Clients tab used to hit
 * the CRM on every render — one list call plus eight aggregates, two to five
 * seconds, repeated on every tab switch — against an API that meters credits
 * and caps token mints. Now a scheduled sync does that once and the portal
 * reads Postgres, which also makes sorting by renewal date across the whole
 * book possible: expiry lives on the policy modules, so Zoho could never order
 * a client query by it.
 */

const CLIENTS_PER_PAGE = 50

/**
 * A page of clients with their policy totals and next renewal.
 *
 * @param {{query?: string, page?: number, sort?: 'expiry'|'name'|'recent'}} opts
 */
export async function fetchClients({ query = '', page = 1, sort = 'expiry' } = {}) {
  if (!supabase) throw new Error('not-configured')

  const from = (page - 1) * CLIENTS_PER_PAGE
  let q = supabase.from('crm_client_summary').select('*', { count: 'exact' })

  // One box, three fields. Postgres `or` with ilike covers what Zoho's word
  // search did, without the round trip.
  if (query) {
    const safe = query.replace(/[%,()]/g, ' ').trim()
    if (safe) q = q.or(`name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`)
  }

  if (sort === 'expiry') {
    // Clients with nothing due sort last rather than first — a null renewal is
    // the absence of urgency, not the most urgent thing on the list.
    q = q.order('next_expiry', { ascending: true, nullsFirst: false })
  } else if (sort === 'name') {
    q = q.order('name', { ascending: true })
  } else {
    q = q.order('synced_at', { ascending: false })
  }

  const { data, error, count } = await q.range(from, from + CLIENTS_PER_PAGE - 1)
  if (error) throw error

  return {
    rows: data ?? [],
    total: count ?? 0,
    page,
    hasMore: (count ?? 0) > from + CLIENTS_PER_PAGE,
  }
}

/** One client's policies, soonest to lapse first, no-expiry rows last. */
export async function fetchClientPolicies(clientId) {
  if (!supabase) throw new Error('not-configured')

  const { data, error } = await supabase
    .from('crm_policies')
    .select('*')
    .eq('client_id', clientId)
    .order('expires_on', { ascending: false, nullsFirst: false })
    .order('issued_on', { ascending: false, nullsFirst: false })

  if (error) throw error
  return data ?? []
}

/** The most recent sync, successful or not. Null before the first ever run. */
export async function fetchLastSync() {
  if (!supabase) throw new Error('not-configured')

  const { data, error } = await supabase
    .from('crm_sync_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Pull from Zoho now. Slow by nature — it pages the CRM — so the caller should
 * say so on screen rather than leaving a button looking stuck.
 */
export async function runSync(mode = 'incremental') {
  return await invokeFn('zoho-sync', { mode })
}

/**
 * Move a lead to a new workflow stage.
 *
 * `lead_status` is the only column staff hold an UPDATE grant on, so this is
 * the whole of what the portal can write. `lead_status_updated_at` and
 * `_by` come back stamped by a database trigger — they are not sent from here,
 * and could not be if we tried.
 *
 * @param {string} id      Lead uuid
 * @param {string} status  received | contacted | in-review | advising | closed
 * @returns {Promise<{id: string, lead_status: string, lead_status_updated_at: string, lead_status_updated_by: string}>}
 */
export async function updateLeadStatus(id, status) {
  if (!supabase) throw new Error('not-configured')

  const { data, error } = await supabase
    .from('leads')
    .update({ lead_status: status })
    .eq('id', id)
    .select('id, lead_status, lead_status_updated_at, lead_status_updated_by')
    .single()

  // RLS returns no rows rather than an error when the caller is not staff, and
  // .single() turns that into PGRST116. Say so plainly instead of surfacing a
  // Postgrest code to someone trying to mark a call as made.
  if (error) {
    if (error.code === 'PGRST116') throw new Error('Not allowed — your access may have been revoked.')
    throw error
  }
  return data
}
