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

const ACCOUNTS_URL = 'https://accounts.zoho.eu'
const API_URL = 'https://www.zohoapis.eu'

/*
 * Access tokens last an hour, and minting one costs a round trip plus a slice of
 * Zoho's rate limit. An edge function instance is reused across requests, so a
 * module-level cache saves a mint on every call after the first — but it is
 * per-instance and vanishes on cold start, which is why nothing depends on it
 * being warm.
 *
 * Refreshed a minute early. A token that expires between the check and Zoho
 * receiving the request would surface as a spurious 401.
 */
let cached: { token: string; expiresAt: number } | null = null

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

/** Mint (or reuse) an access token from the long-lived refresh token. */
export async function zohoAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token
  }

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
    throw new ZohoError(
      `token refresh failed: ${json.error ?? res.status}`,
      502,
      // Never log or return the body itself — it can carry token material.
      { zohoError: json.error ?? null },
    )
  }

  cached = {
    token: json.access_token as string,
    expiresAt: Date.now() + (Number(json.expires_in ?? 3600) * 1000),
  }
  return cached.token
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
