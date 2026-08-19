/*
 * submit-lead — the single entry point for every form and interactive tool.
 *
 * Replaces the old browser-side `insert` into `leads`. Doing the write here
 * means we can (a) use the service-role key, so the public anon INSERT policy
 * can eventually be dropped, and (b) send the two emails that the site has
 * been promising but never sent:
 *
 *   1. to the visitor — a copy of the result they just generated
 *   2. to the advisor team — the full answer set, so they arrive pre-briefed
 *
 * A lead is NEVER lost to an email failure: the row is inserted first, and the
 * send outcome is recorded in `leads.email_status`.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2'

/* ── Config ──────────────────────────────────────────────────────────── */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

/*
 * Read config per request, not at module scope. Module-level Deno.env.get()
 * is evaluated once when the isolate boots, so a secret added afterwards is
 * invisible to any isolate still warm — which makes "I saved the secret but
 * nothing sends" impossible to diagnose. Reading per request costs nothing.
 */
function config() {
  const env = (k: string, fallback = '') => Deno.env.get(k)?.trim() || fallback
  // LEAD_NOTIFY_EMAIL takes a comma-separated list, so the team can add or
  // remove recipients from the dashboard without touching this function.
  const notify = env('LEAD_NOTIFY_EMAIL', 'consult@insurefirst.ae')
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean)
  return {
    resendKey: env('RESEND_API_KEY'),
    from: env('LEAD_FROM_EMAIL', 'Insure First <noreply@insurefirst.ae>'),
    notify: notify.length ? notify : ['consult@insurefirst.ae'],
    siteUrl: env('SITE_URL', 'https://www.insurefirst.ae').replace(/\/$/, ''),
    phoneDisplay: env('LEAD_PHONE_DISPLAY', '050 976 5976'),
    phoneE164: env('LEAD_PHONE_E164', '+971509765976'),
    turnstileSecret: env('TURNSTILE_SECRET_KEY'),
    allowedOrigins: env('ALLOWED_ORIGINS', 'https://www.insurefirst.ae,https://insurefirst.ae')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  }
}

type Config = ReturnType<typeof config>

// Brand tokens, mirrored from src/styles/tokens.css (email clients need them inline).
const NAVY = '#0D1B4B'
const TEAL = '#00B899'
const TEAL_PALE = '#E6FAF7'
const BORDER = '#E2E8F0'
const TEXT_DARK = '#1A1A2E'
const TEXT_MUTED = '#6B7280'
const LIGHT_BG = '#F5F7FA'

const SEVERITY_COLOR: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: TEAL,
}

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
})

/* ── Helpers ─────────────────────────────────────────────────────────── */

// Crockford-ish alphabet: no 0/O/1/I, so references survive being read aloud.
const REF_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
function makeReference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return 'IF-' + Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join('')
}

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const isValidEmail = (v: unknown) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

/* ── Anti-spam ───────────────────────────────────────────────────────── */

