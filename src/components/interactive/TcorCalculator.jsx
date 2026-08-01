import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Check, Lock, Phone } from 'lucide-react'
import toolStyles, { fmtAED } from './toolStyles'
import { CHECK_ANCHOR_ID } from './scrollToCheck'
import ToolCapture from './ToolCapture'
import { useLeadJourney } from '../../context/LeadJourneyContext'

/*
 * Total Cost of Risk calculator — the tool for finance managers.
 *
 * The argument it makes: premium is the number you negotiate, but it is only
 * part of what risk actually costs you. Deductibles, uninsured losses and the
 * management time absorbed by insurance sit unmeasured across the P&L. Putting
 * a single figure on the whole thing is what turns "insurance is a cost line"
 * into "risk is a number we can manage".
 *
 * Every assumption is shown on screen. A calculator that hides its maths from
 * a finance audience loses them at the first result they cannot reconcile.
 */

// Management time is costed at a stated, conservative loaded rate so the
// number can be argued with rather than taken on faith.
const ADMIN_RATE_PER_HOUR = 250
const WORKING_HOURS_PER_DAY = 8

const ADMIN_LOAD = [
  { label: 'Under a day', days: 0.5 },
  { label: '1–2 days', days: 1.5 },
  { label: '3–5 days', days: 4 },
  { label: 'A week or more', days: 6 },
]

const CLAIMS_HISTORY = [
  { label: 'None', value: 0 },
  { label: '1–2', value: 1 },
  { label: '3–5', value: 2 },
  { label: '6+', value: 3 },
]

const SLIDERS = [
  {
    key: 'premium',
    label: 'Annual insurance premium spend',
    min: 50_000, max: 10_000_000, step: 50_000, initial: 750_000,
    help: 'Everything you pay across every policy in a year.',
  },
  {
    key: 'deductibles',
    label: 'Deductibles and excesses paid last year',
    min: 0, max: 3_000_000, step: 25_000, initial: 150_000,
    help: 'The part of each claim you funded yourself.',
  },
  {
    key: 'uninsured',
    label: 'Losses absorbed without claiming',
    min: 0, max: 3_000_000, step: 25_000, initial: 200_000,
    help: 'Damage, theft or downtime you simply wrote off.',
  },
]

