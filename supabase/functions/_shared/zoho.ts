/*
 * Zoho OAuth and API access, shared by every Zoho-facing function.
 *
 * The refresh token never expires and carries full CRM scope, so it lives in
 * edge function secrets and is read only here. Nothing in this module is
 * reachable from a browser, and nothing it returns should be handed to one
 * without deciding, per field, that a visitor may see it.
 *
 * EU datacentre. This org's api_domain came back from the token exchange as
 * https://www.zohoapis.eu — the .com endpoints that nearly every tutorial shows
 * will fail authentication against it.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2'

const ACCOUNTS_URL = 'https://accounts.zoho.eu'
const API_URL = 'https://www.zohoapis.eu'

/*
 * Access tokens last an hour. Minting one is not merely a round trip — Zoho
 * caps how many a single refresh token may mint in a rolling ten-minute window
 * and answers `Access Denied` for the remainder of it once the cap is passed,
 * which takes the whole integration down rather than slowing it.
 *
 * A module-level cache alone was not enough to stay under that cap, in two
 * separate ways. It is per-isolate, so every cold start minted again; and
 * nothing serialised the miss, so the five module-metadata reads the Clients
 * tab issues in parallel all saw an empty cache and all minted. One page view
 * cost a double-figure number of tokens and the cap fell over in about a
 * minute.
 *
 * So there are three layers now, cheapest first:
 *   cached    this isolate, no I/O at all
 *   inFlight  one mint per isolate at a time; concurrent callers join it
 *   store     one row in Postgres, shared by every isolate
 *
 * Refreshed a minute early. A token that expires between the check and Zoho
 * receiving the request would surface as a spurious 401.
 */
let cached: { token: string; expiresAt: number } | null = null
let inFlight: Promise<string> | null = null

const FRESH_FOR = 60_000

const usable = (c: { expiresAt: number } | null): boolean =>
  Boolean(c && c.expiresAt > Date.now() + FRESH_FOR)

export class ZohoError extends Error {
  constructor(message: string, readonly status: number, readonly detail?: unknown) {
    super(message)
    this.name = 'ZohoError'
  }
}

function requireEnv(name: string): string {
  const v = Deno.env.get(name)
  if (!v) throw new ZohoError(`${name} is not set`, 500)
  return v
}

/*
 * The shared store, reached with the service-role key that Supabase injects
 * into every edge function. Both halves are best-effort on purpose: if the
 * store is unreachable the isolate still works off its own cache, so a broken
 * table degrades this to the old behaviour rather than taking Zoho offline.
 */
function storeClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

async function tokenFromStore(): Promise<{ token: string; expiresAt: number } | null> {
  try {
    const db = storeClient()
    if (!db) return null
    const { data, error } = await db.rpc('zoho_token_get')
    if (error || !data?.length) return null
    const row = data[0] as { access_token: string; expires_at: string }
    return { token: row.access_token, expiresAt: Date.parse(row.expires_at) }
  } catch {
    return null
  }
}

async function tokenToStore(token: string, expiresAt: number): Promise<void> {
  try {
    const db = storeClient()
    if (!db) return
    await db.rpc('zoho_token_put', {
      p_token: token,
      p_expires_at: new Date(expiresAt).toISOString(),
    })
  } catch { /* the isolate cache still holds it */ }
}

