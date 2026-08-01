import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Phone, AlertTriangle } from 'lucide-react'
import toolStyles from './toolStyles'
import { CHECK_ANCHOR_ID } from './scrollToCheck'
import ToolCapture from './ToolCapture'
import FindingList from './FindingList'
import { useLeadJourney } from '../../context/LeadJourneyContext'

/*
 * Claim dispute triage — for the one page whose visitors are already in trouble.
 *
 * Unlike the coverage checks, this is not about finding a gap before a loss.
 * The visitor has had a claim declined, cut or stalled, and the single most
 * valuable thing we can tell them is how much time they have left and what
 * weakens their position while they wait.
 *
 * Deliberately avoids quoting a specific limitation period: policy notification
 * windows and statutory limits both apply, they differ per policy and per
 * emirate, and a confident wrong number here would be worse than no number.
 * The instruction is always "confirm yours now", never "you have N days".
 */

const QUESTIONS = [
  {
    key: 'stage',
    question: 'Where are you with the insurer right now?',
    options: [
      { label: 'My claim has been declined', value: 'declined', weight: 3 },
      { label: 'They have offered less than I claimed', value: 'partial', weight: 2 },
      { label: 'It is stalled with no decision', value: 'delayed', weight: 2 },
      { label: 'Nothing yet — I want to be ready', value: 'none', weight: 0 },
    ],
  },
  {
    key: 'timing',
    question: 'When did you last hear from them in writing?',
    options: [
      { label: 'Within the last week', value: 'week', weight: 1 },
      { label: '1–4 weeks ago', value: 'month', weight: 2 },
      { label: '1–3 months ago', value: 'quarter', weight: 3 },
      { label: 'More than 3 months ago', value: 'old', weight: 4 },
    ],
  },
  {
    key: 'grounds',
    question: 'Did they cite a specific clause or condition?',
    options: [
      { label: 'Yes — a specific policy term', value: 'specific', weight: 1 },
      { label: 'Only a general reason', value: 'vague', weight: 3 },
      { label: 'No reason in writing at all', value: 'silent', weight: 4 },
    ],
  },
  {
    key: 'response',
    question: 'How have you communicated with them?',
    options: [
      { label: 'In writing, and I kept copies', value: 'written', weight: 0 },
      { label: 'Mostly by phone or WhatsApp', value: 'verbal', weight: 3 },
      { label: 'I have not responded yet', value: 'none', weight: 2 },
    ],
  },
  {
    key: 'representation',
    question: 'Who is acting for you?',
    options: [
      { label: 'An independent advisor or lawyer', value: 'independent', weight: 0 },
      { label: 'The broker who sold me the policy', value: 'broker', weight: 2 },
      { label: 'Nobody — I am handling it myself', value: 'self', weight: 3 },
    ],
  },
]

const MAX_URGENCY = QUESTIONS.reduce(
  (sum, q) => sum + Math.max(...q.options.map((o) => o.weight)), 0,
)

function verdictFor(score) {
  const pct = score / MAX_URGENCY
  if (pct >= 0.6) return { key: 'urgent', label: 'Time-critical', color: '#EF4444', headline: 'Your position is weakening while you wait.' }
  if (pct >= 0.33) return { key: 'press', label: 'Worth pressing', color: '#F59E0B', headline: 'There are grounds here worth pressing properly.' }
  return { key: 'prepare', label: 'Get ahead of it', color: 'var(--teal)', headline: 'Nothing is lost yet — this is the moment to get organised.' }
}

