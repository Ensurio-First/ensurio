import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StepIndicator from './StepIndicator'
import ScoreResult, { ScoreRingOnly, ScoreLabelOnly } from './ScoreResult'
import LeadGateForm from './LeadGateForm'
import { useWindowWidth } from '../../hooks/useWindowWidth'

const STEPS = ['Company', 'Coverage', 'Claims']

const INDUSTRIES = [
  'Construction & Real Estate', 'Manufacturing', 'Trading & Distribution',
  'Hospitality & Tourism', 'Healthcare', 'Logistics & Transport',
  'Technology & IT', 'Financial Services', 'Retail', 'Other',
]

const SIZES = [
  { val: '1', label: '1 – 50', sub: 'employees' },
  { val: '2', label: '51 – 250', sub: 'employees' },
  { val: '3', label: '251 – 1,000', sub: 'employees' },
  { val: '4', label: '1,000+', sub: 'employees' },
]

const TURNOVERS = [
  { val: '1', label: 'Under $1M' },
  { val: '2', label: '$1M – $5M' },
  { val: '3', label: '$5M – $20M' },
  { val: '4', label: '$20M – $100M' },
  { val: '5', label: '$100M+' },
]

const POLICIES = [
  { val: '1', label: '1 – 3' },
  { val: '2', label: '4 – 7' },
  { val: '3', label: '8 – 15' },
  { val: '4', label: '15+' },
]

const COVER_TYPES = [
  'Property / Assets', 'Public Liability', 'Marine / Cargo', 'Motor Fleet',
  'Directors & Officers', 'Workers Compensation', 'Professional Indemnity', 'Cyber Liability',
]

const CLAIMS = [
  { val: '0', label: 'None', sub: 'last 3 years' },
  { val: '1', label: '1 – 2', sub: 'claims' },
  { val: '2', label: '3 – 5', sub: 'claims' },
  { val: '3', label: '6+', sub: 'claims' },
]

const PREM_CHANGES = [
  { val: 'up', label: 'Increased', icon: '↑↑' },
  { val: 'slight', label: 'Slight rise', icon: '↑' },
  { val: 'flat', label: 'Stayed flat', icon: '→' },
  { val: 'down', label: 'Decreased', icon: '↓' },
]

const AUDIT_AGES = [
  { val: '0', label: 'Never', sub: '/ Not sure' },
  { val: '1', label: '3+ years', sub: 'ago' },
  { val: '2', label: '1 – 3 yrs', sub: 'ago' },
  { val: '3', label: 'Last year', sub: '< 12 months' },
]

/* ── Shared UI primitives ────────────────────────────────────────────── */

