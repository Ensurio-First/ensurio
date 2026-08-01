import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, Phone } from 'lucide-react'
import toolStyles from './toolStyles'
import { CHECK_ANCHOR_ID } from './scrollToCheck'
import ToolCapture from './ToolCapture'
import FindingList from './FindingList'
import { useLeadJourney } from '../../context/LeadJourneyContext'

/*
 * Risk register builder — for the risk-assessment page.
 *
 * Produces the thing the service actually delivers: exposures plotted on a
 * likelihood/severity grid, with a treatment for each quadrant. That framing is
 * standard risk practice — transfer the rare-but-ruinous, reduce the frequent
 * but survivable — and it reframes insurance as one treatment among several
 * rather than the answer to everything.
 *
 * Each risk is captured in a single tap: the four options are the four
 * quadrants, so both axes come from one decision instead of two.
 */

const RISKS = [
  { key: 'fire', label: 'Fire or major property damage', cover: 'Property & fire insurance' },
  { key: 'bi', label: 'Extended downtime after a loss', cover: 'Business interruption' },
  { key: 'liability', label: 'A third-party liability claim', cover: 'Public & product liability' },
  { key: 'injury', label: 'An employee injured at work', cover: "Workmen's compensation & employer's liability" },
  { key: 'cyber', label: 'Cyber attack or ransomware', cover: 'Cyber insurance' },
  { key: 'credit', label: 'A major customer failing to pay', cover: 'Trade credit insurance' },
  { key: 'transit', label: 'Goods lost or damaged in transit', cover: 'Marine cargo insurance' },
  { key: 'professional', label: 'A professional error or design fault', cover: 'Professional indemnity' },
]

// The four options ARE the four quadrants — one tap captures both axes.
const RATINGS = [
  { value: 'll', likely: false, severe: false, label: 'Unlikely, and we would cope' },
  { value: 'ls', likely: false, severe: true, label: 'Unlikely, but it would hurt badly' },
  { value: 'hl', likely: true, severe: false, label: 'Could happen, and we would cope' },
  { value: 'hs', likely: true, severe: true, label: 'Could happen, and it would hurt badly' },
]

const QUADRANTS = {
  hs: { title: 'Act now', tone: '#EF4444', treatment: 'Reduce the likelihood and transfer what remains. These are the exposures that end businesses.' },
  ls: { title: 'Insure', tone: '#F59E0B', treatment: 'Rare but ruinous — the textbook case for transferring risk to an insurer rather than carrying it.' },
  hl: { title: 'Reduce', tone: 'var(--teal)', treatment: 'Frequent but survivable. Usually cheaper to prevent or retain deliberately than to insure.' },
  ll: { title: 'Monitor', tone: 'var(--text-light)', treatment: 'Keep under review. Revisit if the business changes shape.' },
}

