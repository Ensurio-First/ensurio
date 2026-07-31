import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight, ArrowLeft, Check, Phone,
  Building2, Home, Users, Truck, Package, Briefcase, Heart, HelpCircle,
  TrendingDown, ShieldAlert, AlertTriangle, Calendar, Search,
} from 'lucide-react'
import ProtoNav from '../prototype/home/components/ProtoNav'
import ProtoFooter from '../prototype/home/components/ProtoFooter'
import { useIsMobile } from '../prototype/home/hooks/useIsMobile'
import { submitLead } from '../lib/supabase'
import WhatsAppConsent, { emptyWhatsApp, resolveWhatsApp } from '../components/WhatsAppConsent'
import '../prototype/prototype.css'

const REVIEW_TYPES = [
  { label: 'Business Insurance', Icon: Building2 },
  { label: 'Property & Contents', Icon: Home },
  { label: 'Liability', Icon: Users },
  { label: 'Motor Fleet', Icon: Truck },
  { label: 'Marine Cargo', Icon: Package },
  { label: 'Professional / D&O', Icon: Briefcase },
  { label: 'Health & Life', Icon: Heart },
  { label: 'Not sure yet', Icon: HelpCircle },
]

const CONCERNS = [
  { label: 'I might be overpaying', Icon: TrendingDown },
  { label: 'Worried about coverage gaps', Icon: ShieldAlert },
  { label: "I've had a claim problem", Icon: AlertTriangle },
  { label: 'My renewal is coming up', Icon: Calendar },
  { label: 'Just want a health check', Icon: Search },
]