function findingsFor(a) {
  const out = []

  if (a.timing === 'old' || a.timing === 'quarter') {
    out.push({
      title: 'Time limits may already be running against you',
      detail: 'Policies set a window for disputing a decision, and statutory limits sit behind that. Both are shorter than most people expect, and once one passes the merits of your case stop mattering. Confirm the deadlines that apply to your policy before anything else.',
      severity: 'high',
    })
  }
  if (a.grounds === 'silent' || a.grounds === 'vague') {
    out.push({
      title: 'A decline without a cited term is the weakest kind',
      detail: 'An insurer has to point to a specific clause, condition or exclusion. A general refusal is not a reasoned decision, and asking them to identify the exact term in writing is usually the single most effective first move.',
      severity: 'high',
    })
  }
  if (a.response === 'verbal') {
    out.push({
      title: 'Phone and WhatsApp exchanges carry almost no weight',
      detail: 'Disputes are decided on the documented record. Verbal assurances from an adjuster are close to worthless later — everything said to you should be confirmed back in writing, dated.',
      severity: 'high',
    })
  }
  if (a.representation === 'broker') {
    out.push({
      title: 'Your broker is not a neutral party here',
      detail: 'The broker who placed the policy has a commercial relationship with the insurer and an interest in how the claim resolves. That is a conflict, not a criticism — a dispute needs someone whose only client is you.',
      severity: 'high',
    })
  }
  if (a.representation === 'self') {
    out.push({
      title: 'You are negotiating against a professional',
      detail: 'The loss adjuster handling your claim is appointed and paid by the insurer, and does this every day. That asymmetry is the reason claims settle low far more often than they are outright refused.',
      severity: 'medium',
    })
  }
  if (a.stage === 'declined') {
    out.push({
      title: 'A decline is an opening position, not a verdict',
      detail: 'Insurers reverse declines regularly when a claim is re-presented against the actual wording rather than the summary. The first refusal is rarely the end of the matter.',
      severity: 'medium',
    })
  }
  if (a.stage === 'partial') {
    out.push({
      title: 'A partial offer is where most value is lost',
      detail: 'Underpayment attracts far less scrutiny than refusal, because accepting feels like winning. Check the offer against your sums insured and the policy basis of settlement before you respond.',
      severity: 'medium',
    })
  }
  if (a.stage === 'delayed') {
    out.push({
      title: 'Silence is a tactic as well as a delay',
      detail: 'A stalled claim runs down your time and your patience at no cost to the insurer. A dated written request for a decision, with a deadline, changes the dynamic.',
      severity: 'medium',
    })
  }
  if (a.stage === 'none') {
    out.push({
      title: 'Preparation is what wins claims',
      detail: 'Knowing your notification deadlines and having documentation ready before a loss is worth more than any argument made afterwards.',
      severity: 'low',
    })
  }

  return out
}

