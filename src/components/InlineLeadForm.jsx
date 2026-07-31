import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { submitLead } from '../lib/supabase'

/*
 * Compact inline lead form — submits straight to Supabase (no page navigation).
 * Drop it anywhere; pass `service` + `source` so the lead is tagged with context.
 * Designed to sit as a white card on a dark (navy) CTA band.
 */
const CALLBACK_TIMES = ['Morning', 'Afternoon', 'Evening', 'Anytime']

export default function InlineLeadForm({
  service = null,
  source = 'website',
  heading = 'Request a callback',
  note = 'Leave your details and an advisor will call you back — usually the same day.',
  cta = 'Request a Callback',
  askCallbackTime = true,
}) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [when, setWhen] = useState('')
  const [status, setStatus] = useState('idle') // idle | invalid | sending | done | error
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const isValid =
    form.name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.phone.replace(/\s/g, '').length >= 7

  const submit = async (e) => {
    e.preventDefault()
    if (!isValid) { setStatus('invalid'); return }
    setStatus('sending')
    try {
      await submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: `${service ? `Callback request for ${service}.` : 'Callback request.'}${when ? ` Preferred time: ${when}.` : ''}`,
        service: service || null,
        source,
        preferredTime: when || null,
      })
      setStatus('done')
    } catch (err) {
      // Until Supabase env is set (e.g. some previews) fall back to success.
      if (err.message === 'not-configured') setStatus('done')
      else setStatus('error')
    }
  }

  const inputStyle = {
    width: '100%', height: '44px', padding: '0 13px', boxSizing: 'border-box',
    fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dark)',
    background: 'var(--white)', border: '1.5px solid var(--border-dark)', outline: 'none',
    marginBottom: '10px',
  }

  if (status === 'done') {
    return (
      <div style={{ background: 'var(--white)', padding: '2rem 1.75rem', textAlign: 'center', borderTop: '3px solid var(--teal)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Check size={24} color="var(--teal)" strokeWidth={3} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.4rem' }}>Thank you — request received</h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>An advisor will be in touch shortly{service ? ` about ${service}` : ''}.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate style={{ background: 'var(--white)', padding: '1.5rem 1.6rem', borderTop: '3px solid var(--teal)', textAlign: 'left' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.01em', marginBottom: '0.35rem' }}>{heading}</h3>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 1rem', lineHeight: 1.55 }}>{note}</p>

      <input aria-label="Full name" type="text" placeholder="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} style={inputStyle} />
      <input aria-label="Email address" type="email" placeholder="Email address" value={form.email} onChange={(e) => set('email', e.target.value)} style={inputStyle} />
      <input aria-label="Phone number" type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => set('phone', e.target.value)} style={{ ...inputStyle, marginBottom: askCallbackTime ? '12px' : '12px' }} />

      {askCallbackTime && (
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-mid)', marginBottom: '8px' }}>Preferred callback time</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {CALLBACK_TIMES.map((t) => {
              const on = when === t
              return (
                <button key={t} type="button" onClick={() => setWhen(on ? '' : t)} style={{ padding: '8px 4px', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: `1px solid ${on ? 'var(--teal)' : 'var(--border-dark)'}`, background: on ? 'var(--teal-pale)' : 'var(--light-bg)', color: on ? 'var(--teal-dark)' : 'var(--text-mid)' }}>{t}</button>
              )
            })}
          </div>
        </div>
      )}

      {status === 'invalid' && <p role="alert" style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: '#EF4444', margin: '0 0 10px' }}>Please enter your name, a valid email, and a phone number.</p>}
      {status === 'error' && <p role="alert" style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: '#EF4444', margin: '0 0 10px' }}>Something went wrong. Please try again, or call us directly.</p>}

      <button type="submit" disabled={status === 'sending'} style={{ width: '100%', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: status === 'sending' ? 'var(--teal-dark)' : 'var(--teal)', color: '#fff', border: 'none', cursor: status === 'sending' ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700 }}>
        {status === 'sending' ? 'Sending…' : <>{cta} <ArrowRight size={15} /></>}
      </button>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-light)', margin: '0.75rem 0 0', textAlign: 'center' }}>We never share your data with third parties.</p>
    </form>
  )
}
