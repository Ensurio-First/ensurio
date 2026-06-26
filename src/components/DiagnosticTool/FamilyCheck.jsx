import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StepIndicator from './StepIndicator'
import { ScoreRingOnly, ScoreLabelOnly } from './ScoreResult'
import LeadGateForm from './LeadGateForm'
import { useWindowWidth } from '../../hooks/useWindowWidth'

const STEPS = ['Governance', 'Succession', 'Legacy']

const QUESTIONS = [
  {
    step: 0, key: 'q1',
    text: 'Does your family business have a formal MOA/AOA in place?',
    options: ['No formal documents exist', 'Basic documents, not reviewed recently', 'Up-to-date MOA/AOA in place', 'Fully tailored for multi-generational transfer'],
  },
  {
    step: 0, key: 'q2',
    text: 'Are family roles, decision-making authority, and ownership rights clearly defined in writing?',
    options: ['Not at all — handled informally', 'Partially — some verbal agreements', 'Mostly documented, some gaps', 'Fully documented and signed'],
  },
  {
    step: 1, key: 'q3',
    text: 'Is there an identified and groomed successor for current leadership?',
    options: ['No successor identified', 'Identified but no formal plan', 'Successor being actively mentored', 'Formal succession plan documented & tested'],
  },
  {
    step: 1, key: 'q4',
    text: 'How is ownership transfer to the next generation structured?',
    options: ['No structure exists', 'Informally discussed with family', 'Partially structured (shares, trusts)', 'Fully structured with legal instruments'],
  },
  {
    step: 2, key: 'q5',
    text: 'Does your estate planning include a corporate Will or legal legacy structure?',
    options: ['No Will or estate plan exists', 'Personal Will only, no corporate coverage', 'Corporate Will exists, needs review', 'Fully updated corporate estate structure'],
  },
  {
    step: 2, key: 'q6',
    text: 'How would you rate your key stakeholder relationships (suppliers, buyers)?',
    options: ['Transactional, no formal trust built', 'Cordial, but owner-dependent', 'Strong, partially institutionalized', 'Institutional trust, not person-dependent'],
  },
]

const btnBase = {
  border: 'none', padding: '10px 22px', fontSize: '13px', fontWeight: 600,
  cursor: 'pointer', fontFamily: 'var(--font-body)', borderRadius: 0, transition: 'all 0.15s',
}

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
}

function MatBar({ value }) {
  const color = value < 40 ? '#EF4444' : value < 60 ? '#F59E0B' : value < 75 ? '#00B899' : '#10B981'
  return (
    <div style={{ height: '3px', background: 'var(--border)', marginTop: '8px', overflow: 'hidden' }}>
      <motion.div style={{ height: '100%', background: color }} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }} />
    </div>
  )
}