export default function DisputeTriage({ block, isMobile }) {
  const s = toolStyles(isMobile)
  const { startCheck } = useLeadJourney()

  const [phase, setPhase] = useState('intro') // intro | question | result | done
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [receipt, setReceipt] = useState(null)

  const current = QUESTIONS[index]

  const result = useMemo(() => {
    const score = QUESTIONS.reduce((sum, q) => {
      const chosen = q.options.find((o) => o.value === answers[q.key])
      return sum + (chosen?.weight ?? 0)
    }, 0)
    return { score, verdict: verdictFor(score), findings: findingsFor(answers) }
  }, [answers])

  const choose = (value) => {
    startCheck()
    setAnswers((prev) => ({ ...prev, [current.key]: value }))
    if (index === QUESTIONS.length - 1) setPhase('result')
    else setIndex((i) => i + 1)
  }

  const details = Object.fromEntries(
    QUESTIONS.map((q) => [
      q.key,
      q.options.find((o) => o.value === answers[q.key])?.label ?? null,
    ]),
  )

  const report = {
    headline: result.verdict.headline,
    summary: `Triage result: ${result.verdict.label}.`,
    findings: result.findings,
    benchmark: 'Indicative triage based only on your answers — not legal advice, and no substitute for review of your policy wording and correspondence.',
  }

  /* ── Intro ────────────────────────────────────────────────────────── */
  if (phase === 'intro') {
    return (
      <div id={CHECK_ANCHOR_ID} style={s.shell}>
        <div style={s.pad}>
          <span style={{ ...s.badge, color: '#B91C1C', background: '#FEE2E2' }}>Dispute triage</span>
          <h3 style={s.heading}>{block?.title || 'Has your claim been declined, cut or stalled?'}</h3>
          <p style={{ ...s.muted, margin: '0 0 1.25rem' }}>
            {block?.subtitle || 'Five questions. You will see where your position stands and what is weakening it — before you give us any details.'}
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" style={s.primaryBtn} onClick={() => { startCheck(); setPhase('question') }}>
              Start the triage <ArrowRight size={15} />
            </button>
            <a href="tel:+971509765976" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: 'var(--teal-dark)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
              <Phone size={15} /> Or call 050 976 5976
            </a>
          </div>
          <p style={{ ...s.muted, fontSize: '12.5px', margin: '0.85rem 0 0' }}>
            If a deadline is close, call — do not wait for a form.
          </p>
          {/* The other half of the handoff: this page is for claims that have
              already been refused. A live claim belongs on claims advisory. */}
          <p style={{ ...s.muted, fontSize: '13px', margin: '0.75rem 0 0' }}>
            Claim not declined — just started, or stalled?{' '}
            <Link to="/solutions/claims-advisory" style={{ color: 'var(--teal-dark)', fontWeight: 700 }}>
              Claims advisory is the right page →
            </Link>
          </p>
        </div>
      </div>
    )
  }

  /* ── Questions ────────────────────────────────────────────────────── */
  if (phase === 'question') {
    return (
      <div id={CHECK_ANCHOR_ID} style={s.shell}>
        <div style={{ height: '3px', background: 'var(--border)' }}>
          <motion.div style={{ height: '100%', background: 'var(--teal)' }}
            animate={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.3 }} />
        </div>
        <div style={s.pad}>
          <div style={{ ...s.eyebrow, marginBottom: '10px' }}>Question {index + 1} of {QUESTIONS.length}</div>
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.4, margin: '0 0 1.25rem', letterSpacing: '-0.01em' }}>
                {current.question}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {current.options.map((o) => {
                  const on = answers[current.key] === o.value
                  return (
                    <button key={o.value} type="button" onClick={() => choose(o.value)}
                      style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', border: `1.5px solid ${on ? 'var(--teal)' : 'var(--border-dark)'}`, background: on ? 'var(--teal-pale)' : 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14.5px', fontWeight: 600, color: 'var(--navy)' }}>
                      <span style={{ width: '16px', height: '16px', flexShrink: 0, border: `1.5px solid ${on ? 'var(--teal)' : 'var(--border-dark)'}`, borderRadius: '50%', background: on ? 'var(--teal)' : 'transparent' }} />
                      {o.label}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>
          {index > 0 && (
            <button type="button" onClick={() => setIndex((i) => i - 1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '1.1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', padding: 0 }}>
              <ArrowLeft size={14} /> Back
            </button>
          )}
        </div>
      </div>
    )
  }

  /* ── Verdict ──────────────────────────────────────────────────────── */
  const { verdict, findings } = result
  const done = phase === 'done'

  return (
    <div id={CHECK_ANCHOR_ID} style={s.shell}>
      <div style={{ ...s.headerBand, borderLeft: `4px solid ${verdict.color}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <AlertTriangle size={18} color={verdict.color} />
          <span style={{ ...s.eyebrow, color: verdict.color }}>{verdict.label}</span>
        </div>
        <h3 style={{ ...s.heading, margin: 0, fontSize: isMobile ? '1.15rem' : '1.35rem' }}>{verdict.headline}</h3>
        <p style={{ ...s.muted, margin: '6px 0 0' }}>
          Based only on your answers. Nothing here is legal advice — it is what an independent advisor
          would want to look at first, in the order they would look at it.
        </p>
      </div>

      <div style={s.pad}>
        <div style={{ ...s.eyebrow, marginBottom: '10px' }}>{done ? 'Your full triage' : 'The first thing to deal with'}</div>
        <FindingList findings={findings} revealAll={done} noun="point" />

        <div style={s.divider}>
          {done ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ width: '26px', height: '26px', background: 'var(--teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={15} color="var(--teal)" strokeWidth={3} />
                </span>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                  Sent, {receipt?.name?.trim().split(/\s+/)[0]}
                </h4>
              </div>
              <p style={{ ...s.muted, margin: 0 }}>
                Someone will read your answers and come back to you
                {receipt?.when ? ` ${receipt.when.toLowerCase()}` : ''}.
                {receipt?.reference && <> Your reference is <strong style={{ color: 'var(--navy)' }}>{receipt.reference}</strong>.</>}
                {' '}Meanwhile: put everything in writing, and do not accept or sign anything until it has been read.
              </p>
              <a href="tel:+971509765976" style={{ ...s.primaryBtn, marginTop: '1rem', textDecoration: 'none' }}>
                <Phone size={15} /> Call 050 976 5976 now
              </a>
            </>
          ) : (
            <>
              <ToolCapture
                isMobile={isMobile}
                service="Legal Claims Support"
                source="dispute-triage"
                toolId="dispute-triage"
                reportTitle="Your claim dispute triage"
                message={`Dispute triage: ${verdict.label} (urgency ${result.score}/${MAX_URGENCY}).`}
                details={details}
                report={report}
                heading="See the rest, and get someone on it"
                note="We'll review your answers against your policy and correspondence, and tell you what to do first. No obligation."
                ctaLabel="Send me my triage"
                onSubmitted={(r) => { setReceipt(r); setPhase('done') }}
              />
              {verdict.key === 'urgent' && (
                <p style={{ ...s.muted, fontSize: '13px', marginTop: '1rem', color: '#B91C1C', fontWeight: 600 }}>
                  If a deadline is days away, call 050 976 5976 rather than waiting on a form.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