// Link-shaped content in a name or message is the signature of SEO spam.
const LINK_RE = /(https?:\/\/|www\.[a-z0-9-]|\[url|\[link|t\.me\/|wa\.me\/|bit\.ly\/)/i

// Subjects are the one place client text reaches an email header, so they are
// held to a whitelist of characters (Latin, Arabic, basic punctuation) rather
// than a blocklist of tricks.
const SAFE_SUBJECT_RE = /^[\w ؀-ۿ,.'’&()/-]{4,80}$/

// Throwaway inboxes never belong to a real enquiry about insurance cover.
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'sharklasers.com', 'yopmail.com',
  'temp-mail.org', 'tempmail.com', '10minutemail.com', 'trashmail.com',
  'getnada.com', 'dispostable.com', 'maildrop.cc', 'mintemail.com',
  'mohmal.com', 'tempr.email', 'fakeinbox.com', 'mail.tm', 'tempmail.dev',
])

// The Aug 2026 spam wave submitted plausible emails and phones but machine
// names — "BbSrUapgeFBjUQHACICrYM", "Xrofooxf Obfepx" — so this looks for what
// random strings have and human words don't: mixed caps mid-word, long
// consonant runs, almost no vowels. Thresholds sit above real names (McDonald,
// Krzysztof, Schmidt all pass), and a hit only quarantines, never drops.
function looksMachineGenerated(text: string): boolean {
  for (const tok of text.match(/[A-Za-z]+/g) ?? []) {
    if (tok.length >= 8 && (tok.match(/[a-z][A-Z]/g) ?? []).length >= 2) return true
    if (tok.length >= 6) {
      const letters = tok.toLowerCase()
      let run = 0
      let best = 0
      let vowels = 0
      for (const ch of letters) {
        if ('aeiouy'.includes(ch)) {
          vowels++
          run = 0
        } else {
          run++
          if (run > best) best = run
        }
      }
      // Vowel scarcity only judges 8+ letter tokens — at 6–7 letters it would
      // flag real names like Schmidt (one vowel in seven letters).
      if (best >= 5 || (letters.length >= 8 && vowels / letters.length < 0.18)) return true
    }
  }
  return false
}

// The site and its preview deployments may submit; other browser origins may
// not. Absence of an Origin header is not judged here — direct POSTs carry
// none, and the Turnstile gate is what they cannot pass.
function isAllowedOrigin(origin: string, allowed: string[]): boolean {
  if (allowed.includes(origin)) return true
  try {
    const host = new URL(origin).hostname
    return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app')
  } catch {
    return false
  }
}

async function verifyTurnstile(
  secret: string,
  token: string,
  ip: string | null,
): Promise<'ok' | 'failed' | 'unavailable'> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    })
    const verdict = await res.json()
    return verdict.success ? 'ok' : 'failed'
  } catch (err) {
    // Cloudflare being unreachable is not the visitor's fault — let it in.
    console.error('turnstile siteverify unreachable', err)
    return 'unavailable'
  }
}

// Mirrors getScoreColor() in src/components/DiagnosticTool/ScoreResult.jsx
function scoreBand(score: number) {
  if (score < 40) return { color: '#EF4444', label: 'High risk' }
  if (score < 60) return { color: '#F59E0B', label: 'Moderate risk' }
  if (score < 75) return { color: TEAL, label: 'Developing' }
  return { color: '#10B981', label: 'Strong' }
}

interface Finding {
  title?: string
  detail?: string
  severity?: string
}

interface Report {
  score?: number
  headline?: string
  summary?: string
  findings?: Finding[]
  benchmark?: string
}

/* ── Email: the visitor's copy ───────────────────────────────────────── */