const RENEWALS = ['Within 1 month', '1–3 months', '3–6 months', '6+ months', 'Not sure']
const CALLBACK_TIMES = ['Morning', 'Afternoon', 'Evening', 'Anytime']
const STEPS = ['What to review', 'Your concern', 'Renewal', 'Your details']

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export default function PolicyReviewPage() {
  const isMobile = useIsMobile()
  const [step, setStep] = useState(0)
  const [types, setTypes] = useState([])
  const [concern, setConcern] = useState('')
  const [renewal, setRenewal] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [when, setWhen] = useState('')
  const [wa, setWa] = useState(emptyWhatsApp)
  const [status, setStatus] = useState('idle') // idle | invalid | sending | done | error
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    const prevTitle = document.title
    document.title = 'Request a Policy Review | Insure First'
    let meta = document.querySelector('meta[name="description"]')
    let created = false
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); created = true }
    const prevDesc = meta.getAttribute('content')
    meta.setAttribute('content', 'Request a free, independent review of your insurance policies — tell us what to review and an advisor will come back with findings.')
    return () => { document.title = prevTitle; if (created) meta.remove(); else if (prevDesc !== null) meta.setAttribute('content', prevDesc) }
  }, [])

  const toggleType = (label) => setTypes((prev) => (prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]))

  const canProceed = step === 0 ? types.length > 0 : step === 1 ? !!concern : step === 2 ? !!renewal : true
  const contactValid = form.name.trim() && isValidEmail(form.email) && form.phone.replace(/\s/g, '').length >= 7

  const submit = async () => {
    if (!contactValid) { setStatus('invalid'); return }
    setStatus('sending')
    try {
      await submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: `Policy review request. Review: ${types.join(', ')}. Concern: ${concern}. Renewal: ${renewal}.${when ? ` Preferred callback: ${when}.` : ''}`,
        service: 'Policy Review',
        source: 'policy-review-form',
        preferredTime: when || null,
        details: { reviewTypes: types, concern, renewal },
        ...resolveWhatsApp(wa, form.phone),
      })
      setStatus('done')
    } catch (err) {
      if (err.message === 'not-configured') setStatus('done')
      else setStatus('error')
    }
  }

  // Selectable card grid helper
  const CardGrid = ({ options, selected, onPick, columns }) => (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : `repeat(${columns}, 1fr)`, gap: '12px' }}>
      {options.map(({ label, Icon }) => {
        const on = Array.isArray(selected) ? selected.includes(label) : selected === label
        return (
          <button key={label} type="button" onClick={() => onPick(label)}
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px', padding: isMobile ? '1rem' : '1.25rem', cursor: 'pointer', textAlign: 'left', border: `1.5px solid ${on ? 'var(--teal)' : 'var(--border)'}`, background: on ? 'var(--teal-pale)' : 'var(--white)', transition: 'border-color 0.15s, background 0.15s' }}
            onMouseEnter={(e) => { if (!on) e.currentTarget.style.borderColor = 'var(--border-dark)' }}
            onMouseLeave={(e) => { if (!on) e.currentTarget.style.borderColor = 'var(--border)' }}>
            {on && <span style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} color="#fff" strokeWidth={3} /></span>}
            <Icon size={24} color={on ? 'var(--teal-dark)' : 'var(--teal)'} />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.9rem' : '0.98rem', fontWeight: 700, color: on ? 'var(--teal-dark)' : 'var(--navy)', lineHeight: 1.3 }}>{label}</span>
          </button>
        )
      })}
    </div>
  )

  const inputStyle = { width: '100%', height: '48px', padding: '0 14px', boxSizing: 'border-box', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dark)', background: 'var(--white)', border: '1.5px solid var(--border-dark)', outline: 'none', marginBottom: '12px' }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111827' }}>
      <ProtoNav />
      <main>
        {/* Hero */}
        <section style={{ background: 'var(--navy)', borderBottom: '3px solid var(--teal)', padding: isMobile ? '2.5rem 0' : '3.5rem 0' }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.75rem' }}>Free · Independent · No obligation</p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.8rem' : '2.6rem', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '0.9rem' }}>
              Request a Policy Review
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '14px' : '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
              Tell us a little about your cover and an independent advisor will come back with a clear read on where you stand — gaps, overlaps, and savings.
            </p>
          </div>
        </section>

        {/* Wizard */}
        <section style={{ background: 'var(--light-bg)', padding: isMobile ? '2rem 0 3rem' : '3rem 0 5rem' }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderTop: '3px solid var(--teal)', boxShadow: 'var(--shadow-md)' }}>

              {status === 'done' ? (
                <div style={{ padding: isMobile ? '2.5rem 1.5rem' : '3.5rem 2.5rem', textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                    <Check size={30} color="var(--teal)" strokeWidth={3} />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : '1.7rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: '0.6rem' }}>Your review request is in</h2>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '440px', margin: '0 auto 1.75rem' }}>
                    Thank you, {form.name.split(' ')[0] || 'there'}. An independent advisor will review your details and be in touch{when ? ` (${when.toLowerCase()})` : ''} — usually within one business day.
                  </p>
                  <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px', background: 'var(--teal)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>Back to home <ArrowRight size={15} /></Link>
                </div>
              ) : (
                <>
                  {/* Progress */}
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                    {STEPS.map((label, i) => (
                      <div key={label} style={{ flex: 1, padding: isMobile ? '0.75rem 0.5rem' : '1rem', textAlign: 'center', borderBottom: `3px solid ${i === step ? 'var(--teal)' : 'transparent'}`, background: i < step ? 'var(--teal-pale)' : 'transparent' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '11px' : '12px', fontWeight: 800, color: i <= step ? 'var(--teal-dark)' : 'var(--text-light)' }}>
                          {i < step ? '✓' : i + 1}{!isMobile && ` · ${label}`}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: isMobile ? '1.5rem 1.25rem' : '2.25rem 2.5rem' }}>
                    <AnimatePresence mode="wait">
                      <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
                        {step === 0 && (
                          <>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>What would you like us to review?</h2>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Select all that apply.</p>
                            <CardGrid options={REVIEW_TYPES} selected={types} onPick={toggleType} columns={4} />
                          </>
                        )}
                        {step === 1 && (
                          <>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>What's your main concern?</h2>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Pick the one that fits best.</p>
                            <CardGrid options={CONCERNS} selected={concern} onPick={(l) => setConcern(concern === l ? '' : l)} columns={3} />
                          </>
                        )}
                        {step === 2 && (
                          <>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>When does your policy renew?</h2>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>This helps us prioritise your review.</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                              {RENEWALS.map((r) => {
                                const on = renewal === r
                                return <button key={r} type="button" onClick={() => setRenewal(on ? '' : r)} style={{ padding: '12px 20px', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${on ? 'var(--teal)' : 'var(--border-dark)'}`, background: on ? 'var(--teal-pale)' : 'var(--white)', color: on ? 'var(--teal-dark)' : 'var(--navy)' }}>{r}</button>
                              })}
                            </div>
                          </>
                        )}
                        {step === 3 && (
                          <>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Where should we send your review?</h2>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>An advisor will follow up personally — no obligation.</p>
                            <input aria-label="Full name" type="text" placeholder="Full name" value={form.name} onChange={(e) => setF('name', e.target.value)} style={inputStyle} />
                            <input aria-label="Email address" type="email" placeholder="Email address" value={form.email} onChange={(e) => setF('email', e.target.value)} style={inputStyle} />
                            <input aria-label="Phone number" type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => setF('phone', e.target.value)} style={inputStyle} />
                            <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-mid)', margin: '4px 0 8px' }}>Preferred callback time</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                              {CALLBACK_TIMES.map((t) => {
                                const on = when === t
                                return <button key={t} type="button" onClick={() => setWhen(on ? '' : t)} style={{ padding: '10px 4px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${on ? 'var(--teal)' : 'var(--border-dark)'}`, background: on ? 'var(--teal-pale)' : 'var(--light-bg)', color: on ? 'var(--teal-dark)' : 'var(--text-mid)' }}>{t}</button>
                              })}
                            </div>
                            <div style={{ marginTop: '16px' }}>
                              <WhatsAppConsent value={wa} onChange={setWa} phone={form.phone} />
                            </div>
                            {status === 'invalid' && <p role="alert" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#EF4444', margin: '12px 0 0' }}>Please enter your name, a valid email, and a phone number.</p>}
                            {status === 'error' && <p role="alert" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#EF4444', margin: '12px 0 0' }}>Something went wrong — please try again or call us.</p>}
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Nav buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
                      <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 20px', background: 'transparent', color: step === 0 ? 'var(--text-light)' : 'var(--navy)', border: 'none', cursor: step === 0 ? 'default' : 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, visibility: step === 0 ? 'hidden' : 'visible' }}>
                        <ArrowLeft size={15} /> Back
                      </button>
                      {step < 3 ? (
                        <button type="button" onClick={() => canProceed && setStep((s) => s + 1)} disabled={!canProceed}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', background: canProceed ? 'var(--teal)' : 'var(--border-dark)', color: '#fff', border: 'none', cursor: canProceed ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700 }}>
                          Continue <ArrowRight size={15} />
                        </button>
                      ) : (
                        <button type="button" onClick={submit} disabled={status === 'sending'}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', background: status === 'sending' ? 'var(--teal-dark)' : 'var(--teal)', color: '#fff', border: 'none', cursor: status === 'sending' ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700 }}>
                          {status === 'sending' ? 'Sending…' : <>Request my review <ArrowRight size={15} /></>}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Reassurance / call */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>Prefer to talk it through?</span>
              <a href="tel:+971509765976" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: 'var(--teal-dark)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}><Phone size={15} /> Call 050 976 5976</a>
            </div>
          </div>
        </section>
      </main>
      <ProtoFooter />
    </div>
  )
}