function TileGrid({ options, value, onChange, cols = 4, mobileCols }) {
  const colCount = mobileCols ?? cols
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colCount}, 1fr)`, gap: '8px', marginTop: '6px' }}>
      {options.map((opt) => {
        const active = value === opt.val
        return (
          <motion.div
            key={opt.val}
            onClick={() => onChange(opt.val)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '12px 8px',
              border: `2px solid ${active ? 'var(--teal)' : 'var(--border)'}`,
              background: active ? 'var(--teal-pale)' : 'var(--white)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'border-color 0.15s, background 0.15s',
              userSelect: 'none',
              position: 'relative',
              minHeight: '52px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {active && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: '4px', right: '4px',
                  width: '14px', height: '14px', background: 'var(--teal)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', color: 'var(--white)', fontWeight: 700,
                }}
              >
                ✓
              </motion.div>
            )}
            <div style={{ fontSize: '13px', fontWeight: active ? 700 : 500, color: active ? 'var(--navy)' : 'var(--text-dark)', lineHeight: 1.25 }}>
              {opt.icon && <span style={{ display: 'block', fontSize: '16px', marginBottom: '2px' }}>{opt.icon}</span>}
              {opt.label}
            </div>
            {opt.sub && (
              <div style={{ fontSize: '10px', color: active ? 'var(--teal-dark)' : 'var(--text-muted)', marginTop: '3px' }}>
                {opt.sub}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

function FieldLabel({ children }) {
  return (
    <label style={{
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      color: 'var(--text-mid)',
      display: 'block',
      marginBottom: '2px',
    }}>
      {children}
    </label>
  )
}

const selectStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '2px solid var(--border)',
  borderRadius: 0,
  fontSize: '13px',
  fontFamily: 'var(--font-body)',
  color: 'var(--text-dark)',
  background: 'var(--white)',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%230D1B4B' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '34px',
  transition: 'border-color 0.2s',
}

const btnBase = {
  border: 'none',
  padding: '10px 22px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  borderRadius: 0,
  transition: 'all 0.15s',
}

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
}

function calcScore({ size, claims, auditAge, premChange, coverCount, policies }) {
  let score = 50
  if (auditAge === '0') score -= 20
  else if (auditAge === '1') score -= 10
  else if (auditAge === '2') score += 5
  else score += 15
  if (claims === '0') score += 15
  else if (claims === '1') score += 5
  else if (claims === '2') score -= 10
  else score -= 20
  if (Number(policies) >= 3) score -= 8
  if (coverCount < 3) score -= 10
  if (premChange === 'up') score -= 15
  else if (premChange === 'slight') score -= 5
  else if (premChange === 'flat') score += 5
  else score += 15
  return Math.max(10, Math.min(95, score))
}

const initForm = {
  industry: '', size: '', turnover: '',
  premium: 100000, policies: '',
  covers: [], claims: '', premChange: '', auditAge: '',
}

export default function PremiumCheck() {
  const width = useWindowWidth()
  const isDesktop = width > 900
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [done, setDone] = useState(false)
  const [result, setResult] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState(initForm)
  const [error, setError] = useState('')

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError('') }
  const toggleCover = (c) =>
    set('covers', form.covers.includes(c) ? form.covers.filter((x) => x !== c) : [...form.covers, c])

  const next = () => { setDir(1); setStep((s) => s + 1) }
  const back = () => { setDir(-1); setStep((s) => s - 1); setError('') }

  const validateStep = () => {
    if (step === 0 && (!form.industry || !form.size || !form.turnover)) {
      setError('Please complete all selections above.')
      return false
    }
    if (step === 1 && !form.policies) {
      setError('Please select your number of active policies.')
      return false
    }
    if (step === 2 && (!form.claims || !form.premChange || !form.auditAge)) {
      setError('Please complete all selections above.')
      return false
    }
    return true
  }

  const generate = () => {
    const score = calcScore({
      size: form.size, claims: form.claims, auditAge: form.auditAge,
      premChange: form.premChange, coverCount: form.covers.length, policies: form.policies,
    })
    const pct = score < 40 ? 0.28 : score < 55 ? 0.20 : score < 70 ? 0.13 : 0.07
    const savings = Math.round(form.premium * pct)
    const desc =
      score < 40 ? 'Your portfolio shows multiple high-risk indicators. Overpayment and coverage gaps are likely. An IOP audit is strongly recommended.'
      : score < 55 ? 'Several structural weaknesses identified. Targeted optimisation could deliver material premium savings.'
      : score < 70 ? 'Reasonably structured, but opportunities exist to reduce TCOR and improve underwriter positioning.'
      : 'Your risk profile is mature. Incremental gains available through deductible restructuring and renewal strategy.'
    const insights = []
    if (form.auditAge < '2') insights.push({ icon: '⚠', text: 'No recent policy audit detected — policies accumulate coverage misalignment and premium bloat without periodic review.' })
    if (Number(form.claims) > 1) insights.push({ icon: '⚠', text: 'Multiple recent claims may be flagging your risk profile to underwriters, resulting in higher renewal premiums.' })
    if (form.covers.length < 4) insights.push({ icon: '⚠', text: 'Potential coverage gaps detected. Missing policy classes may leave significant corporate exposures unprotected.' })
    if (form.premChange === 'up' || form.premChange === 'slight') insights.push({ icon: '⚠', text: 'Consistent premium increases suggest your underwriting profile needs active risk-profiling management.' })
    insights.push({ icon: '✓', text: 'An IOP Phase I audit will benchmark your TCOR against industry peers and identify immediate quick wins.' })
    setResult({ score, savings, desc, insights })
    setDone(true)
    window.dispatchEvent(new CustomEvent('ensurio:result', { detail: { score, savings } }))
  }

  if (submitted) {
    return (
      <motion.div style={{ textAlign: 'center', padding: '2.5rem 1rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{
          width: '52px', height: '52px', background: 'var(--teal)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem', fontSize: '22px', color: 'var(--white)',
        }}>✓</div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--navy)' }}>
          Report on its Way!
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Your Premium Efficiency Report will be sent within one business day. Our team may reach out to schedule a complimentary consultation.
        </p>
        <button
          style={{ ...btnBase, background: 'var(--navy)', color: 'var(--white)', marginTop: '1.5rem' }}
          onClick={() => { setStep(0); setDone(false); setSubmitted(false); setResult(null); setForm(initForm) }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--navy)')}
        >
          Start New Assessment
        </button>
      </motion.div>
    )
  }

  return (
    <>
      <StepIndicator steps={STEPS} current={done ? 3 : step} />

      <AnimatePresence mode="wait" custom={dir}>
        {/* ── Step 0: Company ── */}
        {!done && step === 0 && (
          <motion.div key="s0" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            {isDesktop ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <FieldLabel>Industry Sector</FieldLabel>
                  <select style={{ ...selectStyle, borderColor: form.industry ? 'var(--navy)' : 'var(--border)' }} value={form.industry} onChange={(e) => set('industry', e.target.value)} onFocus={(e) => (e.target.style.borderColor = 'var(--navy)')} onBlur={(e) => (e.target.style.borderColor = form.industry ? 'var(--navy)' : 'var(--border)')}>
                    <option value="">Select your sector</option>
                    {INDUSTRIES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Company Size</FieldLabel>
                  <TileGrid options={SIZES} value={form.size} onChange={(v) => set('size', v)} cols={4} />
                </div>
                <div>
                  <FieldLabel>Annual Turnover (USD)</FieldLabel>
                  <TileGrid options={TURNOVERS} value={form.turnover} onChange={(v) => set('turnover', v)} cols={5} />
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <FieldLabel>Industry Sector</FieldLabel>
                  <select style={{ ...selectStyle, borderColor: form.industry ? 'var(--navy)' : 'var(--border)' }} value={form.industry} onChange={(e) => set('industry', e.target.value)} onFocus={(e) => (e.target.style.borderColor = 'var(--navy)')} onBlur={(e) => (e.target.style.borderColor = form.industry ? 'var(--navy)' : 'var(--border)')}>
                    <option value="">Select your sector</option>
                    {INDUSTRIES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <FieldLabel>Company Size</FieldLabel>
                  <TileGrid options={SIZES} value={form.size} onChange={(v) => set('size', v)} cols={2} />
                </div>
                <div style={{ marginBottom: '0.25rem' }}>
                  <FieldLabel>Annual Turnover (USD)</FieldLabel>
                  <TileGrid options={TURNOVERS} value={form.turnover} onChange={(v) => set('turnover', v)} cols={3} />
                </div>
              </>
            )}
            <BtnRow error={error} onNext={() => { if (validateStep()) next() }} nextLabel="Continue →" />
          </motion.div>
        )}

        {/* ── Step 1: Coverage ── */}
        {!done && step === 1 && (
          <motion.div key="s1" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            {isDesktop ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <FieldLabel>Annual Insurance Premium (USD)</FieldLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                      <input type="range" style={{ flex: 1, accentColor: 'var(--teal)', cursor: 'pointer' }} min="5000" max="2000000" step="5000" value={form.premium} onChange={(e) => set('premium', Number(e.target.value))} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', minWidth: '80px', textAlign: 'right', fontFamily: 'var(--font-heading)' }}>${Number(form.premium).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>$5K</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>$2M</span>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Active Policies</FieldLabel>
                    <TileGrid options={POLICIES} value={form.policies} onChange={(v) => set('policies', v)} cols={2} />
                  </div>
                </div>
                <div>
                  <FieldLabel>Cover Types Currently Held</FieldLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '6px' }}>
                    {COVER_TYPES.map((c) => {
                      const active = form.covers.includes(c)
                      return (
                        <motion.div key={c} onClick={() => toggleCover(c)} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 9px', border: `2px solid ${active ? 'var(--teal)' : 'var(--border)'}`, background: active ? 'var(--teal-pale)' : 'var(--white)', cursor: 'pointer', fontSize: '11px', color: active ? 'var(--navy)' : 'var(--text-muted)', fontWeight: active ? 500 : 400, userSelect: 'none', transition: 'all 0.15s' }}>
                          <span style={{ width: '14px', height: '14px', background: active ? 'var(--teal)' : 'transparent', border: `2px solid ${active ? 'var(--teal)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: 'var(--white)', flexShrink: 0, transition: 'all 0.15s' }}>{active ? '✓' : ''}</span>
                          {c}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <FieldLabel>Annual Insurance Premium (USD)</FieldLabel>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <input type="range" style={{ flex: 1, accentColor: 'var(--teal)', cursor: 'pointer', height: '4px' }} min="5000" max="2000000" step="5000" value={form.premium} onChange={(e) => set('premium', Number(e.target.value))} />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)', minWidth: '90px', textAlign: 'right', fontFamily: 'var(--font-heading)' }}>${Number(form.premium).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>$5K</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>$2M</span>
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <FieldLabel>Active Policies</FieldLabel>
                  <TileGrid options={POLICIES} value={form.policies} onChange={(v) => set('policies', v)} cols={2} />
                </div>
                <div style={{ marginBottom: '0.25rem' }}>
                  <FieldLabel>Cover Types Currently Held</FieldLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
                    {COVER_TYPES.map((c) => {
                      const active = form.covers.includes(c)
                      return (
                        <motion.div key={c} onClick={() => toggleCover(c)} whileTap={{ scale: 0.97 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 10px', border: `2px solid ${active ? 'var(--teal)' : 'var(--border)'}`, background: active ? 'var(--teal-pale)' : 'var(--white)', cursor: 'pointer', fontSize: '12px', color: active ? 'var(--navy)' : 'var(--text-muted)', fontWeight: active ? 600 : 400, userSelect: 'none', transition: 'all 0.15s' }}>
                          <span style={{ width: '16px', height: '16px', flexShrink: 0, background: active ? 'var(--teal)' : 'transparent', border: `2px solid ${active ? 'var(--teal)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'var(--white)', transition: 'all 0.15s' }}>{active ? '✓' : ''}</span>
                          {c}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
            <BtnRow error={error} onBack={back} onNext={() => { if (validateStep()) next() }} nextLabel="Continue →" />
          </motion.div>
        )}

        {/* ── Step 2: Claims ── */}
        {!done && step === 2 && (
          <motion.div key="s2" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            {isDesktop ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <FieldLabel>Claims Filed — Last 3 Years</FieldLabel>
                    <TileGrid options={CLAIMS} value={form.claims} onChange={(v) => set('claims', v)} cols={2} />
                  </div>
                  <div>
                    <FieldLabel>Premium Trend — Last 2 Renewals</FieldLabel>
                    <TileGrid options={PREM_CHANGES} value={form.premChange} onChange={(v) => set('premChange', v)} cols={2} />
                  </div>
                </div>
                <div>
                  <FieldLabel>Last Full Policy Audit</FieldLabel>
                  <TileGrid options={AUDIT_AGES} value={form.auditAge} onChange={(v) => set('auditAge', v)} cols={2} />
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <FieldLabel>Claims Filed — Last 3 Years</FieldLabel>
                  <TileGrid options={CLAIMS} value={form.claims} onChange={(v) => set('claims', v)} cols={2} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <FieldLabel>Premium Trend — Last 2 Renewals</FieldLabel>
                  <TileGrid options={PREM_CHANGES} value={form.premChange} onChange={(v) => set('premChange', v)} cols={2} />
                </div>
                <div style={{ marginBottom: '0.25rem' }}>
                  <FieldLabel>Last Full Policy Audit</FieldLabel>
                  <TileGrid options={AUDIT_AGES} value={form.auditAge} onChange={(v) => set('auditAge', v)} cols={2} />
                </div>
              </>
            )}
            <BtnRow
              error={error}
              onBack={back}
              onNext={() => { if (validateStep()) generate() }}
              nextLabel="Generate Report →"
              nextStyle={{ background: 'var(--teal)' }}
              nextHover={{ background: 'var(--teal-dark)' }}
            />
          </motion.div>
        )}

        {/* ── Result ── */}
        {done && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {isDesktop ? (
              /* Desktop: 3-zone layout
                 Zone 1 (full-width): score ring + label inline
                 Zone 2 (2-col): savings | insights
                 Zone 3 (full-width): lead form
              */
              <div>
                {/* Zone 1 — Score header: ring left, label+desc right */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '1.5rem',
                  padding: '1rem 1.25rem',
                  background: 'var(--light-bg)',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: '1rem',
                }}>
                  <ScoreRingOnly score={result.score} />
                  <div>
                    <ScoreLabelOnly score={result.score} />
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '480px', marginTop: '4px' }}>
                      {result.desc}
                    </p>
                  </div>
                </div>

                {/* Zone 2 — Savings + Insights */}
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', background: 'var(--light-bg)', borderBottom: '1px solid var(--border)' }}>
                  {/* Savings panel */}
                  <div style={{ background: 'var(--light-bg)', borderTop: '3px solid var(--teal)', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', lineHeight: 1.5 }}>Est. Annual<br/>Savings via IOP</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--teal)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                      ${result.savings.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>Subject to full audit</div>
                  </div>

                  {/* Insights */}
                  <div style={{ padding: '0.875rem 1rem' }}>
                    {result.insights.map((ins, i) => {
                      const isPositive = ins.icon === '✓'
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08, duration: 0.3 }}
                          style={{
                            display: 'flex', gap: '10px', alignItems: 'flex-start',
                            padding: '8px 10px',
                            marginBottom: i < result.insights.length - 1 ? '5px' : 0,
                            background: isPositive ? 'rgba(0,184,153,0.07)' : 'rgba(245,158,11,0.07)',
                            borderLeft: `3px solid ${isPositive ? 'var(--teal)' : '#F59E0B'}`,
                          }}
                        >
                          <span style={{
                            flexShrink: 0, width: '20px', height: '20px',
                            background: isPositive ? 'var(--teal)' : '#F59E0B',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', color: 'var(--white)', fontWeight: 800,
                            marginTop: '1px',
                          }}>
                            {isPositive ? '✓' : '!'}
                          </span>
                          <span style={{ fontSize: '13px', color: 'var(--text-dark)', lineHeight: 1.6, fontWeight: isPositive ? 400 : 500 }}>
                            {ins.text}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Zone 3 — Lead form full width */}
                <LeadGateForm
                  reportLabel="Premium Efficiency Report"
                  tool="Insurance Premium Check"
                  score={result.score}
                  onSubmit={() => { setSubmitted(true); window.dispatchEvent(new CustomEvent('ensurio:submitted')) }}
                  horizontal
                />
              </div>
            ) : (
              /* Mobile: original stacked layout */
              <>
                <ScoreResult score={result.score} description={result.desc} />
                <div style={{
                  background: 'var(--light-bg)',
                  borderTop: '3px solid var(--teal)',
                  borderBottom: '1px solid var(--border)',
                  padding: '0.875rem 1rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: '0.875rem',
                }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Est. Annual Savings via IOP
                    </div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--teal)' }}>
                      ${result.savings.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Subject to<br />full audit
                  </div>
                </div>
                <div style={{ marginBottom: '0.875rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.insights.map((ins, i) => {
                    const isPositive = ins.icon === '✓'
                    return (
                      <div key={i} style={{
                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                        padding: '10px 12px',
                        background: isPositive ? 'rgba(0,184,153,0.07)' : 'rgba(245,158,11,0.07)',
                        borderLeft: `3px solid ${isPositive ? 'var(--teal)' : '#F59E0B'}`,
                      }}>
                        <span style={{
                          flexShrink: 0, width: '20px', height: '20px',
                          background: isPositive ? 'var(--teal)' : '#F59E0B',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '10px', color: 'var(--white)', fontWeight: 800, marginTop: '1px',
                        }}>
                          {isPositive ? '✓' : '!'}
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--text-dark)', lineHeight: 1.6, fontWeight: isPositive ? 400 : 500 }}>
                          {ins.text}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <LeadGateForm
                  reportLabel="Premium Efficiency Report"
                  tool="Insurance Premium Check"
                  score={result.score}
                  onSubmit={() => { setSubmitted(true); window.dispatchEvent(new CustomEvent('ensurio:submitted')) }}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Button row ── */
function BtnRow({ error, onBack, onNext, nextLabel, nextStyle = {}, nextHover = {} }) {
  const [hovered, setHovered] = useState(false)
  const base = { background: 'var(--navy)', color: 'var(--white)', ...nextStyle }
  const hover = { background: '#0a1640', ...nextHover }

  return (
    <div style={{ marginTop: '1rem' }}>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '11px', color: 'var(--danger)', marginBottom: '8px', fontWeight: 500 }}
        >
          ⚠ {error}
        </motion.p>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {onBack ? (
          <button
            style={{ ...btnBase, background: 'transparent', color: 'var(--text-muted)', border: '2px solid var(--border)', padding: '10px 16px' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--navy)'; e.currentTarget.style.color = 'var(--navy)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            onClick={onBack}
          >
            ← Back
          </button>
        ) : <span />}

        <motion.button
          style={{ ...btnBase, ...base, color: 'var(--white)' }}
          onMouseEnter={(e) => { Object.assign(e.currentTarget.style, hover); setHovered(true) }}
          onMouseLeave={(e) => { Object.assign(e.currentTarget.style, base); setHovered(false) }}
          onClick={onNext}
          whileTap={{ scale: 0.97 }}
        >
          {nextLabel}
        </motion.button>
      </div>
    </div>
  )
}