function leadEmailHtml(opts: {
  name: string
  reportTitle: string
  reference: string
  report: Report | null
  preferredTime: string | null
  cfg: Config
}): string {
  const { name, reportTitle, reference, report, preferredTime, cfg } = opts
  const { siteUrl: SITE_URL, phoneDisplay: PHONE_DISPLAY, phoneE164: PHONE_E164 } = cfg
  const firstName = name.trim().split(/\s+/)[0] || 'there'
  const score = typeof report?.score === 'number' ? report.score : null
  const band = score !== null ? scoreBand(score) : null
  const findings = Array.isArray(report?.findings) ? report!.findings! : []

  const scoreBlock = score === null ? '' : `
    <tr><td style="padding:0 32px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${LIGHT_BG};border-left:4px solid ${band!.color};">
        <tr>
          <td style="padding:20px 24px;">
            <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${TEXT_MUTED};font-weight:700;">Your score</div>
            <div style="font-size:40px;font-weight:800;color:${band!.color};line-height:1.1;margin-top:6px;">${score}<span style="font-size:18px;color:${TEXT_MUTED};font-weight:600;">/100</span></div>
            <div style="font-size:15px;font-weight:700;color:${TEXT_DARK};margin-top:2px;">${esc(band!.label)}</div>
            ${report?.summary ? `<div style="font-size:14px;color:${TEXT_MUTED};line-height:1.65;margin-top:10px;">${esc(report.summary)}</div>` : ''}
          </td>
        </tr>
      </table>
    </td></tr>`

  const findingsBlock = findings.length === 0 ? '' : `
    <tr><td style="padding:0 32px 8px;">
      <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${TEXT_MUTED};font-weight:700;margin-bottom:12px;">What we'd look at first</div>
    </td></tr>
    ${findings.map((f) => `
    <tr><td style="padding:0 32px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-left:3px solid ${SEVERITY_COLOR[f.severity ?? 'medium'] ?? SEVERITY_COLOR.medium};">
        <tr><td style="padding:14px 18px;">
          <div style="font-size:15px;font-weight:700;color:${NAVY};line-height:1.35;">${esc(f.title)}</div>
          ${f.detail ? `<div style="font-size:13.5px;color:${TEXT_MUTED};line-height:1.65;margin-top:5px;">${esc(f.detail)}</div>` : ''}
        </td></tr>
      </table>
    </td></tr>`).join('')}`

  const benchmarkBlock = !report?.benchmark ? '' : `
    <tr><td style="padding:8px 32px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${TEAL_PALE};">
        <tr><td style="padding:14px 18px;font-size:13.5px;color:#008F78;line-height:1.6;">${esc(report.benchmark)}</td></tr>
      </table>
    </td></tr>`

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(reportTitle)}</title></head>
<body style="margin:0;padding:0;background:${LIGHT_BG};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your ${esc(reportTitle)} from Insure First — reference ${esc(reference)}.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${LIGHT_BG};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;font-family:'Inter',Helvetica,Arial,sans-serif;color:${TEXT_DARK};">

        <tr><td style="height:4px;background:${TEAL};font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="background:${NAVY};padding:26px 32px;">
          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${TEAL};font-weight:700;">Insure First · Independent advisors</div>
          <div style="font-size:23px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;margin-top:8px;line-height:1.25;">${esc(reportTitle)}</div>
        </td></tr>

        <tr><td style="padding:28px 32px 20px;">
          <p style="margin:0;font-size:15.5px;line-height:1.7;color:${TEXT_DARK};">Hi ${esc(firstName)},</p>
          <p style="margin:12px 0 0;font-size:15.5px;line-height:1.7;color:${TEXT_MUTED};">
            ${esc(report?.headline || 'Thanks for completing your check — here is a copy of your result for your records.')}
          </p>
        </td></tr>

        ${scoreBlock}
        ${findingsBlock}
        ${benchmarkBlock}

        <tr><td style="padding:8px 32px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BORDER};">
            <tr><td style="padding-top:22px;">
              <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${TEXT_MUTED};font-weight:700;margin-bottom:8px;">What happens next</div>
              <p style="margin:0;font-size:14.5px;line-height:1.7;color:${TEXT_MUTED};">
                An independent advisor will review your answers and come back to you${preferredTime ? ` ${esc(preferredTime.toLowerCase())}` : ''} — usually within one business day.
                This is a second opinion, not a sales call: we are paid to find what your current cover misses.
              </p>
              <div style="margin-top:20px;">
                <a href="tel:${esc(PHONE_E164)}" style="display:inline-block;background:${TEAL};color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 26px;">Call ${esc(PHONE_DISPLAY)}</a>
                <a href="${esc(SITE_URL)}" style="display:inline-block;color:${NAVY};font-size:14px;font-weight:700;text-decoration:none;padding:13px 18px;">Visit insurefirst.ae</a>
              </div>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="background:${LIGHT_BG};padding:18px 32px;border-top:1px solid ${BORDER};">
          <div style="font-size:12px;color:${TEXT_MUTED};line-height:1.7;">
            Your reference: <strong style="color:${NAVY};letter-spacing:0.04em;">${esc(reference)}</strong><br>
            Quote it if you call, and we will pull up your answers straight away.
          </div>
        </td></tr>
        <tr><td style="background:${LIGHT_BG};padding:0 32px 22px;">
          <div style="font-size:11.5px;color:#9CA3AF;line-height:1.65;">
            You are receiving this because you requested it on insurefirst.ae. We never share your data with third parties.
            This report is indicative and based only on the answers you gave — it is not a substitute for a formal policy review.
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`
}

/* ── Email: the internal alert ───────────────────────────────────────── */

function teamEmailHtml(row: Record<string, unknown>, report: Report | null): string {
  const field = (label: string, value: unknown) => {
    if (value === null || value === undefined || value === '') return ''
    return `<tr>
      <td style="padding:7px 14px;background:${LIGHT_BG};font-size:12px;font-weight:700;color:${TEXT_MUTED};white-space:nowrap;vertical-align:top;">${esc(label)}</td>
      <td style="padding:7px 14px;font-size:13.5px;color:${TEXT_DARK};">${esc(value)}</td>
    </tr>`
  }

  const findings = Array.isArray(report?.findings) ? report!.findings! : []
  const findingsHtml = findings.length === 0 ? '' : `
    <div style="font-size:12px;font-weight:700;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.1em;margin:22px 0 8px;">Flagged findings</div>
    <ol style="margin:0;padding-left:20px;font-size:13.5px;color:${TEXT_DARK};line-height:1.7;">
      ${findings.map((f) => `<li><strong>${esc(f.title)}</strong>${f.severity ? ` <span style="color:${SEVERITY_COLOR[f.severity] ?? TEXT_MUTED};font-weight:700;">(${esc(f.severity)})</span>` : ''}${f.detail ? `<br><span style="color:${TEXT_MUTED};">${esc(f.detail)}</span>` : ''}</li>`).join('')}
    </ol>`

  const answers = row.details
  const answersHtml = !answers ? '' : `
    <div style="font-size:12px;font-weight:700;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.1em;margin:22px 0 8px;">Raw answers</div>
    <pre style="margin:0;padding:14px;background:${LIGHT_BG};border:1px solid ${BORDER};font-size:12px;line-height:1.6;color:${TEXT_DARK};white-space:pre-wrap;word-break:break-word;">${esc(JSON.stringify(answers, null, 2))}</pre>`

  return `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#ffffff;font-family:'Inter',Helvetica,Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;">
    <div style="height:4px;background:${TEAL};"></div>
    <div style="background:${NAVY};padding:18px 20px;">
      <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${TEAL};font-weight:700;">New lead</div>
      <div style="font-size:20px;font-weight:800;color:#ffffff;margin-top:5px;">${esc(row.name)}${typeof row.score === 'number' ? ` — score ${row.score}/100` : ''}</div>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-top:none;">
      ${field('Reference', row.reference)}
      ${field('Email', row.email)}
      ${field('Phone', row.phone)}
      ${field('Preferred time', row.preferred_time)}
      ${/* Always present: a missing service should read as "none chosen",
           not silently vanish from the table. */ ''}
      ${field('Service', row.service || 'Not specified')}
      ${field('Tool', row.tool_id)}
      ${field('Source', row.source)}
      ${field('Page', row.page)}
      ${field('WhatsApp', row.whatsapp_opt_in ? (row.whatsapp_number || 'opted in') : null)}
      ${field('Message', row.message)}
    </table>
    ${findingsHtml}
    ${answersHtml}
    <p style="font-size:12px;color:${TEXT_MUTED};margin-top:22px;">Reply directly to this email to reach the lead.</p>
  </div>
