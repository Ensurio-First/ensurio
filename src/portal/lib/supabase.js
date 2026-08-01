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

/**
 * Is the signed-in user actually staff?
 *
 * Signing in only proves control of an email address. Authorisation lives in
 * the portal_staff allowlist, and every policy is gated on it — so without this
 * check a non-staff account would reach the dashboard and simply see an empty
 * table, which reads as "no leads yet" rather than "you should not be here".
 *
 * @returns {Promise<boolean>}
 */
export async function isStaff() {
  if (!supabase) return false
  const { data, error } = await supabase.rpc('is_portal_staff')
  if (error) {
    console.error('staff check failed', error)
    return false
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
