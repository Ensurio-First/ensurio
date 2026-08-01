import { useState, useMemo } from 'react'
import { Check, Phone } from 'lucide-react'
import toolStyles, { fmtAED } from './toolStyles'
import { CHECK_ANCHOR_ID } from './scrollToCheck'
import ToolCapture from './ToolCapture'
import FindingList from './FindingList'
import { useLeadJourney } from '../../context/LeadJourneyContext'

/*
 * Family protection gap — for individuals and families.
 *
 * Turns an abstract worry ("are we covered enough?") into one number: the
 * shortfall between what the family would need and what the policy would pay.
 * The arithmetic is deliberately simple and shown in full, because the value is
 * in the visitor recognising their own figures, not in a black box.
 */

const YEARS_OPTIONS = [5, 10, 15, 20]

const SLIDERS = [
  {
    key: 'income',
    label: 'Your annual income',
    min: 60_000, max: 3_000_000, step: 10_000, initial: 360_000,
    help: 'Take-home, across the year.',
  },
  {
    key: 'debts',
    label: 'Mortgage and outstanding loans',
    min: 0, max: 10_000_000, step: 50_000, initial: 1_200_000,
    help: 'In the UAE these do not disappear — they pass to your estate.',
  },
  {
    key: 'education',
    label: "Provision for children's education",
    min: 0, max: 3_000_000, step: 50_000, initial: 0,
    help: 'Leave at zero if it does not apply to you.',
  },
  {
    key: 'cover',
    label: 'Life cover you already have',
    min: 0, max: 15_000_000, step: 100_000, initial: 750_000,
    help: 'Include any cover provided by your employer.',
  },
]