</body></html>`
}

/* ── Resend ──────────────────────────────────────────────────────────── */

async function sendEmail(cfg: Config, payload: Record<string, unknown>): Promise<void> {
  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: cfg.from, ...payload }),
  })
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`)
  }
}

/* ── Handler ─────────────────────────────────────────────────────────── */

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin')
  const cors = corsHeaders(origin)

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method-not-allowed' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  let body: Record<string, any>
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid-json' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  // A response that looks exactly like success while saving nothing. Every
  // hard rejection returns this — a bot must never learn which gate it failed.
  const fakeOk = () =>
    new Response(JSON.stringify({ ok: true, reference: makeReference() }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })

  // Honeypot: bots fill hidden fields.
  if (typeof body._hp === 'string' && body._hp.trim() !== '') return fakeOk()

  // Forensics — stored on the row so spam is traceable and rate-limitable.
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || null
  const userAgent = req.headers.get('user-agent')?.slice(0, 400) || null

  const cfg = config()

  /*
   * Suspicion gathered here quarantines rather than drops: the row saves with
   * lead_status 'spam' and the reasons, no email goes out, and a false positive
   * is one status click in the portal — never a lost client. Only certainties
   * (failed Turnstile verification, bot-speed fills) get the tarpit.
   */
  const spamReasons: string[] = []

  // Turnstile: the token proves a real browser ran Cloudflare's check on one
  // of our forms. A failed verification is a bot or a replayed token — tarpit.
  // A missing token only quarantines (the visitor may block the script), and
  // an unset secret skips the gate entirely, so deploying this function ahead
  // of the secret cannot cost leads.
  if (cfg.turnstileSecret) {
    const token = typeof body._cf === 'string' ? body._cf.trim() : ''
    if (!token) {
      spamReasons.push('no-turnstile-token')
    } else if ((await verifyTurnstile(cfg.turnstileSecret, token, ip)) === 'failed') {
      return fakeOk()
    }
  }

  // _t is ms between page load and submit. Humans find the form, read it and
  // type; sub-3-second submissions are scripted fills.
  if (typeof body._t === 'number' && body._t >= 0 && body._t < 3000) return fakeOk()

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name || !isValidEmail(body.email)) {
    return new Response(JSON.stringify({ error: 'invalid-payload' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const email = String(body.email).trim()
  const phone = body.phone ? String(body.phone).trim() : null
  const message = typeof body.message === 'string' ? body.message : null

  if (origin && !isAllowedOrigin(origin, cfg.allowedOrigins)) spamReasons.push('foreign-origin')
  if (LINK_RE.test(name)) spamReasons.push('link-in-name')
  if (message && LINK_RE.test(message)) spamReasons.push('link-in-message')
  if (looksMachineGenerated(name)) spamReasons.push('machine-name')
  if (message && looksMachineGenerated(message)) spamReasons.push('machine-message')
  if (name.length > 120) spamReasons.push('name-too-long')
  if (message && message.length > 4000) spamReasons.push('message-too-long')
  if (DISPOSABLE_DOMAINS.has(email.toLowerCase().split('@')[1] ?? '')) spamReasons.push('disposable-email')
  if (phone) {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 7 || digits.length > 15) spamReasons.push('implausible-phone')
  }

  const report: Report | null = body.report && typeof body.report === 'object' ? body.report : null
  const reference = makeReference()

  // Subjects only carry text that passes the whitelist — a client-supplied
  // string must never become arbitrary outbound email content.
  const service = typeof body.service === 'string' && SAFE_SUBJECT_RE.test(body.service.trim())
    ? body.service.trim()
    : null
  const reportTitle = typeof body.reportTitle === 'string' && SAFE_SUBJECT_RE.test(body.reportTitle.trim())
    ? body.reportTitle.trim()
    : (service ? `Your ${service} summary` : 'Your enquiry with Insure First')

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Rate limits: 3 submissions per hour per IP, and per email address — the
  // Aug 2026 bot hit three forms with the same email inside a minute, and no
  // legitimate visitor files a fourth enquiry within the hour. A burst means a
  // bot or someone stuck retrying; either way a human should look before any
  // more email goes out under our name.
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const overLimit = async (column: 'ip' | 'email', value: string) => {
    const { count, error: rlErr } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq(column, value)
      .gte('created_at', hourAgo)
    if (rlErr) {
      console.error(`rate-limit count by ${column} failed`, rlErr)
      return false
    }
    return (count ?? 0) >= 3
  }
  if (ip && (await overLimit('ip', ip))) spamReasons.push('rate-limit-ip')
  if (await overLimit('email', email)) spamReasons.push('rate-limit-email')

  const quarantined = spamReasons.length > 0

  const row = {
    name,
    email,
    phone,
    message,
    // The row keeps the raw value (capped) even when it fails the subject
    // whitelist — the advisor should see what was actually submitted.
    service: typeof body.service === 'string' ? body.service.slice(0, 200) : null,
    source: body.source ?? 'website',
    page: body.page ?? null,
    preferred_time: body.preferredTime ?? null,
    whatsapp_opt_in: body.whatsappOptIn ?? null,
    whatsapp_number: body.whatsappNumber ?? null,
    details: body.details ?? null,
    tool_id: body.toolId ?? null,
    score: typeof report?.score === 'number' ? Math.round(report.score) : null,
    report,
    reference,
    ip,
    user_agent: userAgent,
    origin,
    ...(quarantined ? { lead_status: 'spam', spam_reason: spamReasons.join(',') } : {}),
    email_status: quarantined ? 'skipped' : 'pending',
  }

  // Save first — an email failure must never cost us the lead.
  const { data: inserted, error } = await supabase
    .from('leads')
    .insert([row])
    .select('id')
    .single()

  if (error) {
    console.error('lead insert failed', error)
    return new Response(JSON.stringify({ error: 'insert-failed' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  // Quarantined rows are saved for review but send nothing, and the response
  // is indistinguishable from a clean submission.
  if (quarantined) {
    console.log(`lead ${inserted.id} quarantined: ${spamReasons.join(',')} ip=${ip ?? '?'}`)
    return new Response(
      JSON.stringify({ ok: true, id: inserted.id, reference, emailed: false, status: 'skipped' }),
      { headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  }

  let emailStatus = 'skipped'
  // Never the value — only whether it arrived and roughly how long it is, which
  // is enough to tell "not saved" apart from "saved under the wrong name".
  const reasons: string[] = []

  if (!cfg.resendKey) {
    const visible = Object.keys(Deno.env.toObject()).filter((k) => /^(LEAD_|SITE_|RESEND)/.test(k))
    console.error(
      `RESEND_API_KEY not visible to this function. Config keys the function can see: ${visible.join(', ') || '(none)'}`,
    )
    reasons.push('no-resend-key')
  } else {
    console.log(`RESEND_API_KEY present (${cfg.resendKey.length} chars), from=${cfg.from}, notify=${cfg.notify.join(', ')}`)

    const [toLead, toTeam] = await Promise.allSettled([
      sendEmail(cfg, {
        to: [row.email],
        subject: `${reportTitle} — ${reference}`,
        html: leadEmailHtml({ name, reportTitle, reference, report, preferredTime: row.preferred_time, cfg }),
      }),
      sendEmail(cfg, {
        to: cfg.notify,
        reply_to: [row.email],
        subject: `New lead: ${name.slice(0, 80)}${service ? ` — ${service}` : ` — via ${row.source}`}${row.score !== null ? ` (score ${row.score})` : ''}`,
        html: teamEmailHtml({ ...row, id: inserted.id }, report),
      }),
    ])

    if (toLead.status === 'rejected') {
      console.error('lead email failed', toLead.reason)
      reasons.push(`lead: ${toLead.reason?.message ?? toLead.reason}`)
    }
    if (toTeam.status === 'rejected') {
      console.error('team email failed', toTeam.reason)
      reasons.push(`team: ${toTeam.reason?.message ?? toTeam.reason}`)
    }

    emailStatus =
      toLead.status === 'fulfilled' && toTeam.status === 'fulfilled' ? 'sent'
      : toLead.status === 'fulfilled' ? 'lead-only'
      : toTeam.status === 'fulfilled' ? 'team-only'
      : 'failed'
  }

  await supabase.from('leads').update({ email_status: emailStatus }).eq('id', inserted.id)

  return new Response(
    JSON.stringify({
      ok: true,
      id: inserted.id,
      reference,
      emailed: emailStatus === 'sent',
      status: emailStatus,
      ...(reasons.length ? { reasons } : {}),
    }),
    { headers: { ...cors, 'Content-Type': 'application/json' } },
  )
})
