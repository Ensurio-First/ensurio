import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, X, HelpCircle, Phone, Clock, ShieldAlert } from 'lucide-react'
import toolStyles from './toolStyles'
import { CHECK_ANCHOR_ID } from './scrollToCheck'
import ToolCapture from './ToolCapture'
import FindingList from './FindingList'
import { ANSWERS, normaliseItems, scoreBand } from './useToolEngine'
import { useLeadJourney } from '../../context/LeadJourneyContext'

/*
 * Claim stage router — for the claims advisory page.
 *
 * Almost nobody arrives here out of curiosity. They arrive because something
 * has already happened: a loss last night, a claim that has gone quiet, an
 * adjuster who stopped replying. The page used to meet all of them with a
 * readiness questionnaire — "are you ready if a claim happens?" — which is the
 * wrong question for everyone except the small minority who are genuinely
 * planning ahead.
 *
 * So ask where they are first, then send them somewhere useful:
 *
 *   fresh loss    → the first-48-hours checklist, free and immediate
 *   in progress   → a health check on the live claim
 *   declined      → hand over to the dispute triage, which is built for it
 *   preparing     → the original readiness check
 *
 * The declined path deliberately hands off rather than duplicating. Two claims
 * pages that ignore each other was the leak worth closing.
 */

const STAGES = [
  { value: 'fresh', label: 'Something just happened — I have a loss to claim', urgent: true },
  { value: 'progress', label: 'My claim is in progress, or it has stalled' },
  { value: 'declined', label: 'My claim has been declined or cut back' },
  { value: 'preparing', label: 'Nothing yet — I want to be prepared' },
]

/*
 * The first-48-hours checklist. Given away with no gate at all: someone dealing
 * with a fire or a crash needs this in the next hour, and making them trade
 * contact details for it would be both bad manners and bad business.
 */
const FIRST_48 = [
  {
    action: 'Photograph everything before anything moves',
    why: 'Insurers reconstruct a loss from evidence. Once debris is cleared or a vehicle is towed, the scene cannot be recreated — and the burden of proving what happened is yours.',
  },
  {
    action: 'Notify your insurer now, in writing',
    why: 'Notification windows are measured in days and the clock starts at the incident, not when you get round to it. Late notification is one of the most common reasons a valid claim is refused.',
  },
  {
    action: 'Do not authorise repairs, disposal or clean-up yet',
    why: 'Repairing before the adjuster has inspected can be treated as prejudicing the insurer. Emergency work to prevent the damage getting worse is normally allowed — photograph it and keep the invoice.',
  },
  {
    action: 'Say nothing that admits fault — to anyone',
    why: 'Most liability policies make admitting liability a breach of condition. Be factual and cooperative with everyone, including the other side’s insurer, but leave fault to be determined.',
  },
  {
    action: 'Start keeping every receipt and record from this moment',
    why: 'Temporary premises, hire replacements, overtime, mitigation costs — often recoverable, but only where they are evidenced. Reconstructing this later never captures everything.',
  },
  {
    action: 'Get the adjuster’s name and instructions in writing',
    why: 'The loss adjuster is appointed and paid by the insurer. Knowing who they are and precisely what they have been asked to assess is the starting point for everything that follows.',
  },
]

