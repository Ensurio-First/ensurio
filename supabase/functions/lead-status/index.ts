/*
 * lead-status — look up an enquiry by the reference we issued.
 *
 * The obvious way to build this would be to let the browser read the `leads`
 * table. That would mean re-opening the public read path we deliberately closed,
 * and no RLS policy can express "only the row whose reference you happen to
 * know" without also exposing the shape of everything else.
 *
 * Instead the lookup happens here, with the service-role key, and the caller
 * must present BOTH the reference and the email the enquiry was submitted with.
 * The reference alone is not a credential: it is short enough to read down a
 * phone. The pair is — you cannot guess an email for a reference you do not
 * already own.
 *
 * The response is deliberately thin: status, dates, and what it was about.
 * Never the answers, the report, or the phone number, because a lookup endpoint
 * should not become a way to read back someone's submission.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
})

// Public-facing wording for each workflow stage. The database stores the key;
// what the visitor reads lives here so the team can restage without a migration
// changing anything a customer sees.
const STAGE: Record<string, { label: string; detail: string }> = {
  received: {
    label: 'Received',
    detail: 'Your enquiry is with us and queued for an advisor. Most are picked up within one business day.',
  },
  contacted: {
    label: 'Advisor assigned',
    detail: 'An advisor has your details and has either been in touch or is about to be.',
  },
  'in-review': {
    label: 'Under review',
    detail: 'We are reading your answers against your policy documents. This is the stage that takes the longest, because it is the one worth doing properly.',
  },
  advising: {
    label: 'Advice in progress',
    detail: 'We are actively working with you — or with your insurer on your behalf.',
  },
  closed: {
    label: 'Closed',
    detail: 'This enquiry is complete. If something has changed, start a new one or call us and quote this reference.',
  },
}

const isValidEmail = (v: unknown) =>
  typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req.headers.get('origin'))

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method-not-allowed' }), {
      status: 405, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid-json' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const reference = typeof body.reference === 'string'
    ? body.reference.trim().toUpperCase()
    : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!/^IF-[A-Z0-9]{6}$/.test(reference) || !isValidEmail(email)) {
    return new Response(JSON.stringify({ error: 'invalid-input' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data, error } = await supabase
    .from('leads')
    .select('created_at, service, source, lead_status, name')
    .eq('reference', reference)
    .ilike('email', email)
    .maybeSingle()

  if (error) {
    console.error('status lookup failed', error)
    return new Response(JSON.stringify({ error: 'lookup-failed' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  // Same response whether the reference is wrong or the email does not match it,
  // so this cannot be used to confirm that a reference exists.
  if (!data) {
    return new Response(JSON.stringify({ found: false }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const stage = STAGE[data.lead_status] ?? STAGE.received

  return new Response(
    JSON.stringify({
      found: true,
      reference,
      firstName: String(data.name ?? '').trim().split(/\s+/)[0] || null,
      submittedAt: data.created_at,
      service: data.service,
      status: data.lead_status,
      statusLabel: stage.label,
      statusDetail: stage.detail,
    }),
    { headers: { ...cors, 'Content-Type': 'application/json' } },
  )
})
