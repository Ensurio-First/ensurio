import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY'

const SCROLL_THRESHOLD   = 600
const DELAY_MS           = 1200
const TOOL_PROMPT_DELAY  = 7000
const TOOL_PROMPT_SCROLL = 350

function getScoreColor(s) {
  if (s < 40) return '#EF4444'
  if (s < 60) return '#F59E0B'
  if (s < 75) return '#00B899'
  return '#10B981'
}
function getScoreLabel(s) {
  if (s < 40) return 'High Risk'
  if (s < 60) return 'Moderate Risk'
  if (s < 75) return 'Developing'
  return 'Strong'
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 600)
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 600)
    window.addEventListener('resize', h, { passive: true })
    return () => window.removeEventListener('resize', h)
  }, [])
  return mobile
}

/* Shared popup wrapper — mobile snaps full-width to bottom, desktop floats centered */
function PopupWrap({ children, topColor, onBackdrop, light = false }) {
  const isMobile = useIsMobile()
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onBackdrop}
        style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(13,27,75,0.2)', backdropFilter: 'blur(2px)' }}
      />
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        style={{
          position: 'fixed',
          bottom: 0,
          ...(isMobile
            ? { left: 0, right: 0 }
            : { left: '50%', transform: 'translateX(-50%)', maxWidth: '640px', bottom: '32px' }
          ),
          zIndex: 9001,
          width: isMobile ? '100%' : undefined,
          background: light ? 'var(--white)' : 'var(--navy)',
          boxShadow: light ? '0 -8px 48px rgba(13,27,75,0.18)' : '0 -8px 40px rgba(13,27,75,0.4)',
          overflow: 'hidden',
          border: light ? '1px solid var(--border)' : 'none',
        }}
      >
        <div style={{ height: '3px', background: topColor || 'var(--teal)' }} />
        {children}
      </motion.div>
    </>
  )
}

/* Shared banner — same mobile vs desktop positioning */
function BannerWrap({ children, topColor, onClick }) {
  const isMobile = useIsMobile()
  return (
    <motion.div
      initial={{ y: 64, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 64, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 34, delay: 0.05 }}
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: 0,
        ...(isMobile
          ? { left: 0, right: 0 }
          : { left: '50%', transform: 'translateX(-50%)', maxWidth: '640px' }
        ),
        zIndex: 8999,
        width: isMobile ? '100%' : undefined,
        background: 'var(--navy)',
        borderTop: `3px solid ${topColor || 'var(--teal)'}`,
        boxShadow: '0 -4px 32px rgba(13,27,75,0.35)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', gap: '12px',
      }}
    >
      {children}
    </motion.div>
  )
}