// Health check for a claim already running. Unlike the readiness questions,
// each of these has a live consequence the visitor can still act on today.
const IN_PROGRESS = [
  {
    statement: 'I notified the insurer inside the deadline my policy sets',
    gapTitle: 'Notification may already be late',
    consequence: 'This is the first thing an insurer checks and the easiest ground on which to refuse. If you are outside the window, it needs addressing head-on now rather than being discovered at decision time.',
    severity: 'high',
  },
  {
    statement: 'Everything the insurer has asked for has been supplied, in full',
    gapTitle: 'Outstanding requests are stalling your claim',
    consequence: 'A claim sitting on an unanswered document request is not being assessed — and the delay is recorded as yours, not theirs.',
    severity: 'high',
  },
  {
    statement: 'All my communication with them is in writing, and I have kept it',
    gapTitle: 'The record is incomplete',
    consequence: 'Claims are decided on the documented file. Phone calls and WhatsApp messages carry almost no weight later — confirm anything said to you back in writing, dated.',
    severity: 'high',
  },
  {
    statement: 'I know who the loss adjuster is and what they were instructed to assess',
    gapTitle: 'You do not know the adjuster’s brief',
    consequence: 'The adjuster works to a scope set by the insurer. Not knowing that scope means you cannot tell whether the assessment is complete or conveniently narrow.',
    severity: 'medium',
  },
  {
    statement: 'I have a decision, or a date for one, confirmed in writing',
    gapTitle: 'No decision and no deadline',
    consequence: 'An open-ended claim costs the insurer nothing and costs you time, cash flow and eventually your right to dispute. A dated written request for a decision changes that.',
    severity: 'high',
  },
]

// The original readiness questions, for the minority genuinely planning ahead.
const READINESS = [
  {
    statement: 'I know the notification deadline in each of my policies',
    gapTitle: 'Notification deadlines unknown',
    consequence: 'Late notification is one of the most common reasons a valid claim gets declined. The clock usually starts at the incident, not at your convenience.',
    severity: 'high',
  },
  {
    statement: 'My documentation is organised and ready to support a claim',
    gapTitle: 'Documentation not ready',
    consequence: 'Claims are settled on evidence. Reconstructing records after a loss is slower, weaker and often incomplete.',
    severity: 'high',
  },
  {
    statement: 'I have someone independent representing my side of a claim',
    gapTitle: 'No independent advocate',
    consequence: 'The loss adjuster is appointed and paid by the insurer. Without your own advocate, only one side of the claim is being argued.',
    severity: 'high',
  },
  {
    statement: 'I understand what the claims process will actually involve',
    gapTitle: 'Process not understood',
    consequence: 'Adjusters work to a set procedure. Not knowing it means missed steps, slower settlement and less leverage.',
    severity: 'medium',
  },
  {
    statement: 'My past claims have been settled fairly and in full',
    gapTitle: 'Past claims may have been under-settled',
    consequence: 'A pattern of reduced settlements usually points at a wording problem that will repeat at the next loss.',
    severity: 'medium',
  },
]

const OPTIONS = [
  { value: ANSWERS.YES, label: 'Yes', Icon: Check, tone: 'var(--teal)' },
  { value: ANSWERS.NO, label: 'No', Icon: X, tone: '#EF4444' },
  { value: ANSWERS.UNSURE, label: 'Not sure', Icon: HelpCircle, tone: '#F59E0B' },
]

const PHONE_DISPLAY = '050 976 5976'
const PHONE_HREF = 'tel:+971509765976'

