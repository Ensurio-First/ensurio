import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, X, HelpCircle, Phone, ShieldAlert } from 'lucide-react'
import useToolEngine, { ANSWERS } from './useToolEngine'
import { CHECK_ANCHOR_ID } from './scrollToCheck'
import ToolCapture from './ToolCapture'
import FindingList from './FindingList'
import { useLeadJourney } from '../../context/LeadJourneyContext'

/*
 * The on-page coverage check — one question at a time, a score they earn, and
 * the capture form sitting inside the result rather than on another page.
 *
 * Replaces the old tick-five-boxes CoverageGapCheck for every `gapcheck` block
 * across the service, solution, industry, and audience pages. It reads the same
 * block shape, so blocks upgrade as their content is deepened rather than all
 * at once.
 */

// The existing blocks already encode the service in their CTA link, e.g.
// `/contact?service=Construction%20Review` — reuse it so leads stay tagged.
function serviceFrom(block) {
  const m = block.cta?.href?.match(/[?&]service=([^&]+)/)
  return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : block.title
}

const toolIdFrom = (service) =>
  `coverage-check-${service.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`

const OPTIONS = [
  { value: ANSWERS.YES, label: 'Yes', Icon: Check, tone: 'var(--teal)' },
  { value: ANSWERS.NO, label: 'No', Icon: X, tone: '#EF4444' },
  { value: ANSWERS.UNSURE, label: 'Not sure', Icon: HelpCircle, tone: '#F59E0B' },
]