export default function FamilyCheck() {
  const width = useWindowWidth()
  const isDesktop = width > 900
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [answers, setAnswers] = useState({})
  const [done, setDone] = useState(false)
  const [result, setResult] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const answer = (key, val) => setAnswers((a) => ({ ...a, [key]: val }))
  const stepQuestions = QUESTIONS.filter((q) => q.step === step)

  const next = () => {
    if (stepQuestions.find((q) => answers[q.key] === undefined)) return alert('Please answer all questions before continuing.')
    setDir(1); setStep((s) => s + 1)
  }
  const back = () => { setDir(-1); setStep((s) => s - 1) }

  const generate = () => {
    if (stepQuestions.find((q) => answers[q.key] === undefined)) return alert('Please answer all questions before continuing.')
    const gov = Math.round(((answers.q1 || 0) + (answers.q2 || 0)) / 6 * 100)
    const suc = Math.round(((answers.q3 || 0) + (answers.q4 || 0)) / 6 * 100)
    const leg = Math.round(((answers.q5 || 0) + (answers.q6 || 0)) / 6 * 100)
    const total = Math.round((gov + suc + leg) / 3)
    const desc =
      total < 35 ? 'Your family business lacks foundational continuity structures. Without intervention, leadership transitions carry significant risk of disruption and value erosion.'
      : total < 55 ? 'Some structures exist, but critical areas like succession and estate planning require urgent attention before the next generation takes over.'
      : total < 75 ? 'A solid foundation is in place. Targeted improvements in governance and legacy documentation will significantly increase enterprise resilience.'
      : 'Your family business demonstrates strong continuity readiness. Focus on maintaining and institutionalizing your existing frameworks.'
    const insights = []
    if (gov < 50) insights.push({ icon: '⚠', text: 'Governance gap: MOA/AOA and role definitions are insufficient. Informal arrangements create legal and operational risk during transitions.' })
    if (suc < 50) insights.push({ icon: '⚠', text: 'Succession risk: No clearly documented leadership transfer plan — the single largest threat to family business continuity.' })
    if (leg < 50) insights.push({ icon: '⚠', text: 'Legacy exposure: Without a corporate Will and estate structure, ownership transfer may trigger legal disputes and tax inefficiencies.' })
    if ((answers.q6 || 0) < 2) insights.push({ icon: '⚠', text: 'Stakeholder risk: Key relationships are owner-dependent. Loss of leadership may disrupt supplier and buyer confidence.' })
    insights.push({ icon: '✓', text: 'A structured consultation with our Management Consultancy team will map your highest-priority actions and a clear path forward.' })
    setResult({ total, gov, suc, leg, desc, insights })
    setDone(true)
    window.dispatchEvent(new CustomEvent('ensurio:result', { detail: { score: total, savings: null } }))
  }

  const reset = () => { setStep(0); setDone(false); setSubmitted(false); setResult(null); setAnswers({}) }

  if (submitted) {
    return (
      <motion.div style={{ textAlign: 'center', padding: '2.5rem 1rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ width: '52px', height: '52px', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '22px', color: 'var(--white)' }}>✓</div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--navy)' }}>Playbook on its Way!</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Your Family Business Continuity Playbook will be sent within one business day. Our team may reach out to arrange a complimentary discovery session.
        </p>
        <button style={{ ...btnBase, background: 'var(--navy)', color: 'var(--white)', marginTop: '1.5rem' }} onClick={reset}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--navy)')}>
          Start New Assessment
        </button>
      </motion.div>
    )
  }

  return (
    <>
      <StepIndicator steps={STEPS} current={done ? 3 : step} />

      <AnimatePresence mode="wait" custom={dir}>
        {/* ── Question steps ── */}
        {!done && (
          <motion.div key={`step-${step}`} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            {stepQuestions.map((q) => (
              <div key={q.key} style={{ background: 'var(--light-bg)', border: '1px solid var(--border)', padding: '0.875rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1.5, marginBottom: '0.625rem' }}>{q.text}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {q.options.map((opt, i) => {
                    const sel = answers[q.key] === i
                    return (
                      <motion.div
                        key={i}
                        onClick={() => answer(q.key, i)}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '8px',
                          padding: '8px 10px',
                          border: `2px solid ${sel ? 'var(--teal)' : 'var(--border)'}`,
                          background: sel ? 'var(--teal-pale)' : 'var(--white)',
                          cursor: 'pointer', fontSize: '12px',
                          color: sel ? 'var(--navy)' : 'var(--text-muted)',
                          fontWeight: sel ? 500 : 400,
                          lineHeight: 1.4, userSelect: 'none', transition: 'all 0.15s',
                        }}
                      >
                        <span style={{
                          width: '14px', height: '14px', flexShrink: 0, marginTop: '1px',
                          background: sel ? 'var(--teal)' : 'transparent',
                          border: `2px solid ${sel ? 'var(--teal)' : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '8px', color: 'var(--white)', fontWeight: 700, transition: 'all 0.15s',
                        }}>
                          {sel ? '✓' : ''}
                        </span>
                        {opt}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Button row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              {step > 0 ? (
                <button style={{ ...btnBase, background: 'transparent', color: 'var(--text-muted)', border: '2px solid var(--border)', padding: '10px 16px' }} onClick={back}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--navy)'; e.currentTarget.style.color = 'var(--navy)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                  ← Back
                </button>
              ) : <span />}
              <button
                style={{ ...btnBase, background: step < 2 ? 'var(--navy)' : 'var(--teal)', color: 'var(--white)' }}
                onClick={step < 2 ? next : generate}
                onMouseEnter={(e) => (e.currentTarget.style.background = step < 2 ? '#0a1640' : 'var(--teal-dark)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = step < 2 ? 'var(--navy)' : 'var(--teal)')}>
                {step < 2 ? 'Continue →' : 'Generate Report →'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Result ── */}
        {done && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {isDesktop ? (
              <div>
                {/* Zone 1 — Score header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem 1.25rem', background: 'var(--light-bg)', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
                  <ScoreRingOnly score={result.total} />
                  <div>
                    <ScoreLabelOnly score={result.total} />
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '480px', marginTop: '4px' }}>{result.desc}</p>
                  </div>
                </div>

                {/* Zone 2 — Maturity scores | Insights */}
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', background: 'var(--light-bg)', borderBottom: '1px solid var(--border)' }}>
                  {/* Maturity panel */}
                  <div style={{ background: 'var(--navy)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>Maturity Scores</div>
                    {[['Governance', result.gov], ['Succession', result.suc], ['Legacy', result.leg]].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--teal)' }}>{val}</span>
                        </div>
                        <MatBar value={val} />
                      </div>
                    ))}
                  </div>

                  {/* Insights */}
                  <div style={{ padding: '0.875rem 1rem' }}>
                    {result.insights.map((ins, i) => {
                      const isPositive = ins.icon === '✓'
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, duration: 0.3 }}
                          style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 10px', marginBottom: i < result.insights.length - 1 ? '5px' : 0, background: isPositive ? 'rgba(0,184,153,0.07)' : 'rgba(245,158,11,0.07)', borderLeft: `3px solid ${isPositive ? 'var(--teal)' : '#F59E0B'}` }}>
                          <span style={{ flexShrink: 0, width: '20px', height: '20px', background: isPositive ? 'var(--teal)' : '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--white)', fontWeight: 800, marginTop: '1px' }}>
                            {isPositive ? '✓' : '!'}
                          </span>
                          <span style={{ fontSize: '13px', color: 'var(--text-dark)', lineHeight: 1.6, fontWeight: isPositive ? 400 : 500 }}>{ins.text}</span>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Zone 3 — Lead form */}
                <LeadGateForm
                  reportLabel="Family Business Continuity Playbook"
                  tool="Family Business Readiness"
                  score={result.total}
                  onSubmit={() => { setSubmitted(true); window.dispatchEvent(new CustomEvent('ensurio:submitted')) }}
                  horizontal
                />
              </div>
            ) : (
              /* Mobile stacked */
              <>
                {/* Score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem', background: 'var(--light-bg)', borderBottom: '1px solid var(--border)', marginBottom: '0.875rem' }}>
                  <ScoreRingOnly score={result.total} />
                  <div>
                    <ScoreLabelOnly score={result.total} />
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '3px' }}>{result.desc}</p>
                  </div>
                </div>

                {/* Maturity scores */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'var(--border)', marginBottom: '0.875rem' }}>
                  {[['Governance', result.gov], ['Succession', result.suc], ['Legacy', result.leg]].map(([label, val]) => (
                    <div key={label} style={{ background: 'var(--navy)', padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--teal)', lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{label}</div>
                      <MatBar value={val} />
                    </div>
                  ))}
                </div>

                {/* Insights */}
                <div style={{ marginBottom: '0.875rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.insights.map((ins, i) => {
                    const isPositive = ins.icon === '✓'
                    return (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: isPositive ? 'rgba(0,184,153,0.07)' : 'rgba(245,158,11,0.07)', borderLeft: `3px solid ${isPositive ? 'var(--teal)' : '#F59E0B'}` }}>
                        <span style={{ flexShrink: 0, width: '20px', height: '20px', background: isPositive ? 'var(--teal)' : '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--white)', fontWeight: 800, marginTop: '1px' }}>
                          {isPositive ? '✓' : '!'}
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--text-dark)', lineHeight: 1.6, fontWeight: isPositive ? 400 : 500 }}>{ins.text}</span>
                      </div>
                    )
                  })}
                </div>

                <LeadGateForm
                  reportLabel="Family Business Continuity Playbook"
                  tool="Family Business Readiness"
                  score={result.total}
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