export default function ScrollReminderPopup() {
  const isMobile = useIsMobile()

  const [visible, setVisible]     = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [done, setDone]           = useState(false)
  const [result, setResult]       = useState(null)
  const [status, setStatus]       = useState('idle')
  const reminderShownRef          = useRef(false)
  const reminderTimerRef          = useRef(null)

  const [toolPromptVisible, setToolPromptVisible]     = useState(false)
  const [toolPromptMinimized, setToolPromptMinimized] = useState(false)
  const toolPromptShownRef = useRef(false)
  const toolPromptTimerRef = useRef(null)

  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    const onResult = (e) => {
      setResult(e.detail)
      setToolPromptVisible(false)
      setToolPromptMinimized(false)
    }
    const onSubmitted = () => { setDone(true); setVisible(false); setMinimized(false) }
    window.addEventListener('ensurio:result', onResult)
    window.addEventListener('ensurio:submitted', onSubmitted)
    return () => {
      window.removeEventListener('ensurio:result', onResult)
      window.removeEventListener('ensurio:submitted', onSubmitted)
    }
  }, [])

  useEffect(() => {
    if (done || reminderShownRef.current) return
    const onScroll = () => {
      if (!result || done || reminderShownRef.current) return
      if (window.scrollY > SCROLL_THRESHOLD) {
        clearTimeout(reminderTimerRef.current)
        reminderTimerRef.current = setTimeout(() => {
          if (!reminderShownRef.current && !done) {
            reminderShownRef.current = true
            setVisible(true)
          }
        }, DELAY_MS)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(reminderTimerRef.current) }
  }, [result, done])

  useEffect(() => {
    if (toolPromptShownRef.current || result) return
    const fire = () => {
      if (toolPromptShownRef.current || result) return
      toolPromptShownRef.current = true
      setToolPromptVisible(true)
    }
    toolPromptTimerRef.current = setTimeout(fire, TOOL_PROMPT_DELAY)
    const onScroll = () => { if (window.scrollY > TOOL_PROMPT_SCROLL) fire() }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { clearTimeout(toolPromptTimerRef.current); window.removeEventListener('scroll', onScroll) }
  }, [result])

  /* ── Notify WhatsApp button when a banner is active ── */
  useEffect(() => {
    const bannerOn = minimized || toolPromptMinimized
    window.dispatchEvent(new CustomEvent(bannerOn ? 'ensurio:banner-on' : 'ensurio:banner-off'))
  }, [minimized, toolPromptMinimized])

  const dismissReminder    = () => { setVisible(false); setTimeout(() => setMinimized(true), 220) }
  const expandReminder     = () => { setMinimized(false); setVisible(true) }
  const fullyDismissRem    = (e) => { e.stopPropagation(); setMinimized(false) }

  const dismissToolPrompt  = () => { setToolPromptVisible(false); setTimeout(() => setToolPromptMinimized(true), 220) }
  const expandToolPrompt   = () => { setToolPromptMinimized(false); setToolPromptVisible(true) }
  const fullyDismissTool   = (e) => { e.stopPropagation(); setToolPromptMinimized(false) }
  const goToTool           = () => { setToolPromptVisible(false); setToolPromptMinimized(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const submit = async (data) => {
    setStatus('sending')
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: data.name, from_email: data.email, company: data.company ?? '',
        tool: 'Insurance Premium Check (Reminder)', score: result?.score ?? 'N/A',
      }, EMAILJS_PUBLIC_KEY)
      setStatus('sent')
      window.dispatchEvent(new CustomEvent('ensurio:submitted'))
      setTimeout(() => setVisible(false), 2000)
    } catch { setStatus('error') }
  }

  const color   = result ? getScoreColor(result.score) : 'var(--teal)'
  const label   = result ? getScoreLabel(result.score) : ''
  const savings = result?.savings != null ? `$${result.savings.toLocaleString()}` : ''

  const inputBase = {
    padding: '10px 12px',
    border: '2px solid var(--border)',
    background: 'var(--white)',
    color: 'var(--text-dark)',
    fontSize: '13px',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    borderRadius: 0,
    transition: 'border-color 0.2s',
    width: '100%',
  }

  return (
    <>
      {/* ── 1. REPORT REMINDER popup ─────────────────────────────────────── */}
      <AnimatePresence>
        {visible && (
          <PopupWrap topColor={color} onBackdrop={dismissReminder} light>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0.75rem 1rem' : '1rem 1.25rem 0.75rem', borderBottom: '1px solid var(--border)', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                <div style={{ width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px', border: `2.5px solid ${color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.85rem' : '1rem', fontWeight: 800, color, lineHeight: 1 }}>{result?.score}</span>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>/100</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>{label} — Report Ready</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {result?.savings != null
                      ? <>Est. <strong style={{ color: 'var(--teal)' }}>{savings}</strong> in annual savings. Don't leave without it.</>
                      : <>Your personalised report is ready. Get your full analysis.</>
                    }
                  </p>
                </div>
              </div>
              <button onClick={dismissReminder} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '4px', flexShrink: 0 }} aria-label="Close">×</button>
            </div>

            {/* Form */}
            <div style={{ padding: isMobile ? '0.875rem 1rem' : '1rem 1.25rem' }}>
              {status === 'sent' ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', color: 'var(--teal)', fontWeight: 600, fontSize: '14px', padding: '0.25rem 0' }}>
                  ✓ Report on its way — check your inbox!
                </motion.p>
              ) : (
                <form onSubmit={handleSubmit(submit)} noValidate>
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '8px' }}>
                    <input {...register('name', { required: true })} placeholder="Full Name"
                      style={{ ...inputBase, ...(errors.name ? { borderColor: 'var(--danger)' } : {}), flex: isMobile ? undefined : 1 }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--teal)')}
                      onBlur={(e) => (e.target.style.borderColor = errors.name ? 'var(--danger)' : 'var(--border)')} />
                    <input {...register('email', { required: true, pattern: /\S+@\S+\.\S+/ })} type="email" placeholder="Work Email"
                      style={{ ...inputBase, ...(errors.email ? { borderColor: 'var(--danger)' } : {}), flex: isMobile ? undefined : 1 }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--teal)')}
                      onBlur={(e) => (e.target.style.borderColor = errors.email ? 'var(--danger)' : 'var(--border)')} />
                    <button type="submit" disabled={status === 'sending'}
                      style={{ background: 'var(--teal)', color: 'var(--white)', border: 'none', padding: '11px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', borderRadius: 0, whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal-dark)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--teal)')}>
                      {status === 'sending' ? 'Sending...' : 'Get My Free Report →'}
                    </button>
                  </div>
                  {status === 'error' && <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '6px' }}>Could not send — email us at consult@insurefirst.ae</p>}
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Strictly confidential. No spam.</p>
                </form>
              )}
            </div>
          </PopupWrap>
        )}
      </AnimatePresence>

      {/* Report reminder — minimized banner */}
      <AnimatePresence>
        {minimized && !done && !visible && (
          <BannerWrap topColor={color} onClick={expandReminder}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
              <div style={{ width: '30px', height: '30px', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '10px', fontWeight: 800, color }}>{result?.score}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1px', whiteSpace: 'nowrap' }}>Your report is ready</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {result?.savings != null ? `Est. ${savings} in annual savings` : 'Tap to get your free report'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ background: 'var(--teal)', color: 'var(--white)', padding: isMobile ? '6px 12px' : '7px 14px', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                Get Report →
              </span>
              <button onClick={fullyDismissRem} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '4px 2px' }} aria-label="Dismiss">×</button>
            </div>
          </BannerWrap>
        )}
      </AnimatePresence>

      {/* ── 2. "TRY THE TOOL" popup ──────────────────────────────────────── */}
      <AnimatePresence>
        {toolPromptVisible && !result && (
          <PopupWrap topColor="var(--teal)" onBackdrop={dismissToolPrompt} light>
            <div style={{ padding: isMobile ? '1rem' : '1.25rem 1.5rem' }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <div style={{ width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: isMobile ? '16px' : '20px' }}>
                    📊
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '3px' }}>Free Diagnostic Tool</p>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.25 }}>
                      Are You Overpaying on Insurance?
                    </p>
                  </div>
                </div>
                <button onClick={dismissToolPrompt} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '4px', flexShrink: 0 }} aria-label="Close">×</button>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Get a free risk score and estimated savings in under 2 minutes — no sign-up required.
              </p>

              {/* Stats + CTA */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.875rem', gap: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <div style={{ display: 'flex', gap: isMobile ? '1.25rem' : '1.5rem' }}>
                  {[['2 min', 'to complete'], ['Free', 'no cost'], ['500+', 'checked']].map(([num, lbl]) => (
                    <div key={num}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--teal)', lineHeight: 1 }}>{num}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{lbl}</div>
                    </div>
                  ))}
                </div>
                <button onClick={goToTool}
                  style={{ background: 'var(--teal)', color: 'var(--white)', border: 'none', padding: '11px 22px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', borderRadius: 0, whiteSpace: 'nowrap', transition: 'background 0.2s', width: isMobile ? '100%' : 'auto' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal-dark)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--teal)')}>
                  Try Free Tool →
                </button>
              </div>
            </div>
          </PopupWrap>
        )}
      </AnimatePresence>

      {/* "Try the tool" — minimized banner */}
      <AnimatePresence>
        {toolPromptMinimized && !result && !toolPromptVisible && (
          <BannerWrap topColor="var(--teal)" onClick={expandToolPrompt}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
              <div style={{ width: '30px', height: '30px', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '13px' }}>📊</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1px', whiteSpace: 'nowrap' }}>Free Risk Assessment</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Find out if you're overpaying — 2 min</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span onClick={(e) => { e.stopPropagation(); goToTool() }} style={{ background: 'var(--teal)', color: 'var(--white)', padding: isMobile ? '6px 12px' : '7px 14px', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                Try Free Tool →
              </span>
              <button onClick={fullyDismissTool} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '4px 2px' }} aria-label="Dismiss">×</button>
            </div>
          </BannerWrap>
        )}
      </AnimatePresence>
    </>
  )
}