export default function CoverageCheck({ block, isMobile }) {
  const engine = useToolEngine(block.items)
  const { startCheck } = useLeadJourney()

  const [phase, setPhase] = useState('intro') // intro | question | result | done
  const [receipt, setReceipt] = useState(null)

  const { questions, index, current, currentAnswer, result } = engine
  const service = serviceFrom(block)

  // A block with no items has nothing to ask — render nothing rather than crash.
  if (questions.length === 0) return null

  /* ── Flow ─────────────────────────────────────────────────────────── */

  const advance = () => (engine.isLast ? setPhase('result') : engine.next())

  const handleAnswer = (value) => {
    engine.answer(value)
    startCheck(toolIdFrom(service))
    // Pause only when there is something to learn — a "yes" has no consequence
    // to show, and the legacy blocks have no consequence copy at all, so those
    // stay a single tap per question.
    if (value !== ANSWERS.YES && current.consequence) return
    advance()
  }

  // What travels with the lead: the raw answers, plus the computed result in the
  // shape the confirmation email and the advisor alert both render from.
  const leadPayload = () => {
    const { score, findings, band } = result
    return {
      service,
      source: 'coverage-check',
      toolId: toolIdFrom(service),
      reportTitle: `Your ${service}`,
      message: `${block.title} — scored ${score}/100 with ${findings.length} gap${findings.length === 1 ? '' : 's'} flagged.`,
      details: {
        check: block.title,
        answers: questions.map((q, i) => ({ statement: q.statement, answer: engine.answers[i] })),
      },
      report: {
        score,
        headline: findings.length
          ? `You flagged ${findings.length} area${findings.length === 1 ? '' : 's'} worth a closer look.`
          : 'Your answers suggest your cover is in good shape.',
        summary: band.label,
        findings: findings.map((f) => ({
          title: f.gapTitle,
          detail: f.consequence || undefined,
          severity: f.severity,
        })),
      },
    }
  }

  /* ── Shared chrome ────────────────────────────────────────────────── */

  const shell = {
    border: '1px solid var(--border)',
    borderTop: '4px solid var(--teal)',
    background: 'var(--white)',
    boxShadow: 'var(--shadow-md)',
    margin: '1.25rem 0 2rem',
  }
  const pad = { padding: isMobile ? '1.25rem' : '1.75rem 2rem' }
  const badge = {
    fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'var(--teal-dark)', background: 'var(--teal-pale)', padding: '3px 9px',
  }
  const heading = {
    fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--navy)',
    fontSize: isMobile ? '1.2rem' : '1.4rem', letterSpacing: '-0.02em', margin: '0.75rem 0 0.35rem',
  }
  const muted = { fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6 }
  const primaryBtn = {
    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px',
    background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700,
  }

  // The engine speaks in {gapTitle, consequence}; FindingList speaks in
  // {title, detail}. Map once here rather than teaching the shared component
  // about this tool's vocabulary.
  const asFindings = (list) =>
    list.map((f) => ({
      title: f.gapTitle,
      detail: f.consequence,
      severity: f.severity,
      note: f.answer === ANSWERS.UNSURE ? 'Unconfirmed — worth checking' : undefined,
    }))

  /* ── Intro ────────────────────────────────────────────────────────── */

  if (phase === 'intro') {
    return (
      <div id={CHECK_ANCHOR_ID} style={shell}>
        <div style={pad}>
          <span style={badge}>Quick check</span>
          <h3 style={heading}>{block.title}</h3>
          {block.subtitle && <p style={{ ...muted, margin: '0 0 1.25rem' }}>{block.subtitle}</p>}
          <button type="button" style={primaryBtn} onClick={() => { startCheck(toolIdFrom(service)); setPhase('question') }}>
            Start the check <ArrowRight size={15} />
          </button>
          <p style={{ ...muted, fontSize: '12.5px', margin: '0.85rem 0 0' }}>
            {questions.length} questions · about a minute · your score shows before you give any details
          </p>
        </div>
      </div>
    )
  }

  /* ── Questions ────────────────────────────────────────────────────── */

  if (phase === 'question') {
    const showConsequence = currentAnswer && currentAnswer !== ANSWERS.YES && current.consequence
    return (
      <div id={CHECK_ANCHOR_ID} style={shell}>
        <div style={{ height: '3px', background: 'var(--border)' }}>
          <motion.div
            style={{ height: '100%', background: 'var(--teal)' }}
            animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div style={pad}>
          <div style={{ ...muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Question {index + 1} of {questions.length}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.4, margin: '0 0 1.25rem', letterSpacing: '-0.01em' }}>
                {current.statement}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '10px' }}>
                {OPTIONS.map(({ value, label, Icon, tone }) => {
                  const on = currentAnswer === value
                  return (
                    <button key={value} type="button" onClick={() => handleAnswer(value)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
                        padding: '14px 12px', cursor: 'pointer',
                        border: `1.5px solid ${on ? tone : 'var(--border-dark)'}`,
                        background: on ? 'var(--teal-pale)' : 'var(--white)',
                        fontFamily: 'var(--font-body)', fontSize: '14.5px', fontWeight: 700,
                        color: on ? 'var(--navy)' : 'var(--text-mid)',
                      }}>
                      <Icon size={17} color={tone} strokeWidth={2.5} /> {label}
                    </button>
                  )
                })}
              </div>

              {showConsequence && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: '1rem', background: 'var(--navy)', color: '#fff', padding: isMobile ? '1rem 1.1rem' : '1.1rem 1.35rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <ShieldAlert size={18} color="var(--teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    {/* "Not sure" is an unverified exposure, not a confirmed one —
                        say so, rather than telling them they have a gap. */}
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '7px' }}>
                      {currentAnswer === ANSWERS.UNSURE ? 'Worth confirming' : 'Why this matters'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.65, color: 'rgba(255,255,255,0.86)' }}>
                      {current.consequence}
                    </div>
                    <button type="button" onClick={advance} style={{ ...primaryBtn, marginTop: '0.9rem', padding: '11px 22px' }}>
                      {engine.isLast ? 'See my result' : 'Next question'} <ArrowRight size={15} />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {index > 0 && (
            <button type="button" onClick={engine.back}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '1.1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', padding: 0 }}>
              <ArrowLeft size={14} /> Back
            </button>
          )}
        </div>
      </div>
    )
  }

  /* ── Result + capture, then confirmation ──────────────────────────── */

  const { score, findings, band } = result
  const done = phase === 'done'

  // Make the withheld value legible without giving it away: they can see the
  // shape of their result — how many, how serious — before deciding to unlock it.
  const severityCounts = [
    { key: 'high', label: 'high', color: '#EF4444' },
    { key: 'medium', label: 'medium', color: '#F59E0B' },
    { key: 'low', label: 'low', color: 'var(--teal)' },
  ]
    .map((s) => ({ ...s, n: findings.filter((f) => f.severity === s.key).length }))
    .filter((s) => s.n > 0)

  return (
    <div id={CHECK_ANCHOR_ID} style={shell}>
      <div style={{ ...pad, background: 'var(--light-bg)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '1rem' : '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '84px' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.6rem', fontWeight: 800, lineHeight: 1, color: band.color }}>
              {score}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 700 }}>/100</span>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: band.color, marginTop: '4px' }}>{band.label}</div>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ ...heading, margin: 0, fontSize: isMobile ? '1.1rem' : '1.3rem' }}>
              {findings.length === 0
                ? 'Your cover looks well put together.'
                : `${findings.length} area${findings.length === 1 ? '' : 's'} worth a closer look`}
            </h3>
            <p style={{ ...muted, margin: '5px 0 0' }}>
              {findings.length === 0
                ? 'Still worth an independent second opinion — most gaps hide in the wording, not the checklist.'
                : 'Based only on your answers. An independent advisor can confirm each one against your actual policy wording.'}
            </p>
            {severityCounts.length > 0 && (
              <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginTop: '10px' }}>
                {severityCounts.map((s) => (
                  <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-dark)', background: 'var(--white)', padding: '4px 10px', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: 'var(--text-mid)' }}>
                    <span style={{ width: '7px', height: '7px', background: s.color, flexShrink: 0 }} />
                    {s.n} {s.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={pad}>
        {findings.length > 0 && (
          <>
            <div style={{ ...muted, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
              {done ? 'Your findings' : 'What we would check first'}
            </div>
            <FindingList findings={asFindings(findings)} revealAll={done} />
          </>
        )}

        {done ? (
          <div style={{ marginTop: findings.length ? '1.5rem' : 0, borderTop: findings.length ? '1px solid var(--border)' : 'none', paddingTop: findings.length ? '1.5rem' : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ width: '26px', height: '26px', background: 'var(--teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={15} color="var(--teal)" strokeWidth={3} />
              </span>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                Saved, {receipt?.name?.trim().split(/\s+/)[0]}
              </h4>
            </div>
            <p style={{ ...muted, margin: 0 }}>
              An independent advisor will go through these against your actual policy wording and come back to you
              {receipt?.when ? ` ${receipt.when.toLowerCase()}` : ''} — usually within one business day.
              {receipt?.reference && <> Your reference is <strong style={{ color: 'var(--navy)' }}>{receipt.reference}</strong>.</>}
            </p>
            <a href="tel:+971509765976" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '1rem', color: 'var(--teal-dark)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
              <Phone size={15} /> Or call 050 976 5976 now
            </a>
          </div>
        ) : (
          <div style={{ marginTop: findings.length ? '1.5rem' : 0, borderTop: findings.length ? '1px solid var(--border)' : 'none', paddingTop: findings.length ? '1.5rem' : 0 }}>
            <ToolCapture
              isMobile={isMobile}
              {...leadPayload()}
              heading={findings.length ? 'See all your findings' : 'Get your check in writing'}
              note="We will send this to an independent advisor who will confirm each point against your policy — no obligation."
              ctaLabel={findings.length ? 'Show my findings' : 'Send me my check'}
              onSubmitted={(r) => { setReceipt(r); setPhase('done') }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