/** Exchange the long-lived refresh token for an access token. */
async function mint(): Promise<{ token: string; expiresAt: number }> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: requireEnv('ZOHO_REFRESH_TOKEN'),
    client_id: requireEnv('ZOHO_CLIENT_ID'),
    client_secret: requireEnv('ZOHO_CLIENT_SECRET'),
  })

  const res = await fetch(`${ACCOUNTS_URL}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const json = await res.json().catch(() => ({}))

  /*
   * Zoho answers a refused refresh with HTTP 200 and an `error` key, not a 4xx.
   * Checking res.ok alone would cache the string "undefined" as a token and
   * every downstream call would fail with a confusing 401.
   */
  if (!res.ok || json.error || !json.access_token) {
    /*
     * `Access Denied` here usually means the ten-minute mint cap, not a bad
     * credential — the two are indistinguishable in Zoho's reply and look
     * identical to whoever is reading the screen. Saying so turns "the tokens
     * you just set up are wrong" into "wait a few minutes".
     */
    const hint = String(json.error ?? '') === 'Access Denied'
      ? ' (a wrong client secret, or too many tokens minted in ten minutes — if it was working a moment ago, it is the second)'
      : ''
    throw new ZohoError(
      `token refresh failed: ${json.error ?? res.status}${hint}`,
      502,
      // Never log or return the body itself — it can carry token material.
      { zohoError: json.error ?? null },
    )
  }

  return {
    token: json.access_token as string,
    expiresAt: Date.now() + (Number(json.expires_in ?? 3600) * 1000),
  }
}

/**
 * Shared store first, mint only if that comes back empty or stale.
 *
 * `skipStore` is what a 401 retry needs. A token can be revoked or rescoped
 * before its stated expiry, and the store would hand back that same dead token
 * to every isolate forever — the retry has to reach past it to Zoho, and
 * overwrite the row on the way back.
 */
async function obtain(skipStore = false): Promise<string> {
  if (!skipStore) {
    const shared = await tokenFromStore()
    if (usable(shared)) {
      cached = shared
      return shared!.token
    }
  }

  const fresh = await mint()
  cached = fresh
  await tokenToStore(fresh.token, fresh.expiresAt)
  return fresh.token
}

/**
 * Mint (or reuse) an access token from the long-lived refresh token.
 *
 * Concurrent callers that miss the cache join one in-flight attempt rather than
 * racing to mint. That is the whole point: without it, the parallel reads this
 * codebase does on purpose turn one cache miss into five or eight mints.
 */
export async function zohoAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && usable(cached)) return cached!.token
  if (forceRefresh) cached = null

  /*
   * An attempt already running is joined even when forceRefresh is set. It may
   * hand back the token we were trying to replace, and that is the better
   * trade: zohoFetch retries once and then reports honestly, whereas letting
   * every parallel 401 start its own refresh is exactly the stampede that
   * trips Zoho's cap.
   */
  if (inFlight) return inFlight

  inFlight = obtain(forceRefresh).finally(() => { inFlight = null })
  return inFlight
}

/**
 * Call a Zoho API path, e.g. `/crm/v7/settings/modules`.
 *
 * Retries once on 401 with a freshly minted token: a cached token can be
 * invalidated server-side (revoked, scope changed) before its stated expiry,
 * and one retry turns that from an outage into a hiccup.
 */
export async function zohoFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
  attempt = 0,
): Promise<T> {
  const token = await zohoAccessToken(attempt > 0)

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Zoho-oauthtoken ${token}`,
    },
  })

  if (res.status === 401 && attempt === 0) {
    cached = null
    return zohoFetch<T>(path, init, 1)
  }

  // 204 is Zoho's "no records matched", which is an empty result and not a fault.
  if (res.status === 204) return { data: [] } as T

  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    const body = json as Record<string, unknown>
    /*
     * Zoho's own code and details are the only parts worth propagating — the
     * HTTP status alone sends you looking in the wrong place. REQUIRED_PARAM_MISSING
     * with details.api_name says exactly which parameter, which is the difference
     * between a fix and an afternoon.
     */
    throw new ZohoError(
      `zoho ${path} returned ${res.status}${body?.code ? ` (${body.code})` : ''}`,
      res.status === 429 ? 429 : 502,
      { code: body?.code ?? null, message: body?.message ?? null, details: body?.details ?? null },
    )
  }

  return json as T
}

/** Books requires the organisation id on every call; it is not part of the token. */
export const booksOrgId = () => requireEnv('ZOHO_BOOKS_ORG_ID')

export const zohoApiUrl = API_URL
