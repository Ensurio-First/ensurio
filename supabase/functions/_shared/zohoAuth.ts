import { createClient } from 'jsr:@supabase/supabase-js@2'

/*
 * Shared staff gate for Zoho-facing functions.
 *
 * Authorisation is asked of the database using the CALLER'S token, reusing
 * is_portal_staff() rather than re-implementing the rule here. Removing someone
 * from portal_staff therefore revokes every one of these endpoints at once, with
 * no redeploy and no second list to keep in step.
 */

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })

/**
 * @returns null when the caller is staff, or a Response to return as-is.
 */
export async function requireStaff(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get('Authorization') ?? ''
  const url = Deno.env.get('SUPABASE_URL')
  const anon = Deno.env.get('SUPABASE_ANON_KEY')

  if (!url || !anon) {
    console.error('SUPABASE_URL / SUPABASE_ANON_KEY missing from function env')
    return json({ error: 'function-misconfigured' }, 500)
  }
  if (!authHeader) return json({ error: 'sign-in-required' }, 401)

  const supabase = createClient(url, anon, { global: { headers: { Authorization: authHeader } } })
  const { data: isStaff, error } = await supabase.rpc('is_portal_staff')

  if (error) {
    console.error('staff check failed', error.message)
    return json({ error: 'staff-check-failed' }, 403)
  }
  if (isStaff !== true) return json({ error: 'not-staff' }, 403)
  return null
}
