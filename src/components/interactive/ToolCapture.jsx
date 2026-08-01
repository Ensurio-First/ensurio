import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { submitLead } from '../../lib/supabase'
import { useLeadJourney } from '../../context/LeadJourneyContext'

/*
 * The capture step shared by every on-page tool.
 *
 * Each tool computes its own result and decides what to reveal for free; this
 * component only handles the exchange — contact details in, lead out — so the
 * four tools don't carry four copies of the same form, validation and error
 * handling. It renders the form only: the confirmation panel belongs to the
 * tool, because what you show afterwards is the whole point of the tool.
 *
 * `onSubmitted(receipt)` fires with { ok, id, reference, emailed }.
 */

const CALLBACK_TIMES = ['Morning', 'Afternoon', 'Evening', 'Anytime']
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export default function ToolCapture({
  isMobile,
  service,
  source,
  toolId,
  reportTitle,
  report = null,
  details = null,
  message = null,
  heading = 'Get this in writing',
  note = 'An independent advisor will go through it with you — no obligation.',
  ctaLabel = 'Send me my results',
  onSubmitted,
}) {
  const { completeCheck } = useLeadJourney()
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [when, setWhen] = useState('')
  const [hp, setHp] = useState('')
  const [status, setStatus] = useState('idle') // idle | invalid | sending | error

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const valid =
    form.name.trim() && isValidEmail(form.email) && form.phone.replace(/\s/g, '').length >= 7

  const submit = async (e) => {
    e.preventDefault()
    if (!valid) { setStatus('invalid'); return }
    setStatus('sending')
    try {
      const receipt = await submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: message ?? `${reportTitle} requested.`,
        service,
        source,
        toolId,
        reportTitle,
        preferredTime: when || null,
        details,
        report,
        honeypot: hp,
      })
      completeCheck()
      onSubmitted?.({ ...(receipt || {}), name: form.name, email: form.email, when })
    } catch {
      setStatus('error')
    }
  }

  const muted = { fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6 }
  const inputStyle = {
    width: '100%', height: '46px', padding: '0 14px', boxSizing: 'border-box',
    fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dark)',
    background: 'var(--white)', border: '1.5px solid var(--border-dark)', outline: 'none',
    marginBottom: '10px',
  }

  return (
    <form onSubmit={submit} noValidate>
      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px' }}>
        {heading}
      </h4>
      <p style={{ ...muted, margin: '0 0 1rem' }}>{note}</p>

      {/* Honeypot — invisible to people, tempting to bots. */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp}
        onChange={(e) => setHp(e.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }} />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0 10px' }}>
        <input aria-label="Full name" type="text" placeholder="Full name" value={form.name} onChange={(e) => setF('name', e.target.value)} style={inputStyle} />
        <input aria-label="Email address" type="email" placeholder="Email address" value={form.email} onChange={(e) => setF('email', e.target.value)} style={inputStyle} />
      </div>
      <input aria-label="Phone number" type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => setF('phone', e.target.value)} style={inputStyle} />

      <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-mid)', margin: '4px 0 8px' }}>
        Preferred callback time
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '14px' }}>
        {CALLBACK_TIMES.map((t) => {
          const on = when === t
          return (
            <button key={t} type="button" onClick={() => setWhen(on ? '' : t)}
              style={{ padding: '9px 4px', fontFamily: 'var(--font-body)', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', border: `1px solid ${on ? 'var(--teal)' : 'var(--border-dark)'}`, background: on ? 'var(--teal-pale)' : 'var(--light-bg)', color: on ? 'var(--teal-dark)' : 'var(--text-mid)' }}>
              {t}
            </button>
          )
        })}
      </div>

      {status === 'invalid' && <p role="alert" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#EF4444', margin: '0 0 10px' }}>Please enter your name, a valid email, and a phone number.</p>}
      {status === 'error' && <p role="alert" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#EF4444', margin: '0 0 10px' }}>Something went wrong — please try again, or call us directly.</p>}

      <button type="submit" disabled={status === 'sending'}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 26px', width: isMobile ? '100%' : 'auto', background: 'var(--teal)', color: '#fff', border: 'none', cursor: status === 'sending' ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700 }}>
        {status === 'sending' ? 'Sending…' : <>{ctaLabel} <ArrowRight size={15} /></>}
      </button>
      <p style={{ ...muted, fontSize: '11.5px', margin: '0.75rem 0 0' }}>We never share your data with third parties.</p>
    </form>
  )
}