export default function ProtectionGap({ block, isMobile }) {
  const s = toolStyles(isMobile)
  const { startCheck } = useLeadJourney()

  const [vals, setVals] = useState(() => Object.fromEntries(SLIDERS.map((f) => [f.key, f.initial])))
  const [years, setYears] = useState(10)
  const [criticalIllness, setCriticalIllness] = useState(null) // true | false | null
  const [beneficiaries, setBeneficiaries] = useState(null)
  const [phase, setPhase] = useState('input') // input | done
  const [receipt, setReceipt] = useState(null)

  const set = (k, v) => { startCheck(); setVals((p) => ({ ...p, [k]: v })) }

  const result = useMemo(() => {
    const incomeNeed = vals.income * years
    const need = incomeNeed + vals.debts + vals.education
    const gap = Math.max(0, need - vals.cover)
    const coversDebts = vals.cover >= vals.debts

    const findings = []
    if (gap > 0) {
      findings.push({
        title: `Your family would be short ${fmtAED(gap)}`,
        detail: `Replacing ${years} years of income, clearing your debts and funding your education provision comes to ${fmtAED(need)}. Your current cover pays ${fmtAED(vals.cover)}.`,
        severity: 'high',
      })
    }
    if (!coversDebts) {
      findings.push({
        title: 'Your cover would not even clear your debts',
        detail: `Debts of ${fmtAED(vals.debts)} against cover of ${fmtAED(vals.cover)}. Before a single month of income is replaced, the shortfall lands on your family — usually at the worst possible moment.`,
        severity: 'high',
      })
    }
    if (criticalIllness === false) {
      findings.push({
        title: 'No critical illness cover',
        detail: 'Life cover pays on death. A serious illness you survive brings the same loss of income, often for longer, with none of the payout — and with treatment costs on top.',
        severity: 'high',
      })
    }
    if (beneficiaries === false) {
      findings.push({
        title: 'Beneficiaries not named or not current',
        detail: 'Payouts follow the nomination on file. Without a current one, the money enters a legal process instead of reaching your family quickly — which is precisely when they need it.',
        severity: 'medium',
      })
    }
    if (gap === 0) {
      findings.push({
        title: 'The headline number looks adequate',
        detail: 'Worth confirming the cover is structured to pay out cleanly — the amount is only half the question, and the policy terms are the other half.',
        severity: 'low',
      })
    }

    return { need, incomeNeed, gap, coversDebts, findings }
  }, [vals, years, criticalIllness, beneficiaries])

  const details = {
    annualIncome: vals.income,
    yearsOfIncome: years,
    debts: vals.debts,
    educationProvision: vals.education,
    existingCover: vals.cover,
    totalNeed: result.need,
    shortfall: result.gap,
    criticalIllness,
    beneficiariesCurrent: beneficiaries,
  }

  const report = {
    headline: result.gap > 0
      ? `Your family would be short about ${fmtAED(result.gap)}.`
      : 'Your cover amount looks adequate on these figures.',
    summary: `Need ${fmtAED(result.need)} · existing cover ${fmtAED(vals.cover)}.`,
    findings: result.findings,
    benchmark: 'Indicative only, based on the figures you entered. A formal review looks at policy terms, exclusions and how quickly a claim would actually pay.',
  }

  const done = phase === 'done'

  const YesNo = ({ label, value, onChange }) => (
    <div>
      <label style={{ ...s.label, marginBottom: '8px' }}>{label}</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {[{ l: 'Yes', v: true }, { l: 'No', v: false }].map(({ l, v }) => (
          <button key={l} type="button" onClick={() => { startCheck(); onChange(value === v ? null : v) }}
            style={{ padding: '10px 4px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: `1px solid ${value === v ? 'var(--teal)' : 'var(--border-dark)'}`, background: value === v ? 'var(--teal-pale)' : 'var(--light-bg)', color: value === v ? 'var(--teal-dark)' : 'var(--text-mid)' }}>
            {l}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div id={CHECK_ANCHOR_ID} style={s.shell}>
      <div style={s.pad}>
        <span style={s.badge}>Free calculator</span>
        <h3 style={s.heading}>{block?.title || 'Would your family be financially secure without you?'}</h3>
        <p style={{ ...s.muted, margin: '0 0 1.5rem' }}>
          {block?.subtitle || 'Four figures and two questions. The arithmetic is shown in full — no black box.'}
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

        <div style={{ marginBottom: '1.3rem' }}>
          <label style={{ ...s.label, marginBottom: '8px' }}>Years of income your family would need</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {YEARS_OPTIONS.map((y) => (
              <button key={y} type="button" onClick={() => { startCheck(); setYears(y) }}
                style={{ padding: '10px 4px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: `1px solid ${years === y ? 'var(--teal)' : 'var(--border-dark)'}`, background: years === y ? 'var(--teal-pale)' : 'var(--light-bg)', color: years === y ? 'var(--teal-dark)' : 'var(--text-mid)' }}>
                {y} years
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.25rem' }}>
          <YesNo label="Critical illness cover included?" value={criticalIllness} onChange={setCriticalIllness} />
          <YesNo label="Beneficiaries named and current?" value={beneficiaries} onChange={setBeneficiaries} />
        </div>
      </div>

      {/* The number */}
      <div style={{ background: 'var(--navy)', color: '#fff', padding: isMobile ? '1.4rem 1.25rem' : '1.75rem 2rem' }}>
        <div style={{ ...s.eyebrow, color: 'var(--teal)' }}>{result.gap > 0 ? 'Your protection gap' : 'Your position'}</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '2.1rem' : '2.8rem', fontWeight: 800, color: result.gap > 0 ? 'var(--gold)' : 'var(--teal)', letterSpacing: '-0.02em', lineHeight: 1.1, margin: '6px 0 8px' }}>
          {result.gap > 0 ? fmtAED(result.gap) : 'Covered'}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.9 }}>
          <div>Income replacement ({years} yrs) &nbsp;·&nbsp; {fmtAED(result.incomeNeed)}</div>
          <div>Debts to clear &nbsp;·&nbsp; {fmtAED(vals.debts)}</div>
          {vals.education > 0 && <div>Education provision &nbsp;·&nbsp; {fmtAED(vals.education)}</div>}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '6px', paddingTop: '6px', color: '#fff', fontWeight: 700 }}>
            Total need &nbsp;·&nbsp; {fmtAED(result.need)}
          </div>
          <div>Less existing cover &nbsp;·&nbsp; −{fmtAED(vals.cover)}</div>
        </div>
      </div>

      <div style={s.pad}>
        <div style={{ ...s.eyebrow, marginBottom: '10px' }}>{done ? 'Your full result' : 'What this means'}</div>
        <FindingList findings={result.findings} revealAll={done} />

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
                An independent advisor will look at what closing this would actually cost — and at whether your existing
                policy would pay cleanly{receipt?.when ? `, and call you ${receipt.when.toLowerCase()}` : ''}.
                {receipt?.reference && <> Your reference is <strong style={{ color: 'var(--navy)' }}>{receipt.reference}</strong>.</>}
              </p>
              <a href="tel:+971509765976" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '1rem', color: 'var(--teal-dark)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                <Phone size={15} /> Or call 050 976 5976
              </a>
            </>
          ) : (
            <ToolCapture
              isMobile={isMobile}
              service="Personal Review"
              source="protection-gap"
              toolId="protection-gap"
              reportTitle="Your family protection gap"
              message={`Protection gap: need ${fmtAED(result.need)}, cover ${fmtAED(vals.cover)}, shortfall ${fmtAED(result.gap)}.`}
              details={details}
              report={report}
              heading="See the full result"
              note="We'll send your figures with what closing the gap would realistically cost — and whether your existing policy would pay out cleanly."
              ctaLabel="Send me my result"
              onSubmitted={(r) => { setReceipt(r); setPhase('done') }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