export default function ClaimStageRouter({ block, isMobile }) {
  const s = toolStyles(isMobile)
  const { startCheck } = useLeadJourney()

  const [stage, setStage] = useState(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [phase, setPhase] = useState('stage') // stage | checklist | question | result | done
  const [receipt, setReceipt] = useState(null)

  const questions = useMemo(
    () => normaliseItems(stage === 'progress' ? IN_PROGRESS : READINESS),
    [stage],
  )
  const current = questions[index]

  const result = useMemo(() => {
    const WEIGHT = { high: 3, medium: 2, low: 1 }
    let total = 0
    let earned = 0
    const findings = []
    questions.forEach((q, i) => {
      const w = WEIGHT[q.severity] ?? 2
      total += w
      if (answers[i] === ANSWERS.YES) { earned += w; return }
      if (answers[i] === ANSWERS.UNSURE) earned += w * 0.3
      findings.push({
        title: q.gapTitle,
        detail: q.consequence,
        severity: q.severity,
        note: answers[i] === ANSWERS.UNSURE ? 'Unconfirmed — worth checking' : undefined,
      })
    })
    const score = total === 0 ? 100 : Math.round((earned / total) * 100)
    return { score, band: scoreBand(score), findings }
  }, [questions, answers])

  const chooseStage = (value) => {
    startCheck()
    setStage(value)
    setIndex(0)
    setAnswers({})
    if (value === 'fresh') setPhase('checklist')
    else if (value === 'declined') setPhase('handoff')
    else setPhase('question')
  }

  const answer = (value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }))
    if (value !== ANSWERS.YES && current.consequence) return
    if (index === questions.length - 1) setPhase('result')
    else setIndex((i) => i + 1)
  }

  const advance = () =>
    (index === questions.length - 1 ? setPhase('result') : setIndex((i) => i + 1))

  const restart = () => { setStage(null); setPhase('stage'); setAnswers({}); setIndex(0) }

  const CallLink = ({ strong }) => (
    <a href={PHONE_HREF} style={strong
      ? { ...s.primaryBtn, textDecoration: 'none' }
      : { display: 'inline-flex', alignItems: 'center', gap: '7px', color: 'var(--teal-dark)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
      <Phone size={15} /> {strong ? `Call ${PHONE_DISPLAY} now` : `Or call ${PHONE_DISPLAY}`}
    </a>
  )

  /* ── Step 1: where are you? ───────────────────────────────────────── */
  if (phase === 'stage') {
    return (
      <div id={CHECK_ANCHOR_ID} style={s.shell}>
        <div style={s.pad}>
          <span style={s.badge}>Claims help</span>
          <h3 style={s.heading}>{block?.title || 'Where are you with your claim right now?'}</h3>
          <p style={{ ...s.muted, margin: '0 0 1.25rem' }}>
            {block?.subtitle || 'One question, so we give you something useful rather than something generic.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {STAGES.map((o) => (
              <button key={o.value} type="button" onClick={() => chooseStage(o.value)}
                style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '15px 16px', cursor: 'pointer', textAlign: 'left', border: `1.5px solid ${o.urgent ? '#EF4444' : 'var(--border-dark)'}`, background: o.urgent ? '#FEF2F2' : 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14.5px', fontWeight: 600, color: 'var(--navy)' }}>
                {o.urgent
                  ? <Clock size={17} color="#EF4444" style={{ flexShrink: 0 }} />
                  : <span style={{ width: '16px', height: '16px', flexShrink: 0, border: '1.5px solid var(--border-dark)', borderRadius: '50%' }} />}
                {o.label}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '1.25rem' }}><CallLink /></div>
        </div>
      </div>
    )
  }

  /* ── Fresh loss: the checklist, free and immediate ────────────────── */
  if (phase === 'checklist') {
    return (
      <div id={CHECK_ANCHOR_ID} style={s.shell}>
        <div style={{ ...s.headerBand, borderLeft: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Clock size={18} color="#EF4444" />
            <span style={{ ...s.eyebrow, color: '#EF4444' }}>Your first 48 hours</span>
          </div>
          <h3 style={{ ...s.heading, margin: 0, fontSize: isMobile ? '1.15rem' : '1.35rem' }}>
            Do these six things before anything else
          </h3>
          <p style={{ ...s.muted, margin: '6px 0 0' }}>
            Free, no details needed. Most claims are won or lost in the first two days, long before anyone
            argues about the wording.
          </p>
        </div>

        <div style={s.pad}>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', counterReset: 'step' }}>
            {FIRST_48.map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: '13px', paddingBottom: '1.1rem', marginBottom: '1.1rem', borderBottom: i < FIRST_48.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ flexShrink: 0, width: '26px', height: '26px', background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 800 }}>
                  {i + 1}
                </span>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '15px' : '16px', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.4 }}>
                    {item.action}
                  </div>
                  <div style={{ ...s.muted, marginTop: '4px' }}>{item.why}</div>
                </div>
              </li>
            ))}
          </ol>

          <div style={{ background: 'var(--navy)', color: '#fff', padding: isMobile ? '1.1rem 1.25rem' : '1.25rem 1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-start', marginTop: '0.5rem' }}>
            <ShieldAlert size={18} color="var(--teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.65, color: 'rgba(255,255,255,0.86)' }}>
              Your notification clock has already started. If you are not certain what your policy allows,
              that is the single most urgent thing to establish today — not next week.
            </div>
          </div>

          <div style={s.divider}>
            {phase === 'done' ? null : (
              <ToolCapture
                isMobile={isMobile}
                service="Claims Advisory"
                source="claim-stage-router"
                toolId="claim-stage-fresh-loss"
                reportTitle="Your first-48-hours claim checklist"
                message="Fresh loss — requested claims support via the stage router."
                details={{ stage: 'Fresh loss' }}
                report={{
                  headline: 'A copy of your first-48-hours checklist.',
                  summary: 'Fresh loss — advisor requested.',
                  findings: FIRST_48.map((f) => ({ title: f.action, detail: f.why, severity: 'high' })),
                }}
                heading="Want someone on this with you?"
                note="We'll check your notification deadline, take the adjuster off your hands, and build the claim properly from day one."
                ctaLabel="Get an advocate on it"
                onSubmitted={(r) => { setReceipt(r); setPhase('done') }}
              />
            )}
            {receipt && (
              <p style={{ ...s.muted, margin: '0.5rem 0 0' }}>
                Saved, {receipt.name?.trim().split(/\s+/)[0]}. We'll be in touch
                {receipt.when ? ` ${receipt.when.toLowerCase()}` : ' shortly'}.
                {receipt.reference && <> Reference <strong style={{ color: 'var(--navy)' }}>{receipt.reference}</strong>.</>}
              </p>
            )}
            <div style={{ marginTop: '1rem' }}><CallLink strong /></div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Declined: hand over to the tool built for it ─────────────────── */
  if (phase === 'handoff') {
    return (
      <div id={CHECK_ANCHOR_ID} style={s.shell}>
        <div style={s.pad}>
          <span style={{ ...s.badge, color: '#B91C1C', background: '#FEE2E2' }}>Wrong page — here is the right one</span>
          <h3 style={s.heading}>A decline is an opening position, not a verdict</h3>
          <p style={{ ...s.muted, margin: '0 0 1.25rem' }}>
            We have a tool built specifically for claims that have been declined or cut back. It works out how
            urgent your position is, what is weakening it, and what to do first — in five questions.
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/solutions/legal-claims-support" style={{ ...s.primaryBtn, textDecoration: 'none' }}>
              Go to the dispute triage <ArrowRight size={15} />
            </Link>
            <CallLink />
          </div>
          <button type="button" onClick={restart}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', padding: 0 }}>
            <ArrowLeft size={14} /> That is not my situation
          </button>
        </div>
      </div>
    )
  }

  /* ── Questions (in-progress health check or readiness check) ──────── */
  if (phase === 'question') {
    const showConsequence = answers[index] && answers[index] !== ANSWERS.YES && current.consequence
    return (
      <div id={CHECK_ANCHOR_ID} style={s.shell}>
        <div style={{ height: '3px', background: 'var(--border)' }}>
          <motion.div style={{ height: '100%', background: 'var(--teal)' }}
            animate={{ width: `${((index + 1) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
        <div style={s.pad}>
          <div style={{ ...s.eyebrow, marginBottom: '10px' }}>
            {stage === 'progress' ? 'Claim health check' : 'Readiness check'} · {index + 1} of {questions.length}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.4, margin: '0 0 1.25rem', letterSpacing: '-0.01em' }}>
                {current.statement}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '10px' }}>
                {OPTIONS.map(({ value, label, Icon, tone }) => {
                  const on = answers[index] === value
                  return (
                    <button key={value} type="button" onClick={() => answer(value)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', padding: '14px 12px', cursor: 'pointer', border: `1.5px solid ${on ? tone : 'var(--border-dark)'}`, background: on ? 'var(--teal-pale)' : 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14.5px', fontWeight: 700, color: on ? 'var(--navy)' : 'var(--text-mid)' }}>
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
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '7px' }}>
                      {answers[index] === ANSWERS.UNSURE ? 'Worth confirming' : 'Why this matters'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.65, color: 'rgba(255,255,255,0.86)' }}>
                      {current.consequence}
                    </div>
                    <button type="button" onClick={advance} style={{ ...s.primaryBtn, marginTop: '0.9rem', padding: '11px 22px' }}>
                      {index === questions.length - 1 ? 'See my result' : 'Next question'} <ArrowRight size={15} />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          <button type="button" onClick={() => (index === 0 ? restart() : setIndex((i) => i - 1))}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '1.1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', padding: 0 }}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </div>
    )
  }

  /* ── Result ───────────────────────────────────────────────────────── */
  const { score, band, findings } = result
  const done = phase === 'done'
  const live = stage === 'progress'

  return (
    <div id={CHECK_ANCHOR_ID} style={s.shell}>
      <div style={s.headerBand}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '1rem' : '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '84px' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.6rem', fontWeight: 800, lineHeight: 1, color: band.color }}>
              {score}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 700 }}>/100</span>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: band.color, marginTop: '4px' }}>{band.label}</div>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ ...s.heading, margin: 0, fontSize: isMobile ? '1.1rem' : '1.3rem' }}>
              {findings.length === 0
                ? (live ? 'Your claim is being run well.' : 'You are better prepared than most.')
                : `${findings.length} thing${findings.length === 1 ? '' : 's'} to deal with${live ? ' now' : ''}`}
            </h3>
            <p style={{ ...s.muted, margin: '5px 0 0' }}>
              {live
                ? 'Every one of these is still fixable today — which is why it is worth knowing about them today.'
                : 'Based only on your answers. Worth confirming against your actual policy wordings.'}
            </p>
          </div>
        </div>
      </div>

      <div style={s.pad}>
        {findings.length > 0 && (
          <>
            <div style={{ ...s.eyebrow, marginBottom: '10px' }}>{done ? 'Your full result' : 'Deal with this first'}</div>
            <FindingList findings={findings} revealAll={done} noun={live ? 'issue' : 'gap'} />
          </>
        )}

        <div style={s.divider}>
          {done ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ width: '26px', height: '26px', background: 'var(--teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={15} color="var(--teal)" strokeWidth={3} />
                </span>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                  Saved, {receipt?.name?.trim().split(/\s+/)[0]}
                </h4>
              </div>
              <p style={{ ...s.muted, margin: 0 }}>
                {live
                  ? 'An advisor will look at where your claim actually stands and what to put in writing next'
                  : 'An advisor will go through these against your policies'}
                {receipt?.when ? ` — ${receipt.when.toLowerCase()}` : ''}.
                {receipt?.reference && <> Your reference is <strong style={{ color: 'var(--navy)' }}>{receipt.reference}</strong>.</>}
              </p>
              <div style={{ marginTop: '1rem' }}><CallLink strong /></div>
            </>
          ) : (
            <>
              <ToolCapture
                isMobile={isMobile}
                service="Claims Advisory"
                source="claim-stage-router"
                toolId={live ? 'claim-health-check' : 'claim-readiness-check'}
                reportTitle={live ? 'Your claim health check' : 'Your claim readiness check'}
                message={`${live ? 'Claim health check' : 'Claim readiness check'} — scored ${score}/100 with ${findings.length} issue${findings.length === 1 ? '' : 's'}.`}
                details={{
                  stage: STAGES.find((st) => st.value === stage)?.label,
                  answers: questions.map((q, i) => ({ statement: q.statement, answer: answers[i] })),
                }}
                report={{
                  score,
                  headline: findings.length
                    ? `${findings.length} thing${findings.length === 1 ? '' : 's'} worth dealing with on your claim.`
                    : 'Your answers suggest this is being handled well.',
                  summary: band.label,
                  findings,
                }}
                heading={findings.length ? 'See everything, and get someone on it' : 'Get this in writing'}
                note={live
                  ? "We'll take the adjuster off your hands, put the right things in writing, and push for a decision."
                  : "We'll send your result and flag what to sort out before you ever need to claim."}
                ctaLabel={live ? 'Get help with my claim' : 'Send me my result'}
                onSubmitted={(r) => { setReceipt(r); setPhase('done') }}
              />
              <div style={{ marginTop: '1rem' }}><CallLink /></div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