export default function TcorCalculator({ block, isMobile }) {
  const s = toolStyles(isMobile)
  const { startCheck } = useLeadJourney()

  const [vals, setVals] = useState(() =>
    Object.fromEntries(SLIDERS.map((f) => [f.key, f.initial])),
  )
  const [adminIdx, setAdminIdx] = useState(1)
  const [claimsIdx, setClaimsIdx] = useState(1)
  const [phase, setPhase] = useState('input') // input | done
  const [receipt, setReceipt] = useState(null)

  const set = (key, v) => { startCheck(); setVals((prev) => ({ ...prev, [key]: v })) }

  const result = useMemo(() => {
    const { premium, deductibles, uninsured } = vals
    const admin = ADMIN_LOAD[adminIdx].days * 12 * WORKING_HOURS_PER_DAY * ADMIN_RATE_PER_HOUR
    const total = premium + deductibles + uninsured + admin
    const premiumShare = Math.round((premium / total) * 100)
    const hidden = total - premium

    const components = [
      { key: 'premium', label: 'Premium', value: premium, color: 'var(--teal)' },
      { key: 'deductibles', label: 'Deductibles paid', value: deductibles, color: '#F59E0B' },
      { key: 'uninsured', label: 'Uninsured losses', value: uninsured, color: '#EF4444' },
      { key: 'admin', label: 'Management time', value: admin, color: 'var(--navy)' },
    ]

    const findings = []
    if (uninsured / total > 0.12) {
      findings.push({
        title: `Uninsured losses are ${Math.round((uninsured / total) * 100)}% of your cost of risk`,
        detail: 'Losses absorbed rather than claimed are a retention you never priced. They belong in the renewal conversation, because they are evidence of either a gap in cover or a deductible set too high.',
        severity: 'high',
      })
    }
    if (deductibles > premium * 0.25) {
      findings.push({
        title: 'Your retention may be mispriced',
        detail: 'You are funding a large share of losses directly. That can be the right choice — but only if it was chosen, and only if the premium reflects the risk you took off the insurer.',
        severity: 'high',
      })
    }
    if (claimsIdx >= 2) {
      findings.push({
        title: 'Your claims profile is driving your premium',
        detail: 'Frequency matters more than severity to most underwriters. Without a claims narrative at renewal, the loss record speaks for itself and it rarely speaks in your favour.',
        severity: 'high',
      })
    }
    if (admin > 100_000) {
      findings.push({
        title: `Administration costs about ${fmtAED(admin)} a year`,
        detail: 'Management time spent chasing certificates, schedules and renewals is real cost that never appears on an insurance invoice.',
        severity: 'medium',
      })
    }
    findings.push({
      title: `Premium is only ${premiumShare}% of your total cost of risk`,
      detail: `The other ${100 - premiumShare}% — ${fmtAED(hidden)} a year — is the part no broker quotes you on, and the part that responds to structural work rather than to shopping around.`,
      severity: 'medium',
    })

    return { total, premium, hidden, premiumShare, admin, components, findings }
  }, [vals, adminIdx, claimsIdx])

  const details = {
    premium: vals.premium,
    deductiblesPaid: vals.deductibles,
    uninsuredLosses: vals.uninsured,
    adminLoad: ADMIN_LOAD[adminIdx].label,
    adminCostAssumed: result.admin,
    claimsLast3Years: CLAIMS_HISTORY[claimsIdx].label,
    totalCostOfRisk: result.total,
    premiumSharePct: result.premiumShare,
  }

  const report = {
    score: result.premiumShare,
    headline: `Your Total Cost of Risk works out at about ${fmtAED(result.total)} a year.`,
    summary: `Premium is ${result.premiumShare}% of it; ${fmtAED(result.hidden)} sits outside the premium line.`,
    findings: result.findings,
    benchmark: `Management time costed at AED ${ADMIN_RATE_PER_HOUR}/hour. Figures are indicative and based only on what you entered.`,
  }

  const visible = phase === 'done' ? result.findings : result.findings.slice(0, 1)
  const locked = phase === 'done' ? 0 : Math.max(0, result.findings.length - 1)

  const Finding = ({ f, blurred }) => (
    <div style={{
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${f.severity === 'high' ? '#EF4444' : '#F59E0B'}`,
      padding: '12px 15px', marginBottom: '8px',
      filter: blurred ? 'blur(4px)' : 'none', userSelect: blurred ? 'none' : 'auto',
    }} aria-hidden={blurred || undefined}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14.5px', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.4 }}>{f.title}</div>
      {f.detail && <div style={{ ...s.muted, fontSize: '13px', marginTop: '4px' }}>{f.detail}</div>}
    </div>
  )

  return (
    <div id={CHECK_ANCHOR_ID} style={s.shell}>
      <div style={s.pad}>
        <span style={s.badge}>Free calculator</span>
        <h3 style={s.heading}>{block?.title || 'What does risk actually cost you?'}</h3>
        <p style={{ ...s.muted, margin: '0 0 1.5rem' }}>
          {block?.subtitle || 'Premium is the number you negotiate. It is rarely the number that matters. Move the sliders to your figures.'}
        </p>

        {SLIDERS.map((f) => (
          <div key={f.key} style={{ marginBottom: '1.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', marginBottom: '6px' }}>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', fontWeight: 600, color: 'var(--navy)' }}>{f.label}</label>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 800, color: 'var(--teal-dark)', whiteSpace: 'nowrap' }}>{fmtAED(vals[f.key])}</span>
            </div>
            <input type="range" min={f.min} max={f.max} step={f.step} value={vals[f.key]}
              onChange={(e) => set(f.key, Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--teal)', cursor: 'pointer' }} />
            <div style={{ ...s.muted, fontSize: '12px', marginTop: '2px' }}>{f.help}</div>
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.25rem', marginTop: '1.5rem' }}>
          <div>
            <label style={{ ...s.label, marginBottom: '8px' }}>Management time spent on insurance, per month</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {ADMIN_LOAD.map((a, i) => (
                <button key={a.label} type="button" onClick={() => { startCheck(); setAdminIdx(i) }}
                  style={{ padding: '9px 4px', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: `1px solid ${i === adminIdx ? 'var(--teal)' : 'var(--border-dark)'}`, background: i === adminIdx ? 'var(--teal-pale)' : 'var(--light-bg)', color: i === adminIdx ? 'var(--teal-dark)' : 'var(--text-mid)' }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ ...s.label, marginBottom: '8px' }}>Claims in the last 3 years</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {CLAIMS_HISTORY.map((c, i) => (
                <button key={c.label} type="button" onClick={() => { startCheck(); setClaimsIdx(i) }}
                  style={{ padding: '9px 4px', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: `1px solid ${i === claimsIdx ? 'var(--teal)' : 'var(--border-dark)'}`, background: i === claimsIdx ? 'var(--teal-pale)' : 'var(--light-bg)', color: i === claimsIdx ? 'var(--teal-dark)' : 'var(--text-mid)' }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live result — the whole point is that this moves as they type */}
      <div style={{ background: 'var(--navy)', color: '#fff', padding: isMobile ? '1.4rem 1.25rem' : '1.75rem 2rem' }}>
        <div style={{ ...s.eyebrow, color: 'var(--teal)' }}>Your Total Cost of Risk</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '2.1rem' : '2.8rem', fontWeight: 800, color: 'var(--gold)', letterSpacing: '-0.02em', lineHeight: 1.1, margin: '6px 0 4px' }}>
          {fmtAED(result.total)}<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}> / year</span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14.5px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, margin: '0 0 1.1rem', maxWidth: '52ch' }}>
          Premium is <strong style={{ color: '#fff' }}>{result.premiumShare}%</strong> of that.
          The remaining <strong style={{ color: '#fff' }}>{fmtAED(result.hidden)}</strong> is the part nobody quotes you on.
        </p>

        {/* Stacked composition bar */}
        <div style={{ display: 'flex', height: '26px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.18)' }}>
          {result.components.filter((c) => c.value > 0).map((c) => (
            <motion.div key={c.key} title={`${c.label}: ${fmtAED(c.value)}`}
              animate={{ width: `${(c.value / result.total) * 100}%` }}
              transition={{ duration: 0.25 }}
              style={{ background: c.color, borderRight: '1px solid rgba(255,255,255,0.18)' }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '10px' }}>
          {result.components.map((c) => (
            <span key={c.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.72)' }}>
              <span style={{ width: '9px', height: '9px', background: c.color, border: c.key === 'admin' ? '1px solid rgba(255,255,255,0.5)' : 'none', flexShrink: 0 }} />
              {c.label} · {fmtAED(c.value)}
            </span>
          ))}
        </div>
      </div>

      <div style={s.pad}>
        <div style={{ ...s.eyebrow, marginBottom: '10px' }}>
          {phase === 'done' ? 'Your full breakdown' : 'What this tells you'}
        </div>
        {visible.map((f, i) => <Finding key={i} f={f} />)}

        {locked > 0 && (
          <div style={{ position: 'relative', marginBottom: '4px' }}>
            {result.findings.slice(1, 3).map((f, i) => <Finding key={i} f={f} blurred />)}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'var(--navy)', color: '#fff', padding: '8px 16px', fontFamily: 'var(--font-body)', fontSize: '12.5px', fontWeight: 700 }}>
                <Lock size={13} /> {locked} more finding{locked === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        )}

        <div style={s.divider}>
          {phase === 'done' ? (
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
                We'll benchmark these figures against comparable UAE programmes and come back with where the {fmtAED(result.hidden)} is recoverable
                {receipt?.when ? ` ${receipt.when.toLowerCase()}` : ''}.
                {receipt?.reference && <> Your reference is <strong style={{ color: 'var(--navy)' }}>{receipt.reference}</strong>.</>}
              </p>
              <a href="tel:+971509765976" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '1rem', color: 'var(--teal-dark)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                <Phone size={15} /> Or call 050 976 5976 now
              </a>
            </>
          ) : (
            <ToolCapture
              isMobile={isMobile}
              service="Finance TCOR Review"
              source="tcor-calculator"
              toolId="tcor-calculator"
              reportTitle="Your Total Cost of Risk breakdown"
              message={`TCOR calculator: total ${fmtAED(result.total)}, premium share ${result.premiumShare}%.`}
              details={details}
              report={report}
              heading="See the full breakdown"
              note="We'll send your figures with a benchmark against comparable UAE programmes, and where the non-premium cost is usually recoverable."
              ctaLabel="Send me my TCOR breakdown"
              onSubmitted={(r) => { setReceipt(r); setPhase('done') }}
            />
          )}
        </div>

        <p style={{ ...s.muted, fontSize: '11.5px', fontStyle: 'italic', margin: '1rem 0 0' }}>
          Indicative only. Management time is costed at AED {ADMIN_RATE_PER_HOUR}/hour across {WORKING_HOURS_PER_DAY}-hour days;
          adjust your own rate mentally if it differs. A formal TCOR analysis uses your actual loss runs and accounts.
        </p>
      </div>
    </div>
  )
}