export default function RiskRegister({ block, isMobile }) {
  const s = toolStyles(isMobile)
  const { startCheck } = useLeadJourney()

  const [phase, setPhase] = useState('select') // select | rate | result | done
  const [selected, setSelected] = useState([])
  const [ratings, setRatings] = useState({})
  const [cursor, setCursor] = useState(0)
  const [receipt, setReceipt] = useState(null)

  const toggle = (key) => {
    startCheck()
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const current = RISKS.find((r) => r.key === selected[cursor])

  const rate = (value) => {
    setRatings((prev) => ({ ...prev, [current.key]: value }))
    if (cursor === selected.length - 1) setPhase('result')
    else setCursor((c) => c + 1)
  }

  const result = useMemo(() => {
    const placed = selected.map((key) => {
      const risk = RISKS.find((r) => r.key === key)
      const rating = RATINGS.find((r) => r.value === ratings[key])
      return { ...risk, rating }
    }).filter((r) => r.rating)

    const byQuadrant = Object.fromEntries(
      Object.keys(QUADRANTS).map((q) => [q, placed.filter((p) => p.rating.value === q)]),
    )

    const findings = []
    if (byQuadrant.hs.length) {
      findings.push({
        title: `${byQuadrant.hs.length} exposure${byQuadrant.hs.length === 1 ? '' : 's'} in the act-now quadrant`,
        detail: `${byQuadrant.hs.map((r) => r.label.toLowerCase()).join('; ')}. Likely and severe together is the combination that closes businesses — these need both prevention work and a transfer route, not one or the other.`,
        severity: 'high',
      })
    }
    if (byQuadrant.ls.length) {
      findings.push({
        title: 'Rare but ruinous — the classic transfer candidates',
        detail: `${byQuadrant.ls.map((r) => `${r.label.toLowerCase()} (${r.cover})`).join('; ')}. This is exactly what insurance exists for. The question is whether each one is actually in your programme, at a limit that would matter.`,
        severity: 'high',
      })
    }
    if (byQuadrant.hl.length) {
      findings.push({
        title: 'Frequency problems, not severity problems',
        detail: `${byQuadrant.hl.map((r) => r.label.toLowerCase()).join('; ')}. Insuring high-frequency, low-impact events is usually poor value — you pay the losses back through the premium. Reducing them, or retaining them deliberately with a higher deductible, tends to cost less.`,
        severity: 'medium',
      })
    }
    if (byQuadrant.ll.length) {
      findings.push({
        title: 'Monitor and revisit',
        detail: `${byQuadrant.ll.map((r) => r.label.toLowerCase()).join('; ')}. Low priority today, but a register is only useful if it is revisited when the business changes.`,
        severity: 'low',
      })
    }

    return { placed, byQuadrant, findings }
  }, [selected, ratings])

  const details = {
    risksAssessed: result.placed.map((r) => ({ risk: r.label, rating: r.rating.label, quadrant: QUADRANTS[r.rating.value].title })),
  }

  const report = {
    headline: `You plotted ${result.placed.length} exposure${result.placed.length === 1 ? '' : 's'} on the register.`,
    summary: `${result.byQuadrant.hs.length} act-now · ${result.byQuadrant.ls.length} insure · ${result.byQuadrant.hl.length} reduce · ${result.byQuadrant.ll.length} monitor`,
    findings: result.findings,
    benchmark: 'A formal risk assessment tests these against your contracts, sites and loss history rather than your impression of them.',
  }

  const done = phase === 'done'

  /* ── Step 1: pick the risks that apply ────────────────────────────── */
  if (phase === 'select') {
    return (
      <div id={CHECK_ANCHOR_ID} style={s.shell}>
        <div style={s.pad}>
          <span style={s.badge}>Build your register</span>
          <h3 style={s.heading}>{block?.title || 'Which of these could actually happen to you?'}</h3>
          <p style={{ ...s.muted, margin: '0 0 1.25rem' }}>
            {block?.subtitle || 'Pick the ones that are real for your business. You will rate each in a single tap, then see them plotted.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
            {RISKS.map((r) => {
              const on = selected.includes(r.key)
              return (
                <button key={r.key} type="button" onClick={() => toggle(r.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', cursor: 'pointer', textAlign: 'left', border: `1.5px solid ${on ? 'var(--teal)' : 'var(--border)'}`, background: on ? 'var(--teal-pale)' : 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: on ? 'var(--navy)' : 'var(--text-mid)' }}>
                  <span style={{ width: '18px', height: '18px', flexShrink: 0, border: `1.5px solid ${on ? 'var(--teal)' : 'var(--border-dark)'}`, background: on ? 'var(--teal)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {on && <Check size={12} color="#fff" strokeWidth={3} />}
                  </span>
                  {r.label}
                </button>
              )
            })}
          </div>
          <button type="button" disabled={selected.length === 0}
            onClick={() => { setCursor(0); setPhase('rate') }}
            style={{ ...s.primaryBtn, marginTop: '1.5rem', background: selected.length ? 'var(--teal)' : 'var(--border-dark)', cursor: selected.length ? 'pointer' : 'not-allowed' }}>
            Rate {selected.length || ''} exposure{selected.length === 1 ? '' : 's'} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    )
  }

  /* ── Step 2: one tap per risk ─────────────────────────────────────── */
  if (phase === 'rate') {
    return (
      <div id={CHECK_ANCHOR_ID} style={s.shell}>
        <div style={{ height: '3px', background: 'var(--border)' }}>
          <motion.div style={{ height: '100%', background: 'var(--teal)' }}
            animate={{ width: `${((cursor + 1) / selected.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
        <div style={s.pad}>
          <div style={{ ...s.eyebrow, marginBottom: '10px' }}>Exposure {cursor + 1} of {selected.length}</div>
          <AnimatePresence mode="wait">
            <motion.div key={cursor} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.4, margin: '0 0 1.25rem' }}>
                {current?.label}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {RATINGS.map((r) => (
                  <button key={r.value} type="button" onClick={() => rate(r.value)}
                    style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', border: `1.5px solid ${ratings[current?.key] === r.value ? 'var(--teal)' : 'var(--border-dark)'}`, background: ratings[current?.key] === r.value ? 'var(--teal-pale)' : 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14.5px', fontWeight: 600, color: 'var(--navy)' }}>
                    <span style={{ width: '10px', height: '10px', flexShrink: 0, background: QUADRANTS[r.value].tone }} />
                    {r.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          <button type="button" onClick={() => (cursor === 0 ? setPhase('select') : setCursor((c) => c - 1))}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '1.1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', padding: 0 }}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </div>
    )
  }

  /* ── Result: the register ─────────────────────────────────────────── */
  return (
    <div id={CHECK_ANCHOR_ID} style={s.shell}>
      <div style={s.headerBand}>
        <span style={s.badge}>Your risk register</span>
        <h3 style={{ ...s.heading, fontSize: isMobile ? '1.15rem' : '1.35rem' }}>
          {result.placed.length} exposure{result.placed.length === 1 ? '' : 's'}, plotted by likelihood and severity
        </h3>
        <p style={{ ...s.muted, margin: 0 }}>
          Each quadrant has a different treatment. Insurance is the right answer for one of them, and the wrong answer for another.
        </p>
      </div>

      <div style={s.pad}>
        {/* 2×2 grid — severe on top, likely on the right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
          {['ls', 'hs', 'll', 'hl'].map((q) => (
            <div key={q} style={{ background: 'var(--white)', padding: isMobile ? '0.9rem' : '1.1rem', minHeight: '104px', borderTop: `3px solid ${QUADRANTS[q].tone}` }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 800, color: QUADRANTS[q].tone, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '7px' }}>
                {QUADRANTS[q].title}
              </div>
              {result.byQuadrant[q].length === 0
                ? <div style={{ ...s.muted, fontSize: '12.5px', fontStyle: 'italic' }}>—</div>
                : result.byQuadrant[q].map((r) => (
                    <div key={r.key} style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--text-dark)', lineHeight: 1.5, marginBottom: '4px' }}>{r.label}</div>
                  ))}
            </div>
          ))}
        </div>
        <div style={{ ...s.muted, fontSize: '11.5px', marginTop: '-1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>← less likely</span><span>more likely →</span>
        </div>

        <div style={{ ...s.eyebrow, marginBottom: '10px' }}>{done ? 'Your full register' : 'Your priority'}</div>
        <FindingList findings={result.findings} revealAll={done} noun="quadrant" />

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
                We'll test this register against your contracts and current policies, and come back with which exposures are
                already transferred and which are sitting with you{receipt?.when ? ` — ${receipt.when.toLowerCase()}` : ''}.
                {receipt?.reference && <> Your reference is <strong style={{ color: 'var(--navy)' }}>{receipt.reference}</strong>.</>}
              </p>
              <a href="tel:+971509765976" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '1rem', color: 'var(--teal-dark)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                <Phone size={15} /> Or call 050 976 5976
              </a>
            </>
          ) : (
            <ToolCapture
              isMobile={isMobile}
              service="Risk Assessment"
              source="risk-register"
              toolId="risk-register"
              reportTitle="Your risk register"
              message={`Risk register: ${result.byQuadrant.hs.length} act-now, ${result.byQuadrant.ls.length} insure, ${result.byQuadrant.hl.length} reduce.`}
              details={details}
              report={report}
              heading="Get the full register and its treatments"
              note="We'll check each exposure against your existing policies and contracts, and tell you which are already covered."
              ctaLabel="Send me my register"
              onSubmitted={(r) => { setReceipt(r); setPhase('done') }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
