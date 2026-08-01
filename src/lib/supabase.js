import { createClient } from '@supabase/supabase-js'

// Credentials come from Vite env vars (safe to expose the anon key in the
// frontend — Row Level Security protects the data). Set these in a .env.local
// file locally and in the Vercel project's Environment Variables:
//   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
//   VITE_SUPABASE_ANON_KEY=<anon public key>
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null
export const isSupabaseConfigured = Boolean(supabase)

const fnUrl = (name) => (url ? `${url.replace(/\/$/, '')}/functions/v1/${name}` : null)
const FUNCTION_URL = fnUrl('submit-lead')

const currentPage = () => (typeof window !== 'undefined' ? window.location.pathname : null)

/**
 * Send a lead to the `submit-lead` edge function, which stores it and emails a
 * copy to the visitor plus an alert to the advisor team.
 *
 * @param {object} lead
 * @param {string}  lead.name
 * @param {string}  lead.email
 * @param {string} [lead.phone]
 * @param {string} [lead.message]
 * @param {string} [lead.service]      Human label, e.g. 'Motor Fleet Insurance'
 * @param {string} [lead.source]       Where it came from, e.g. 'industry-page'
 * @param {string} [lead.preferredTime]
 * @param {object} [lead.details]      Raw tool answers
 * @param {string} [lead.toolId]       Interactive tool identifier
 * @param {object} [lead.report]       Computed result: { score, headline, summary, findings[], benchmark }
 * @param {string} [lead.reportTitle]  Subject line of the visitor's email
 * @param {string} [lead.honeypot]     Hidden anti-bot field; non-empty is silently discarded
 *
 * @returns {Promise<{ok: true, id?: string, reference?: string, emailed: boolean}>}
 * @throws  {Error} 'not-configured' when the env vars are unset, so callers can
 *          fall back gracefully in previews.
 */
export async function submitLead(lead) {
  if (!supabase) throw new Error('not-configured')

  const payload = { ...lead, page: currentPage(), _hp: lead.honeypot ?? '' }
  delete payload.honeypot

  try {
    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (res.ok) return await res.json()

    // A 400 means we sent something the function rejected — that is our bug or
    // a failed validation, and retrying the same payload will not help.
    if (res.status === 400) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'invalid-payload')
    }

    // Anything else (function paused, misconfigured, 5xx) falls through to the
    // direct insert below so the lead still lands.
    console.warn(`submit-lead returned ${res.status}; falling back to direct insert`)
  } catch (err) {
    if (err.message === 'invalid-payload') throw err
    console.warn('submit-lead unreachable; falling back to direct insert', err)
  }

  return directInsert(lead)
}

/**
 * Last-resort path: write straight to the table with the anon key, exactly as
 * the site did before the edge function existed. No email is sent — the row is
 * tagged `email_status: 'direct-insert'` so these can be found and followed up.
 *
 * NOTE: as of 1 Aug 2026 the `leads` table has RLS on with no policies, so the
 * anon key can no longer insert and this path throws instead of saving. That is
 * deliberate — it closes the public write path, and a visitor seeing an error
 * beats a lead disappearing silently. Kept in place because it starts working
 * again the moment an anon INSERT policy is restored.
 */
async function directInsert(lead) {
  const { data, error } = await supabase
    .from('leads')
    .insert([
      {
        name: lead.name || null,
        email: lead.email || null,
        phone: lead.phone || null,
        message: lead.message || null,
        service: lead.service || null,
        source: lead.source || 'website',
        page: currentPage(),
        preferred_time: lead.preferredTime || null,
        whatsapp_opt_in: lead.whatsappOptIn ?? null,
        whatsapp_number: lead.whatsappNumber || null,
        details: lead.details || null,
        tool_id: lead.toolId || null,
        score: typeof lead.report?.score === 'number' ? Math.round(lead.report.score) : null,
        report: lead.report || null,
        email_status: 'direct-insert',
      },
    ])
    .select('id')
    .single()

  if (error) throw error
  return { ok: true, id: data?.id, emailed: false }
}

/**
 * Look up an enquiry by the reference we issued plus the email it was submitted
 * with. Both are required — the reference is short enough to read down a phone,
 * so it is not a credential on its own.
 *
 * Goes through the `lead-status` edge function rather than reading the table:
 * the public read path on `leads` is closed and should stay that way. There is
 * no fallback here, because the fallback would be exactly the thing we closed.
 *
 * @returns {Promise<{found: boolean, reference?: string, firstName?: string,
 *   submittedAt?: string, service?: string, status?: string,
 *   statusLabel?: string, statusDetail?: string}>}
 */
export async function lookupLeadStatus({ reference, email }) {
  if (!supabase) throw new Error('not-configured')

  const res = await fetch(fnUrl('lead-status'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ reference, email }),
  })

  if (res.status === 400) throw new Error('invalid-input')
  if (!res.ok) throw new Error('lookup-failed')
  return res.json()
}
