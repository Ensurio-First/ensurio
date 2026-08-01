import { useState, useMemo } from 'react'
import { Check, Phone } from 'lucide-react'
import toolStyles, { fmtAED } from './toolStyles'
import { CHECK_ANCHOR_ID } from './scrollToCheck'
import ToolCapture from './ToolCapture'
import FindingList from './FindingList'
import { useLeadJourney } from '../../context/LeadJourneyContext'

/*
 * Settlement offer checker.
 *
 * Underpayment attracts far less scrutiny than refusal, because accepting an
 * offer feels like winning. This exists for that moment: put the offer next to
 * the claim, subtract the excess, and show what is actually unexplained.
 *
 * It deliberately does not tell anyone their offer is wrong — it cannot know
 * that. It tells them how much of the gap the obvious deductions account for,
 * and names the specific mechanisms that usually explain the rest. That is
 * enough to turn "this feels low" into a question the insurer has to answer.
 */

const BASIS = [
  { value: 'new', label: 'New for old', note: 'Replacement without deduction for age or wear.' },
  { value: 'indemnity', label: 'Indemnity', note: 'Replacement less depreciation — deliberately less than new.' },
  { value: 'agreed', label: 'Agreed value', note: 'A figure fixed at inception, payable on total loss.' },
  { value: 'unsure', label: 'Not sure', note: 'This is the first thing to establish — it changes the whole calculation.' },
]

const SLIDERS = [
  { key: 'claimed', label: 'What you claimed', min: 0, max: 5_000_000, step: 5_000, initial: 250_000,
    help: 'The figure you put to the insurer.' },
  { key: 'offered', label: 'What they have offered', min: 0, max: 5_000_000, step: 5_000, initial: 150_000,
    help: 'Their number, before you accept anything.' },
  { key: 'excess', label: 'Your policy excess or deductible', min: 0, max: 500_000, step: 1_000, initial: 10_000,
    help: 'The part you always fund yourself.' },
  { key: 'sumInsured', label: 'Sum insured for the damaged item', min: 0, max: 20_000_000, step: 50_000, initial: 2_000_000,
    help: 'From your policy schedule. Leave rough if you are unsure.' },
  { key: 'trueValue', label: 'What the item is actually worth today', min: 0, max: 20_000_000, step: 50_000, initial: 2_000_000,
    help: 'Replacement cost now, not what you paid.' },
]

export default function OfferCheck({ block, isMobile }) {
  const s = toolStyles(isMobile)
  const { startCheck } = useLeadJourney()

  const [vals, setVals] = useState(() => Object.fromEntries(SLIDERS.map((f) => [f.key, f.initial])))
  const [basis, setBasis] = useState(null)
  const [done, setDone] = useState(false)
  const [receipt, setReceipt] = useState(null)

  const set = (k, v) => { startCheck('offer-check'); setVals((p) => ({ ...p, [k]: v })) }

  const result = useMemo(() => {
    const { claimed, offered, excess, sumInsured, trueValue } = vals
    const gap = Math.max(0, claimed - offered)
    const unexplained = Math.max(0, gap - excess)
    const gapPct = claimed > 0 ? Math.round((gap / claimed) * 100) : 0

    // Under-insurance: where the sum insured falls short of true value, insurers
    // commonly reduce settlement in the same proportion. Worth naming, because
    // it is the most frequent silent explanation for a short offer.
    const underPct = trueValue > 0 && sumInsured < trueValue
      ? Math.round((1 - sumInsured / trueValue) * 100)
      : 0
    const averageEffect = underPct > 0 ? Math.round(claimed * (underPct / 100)) : 0

    const findings = []

    if (unexplained > 0) {
      findings.push({
        title: `${fmtAED(unexplained)} of the gap is not explained by your excess`,
        detail: `You claimed ${fmtAED(claimed)} and were offered ${fmtAED(offered)} — a gap of ${fmtAED(gap)}, or ${gapPct}%. Your excess of ${fmtAED(excess)} accounts for part of it. The rest needs a reason, and the insurer should give you that reason in writing against a specific policy term.`,
        severity: 'high',
      })
    }

    if (underPct > 0) {
      findings.push({
        title: `You may be under-insured by about ${underPct}%`,
        detail: `Your sum insured (${fmtAED(sumInsured)}) sits below what the item is worth (${fmtAED(trueValue)}). Where that happens, insurers commonly apply average and reduce the settlement in the same proportion — which on this claim would be roughly ${fmtAED(averageEffect)}. If that is what has happened, it should have been said explicitly.`,
        severity: 'high',
      })
    }

    if (basis === 'unsure') {
      findings.push({
        title: 'You do not yet know your basis of settlement',
        detail: 'New-for-old, indemnity and agreed value produce very different numbers from the same loss. Until you know which one your policy uses, there is no way to tell whether the offer is low or simply what the policy promised. Ask for it in writing.',
        severity: 'high',
      })
    }

    if (basis === 'indemnity' && unexplained > 0) {
      findings.push({
        title: 'Indemnity basis explains some of a gap, but not all of it',
        detail: 'Indemnity means replacement less depreciation, so an offer below your claim is expected. What is not automatic is the depreciation rate they applied — ask how it was calculated and against what evidence.',
        severity: 'medium',
      })
    }

    if (basis === 'new' && unexplained > 0) {
      findings.push({
        title: 'On a new-for-old policy this gap needs explaining',
        detail: 'New-for-old should replace without deduction for age or wear. A shortfall beyond your excess points at under-insurance, a disputed scope of damage, or an excluded element — and they should tell you which.',
        severity: 'high',
      })
    }

    if (gap === 0 && offered > 0) {
      findings.push({
        title: 'The offer matches what you claimed',
        detail: 'Worth checking your claim captured everything before you accept — business interruption, mitigation costs and professional fees are routinely left out of a first submission rather than refused.',
        severity: 'low',
      })
    }

    findings.push({
      title: 'Accepting is usually final',
      detail: 'Settlement is generally full and final for that claim. Anything you discover afterwards is normally too late, which is why the questions are worth asking before you sign rather than after.',
      severity: 'medium',
    })

    return { gap, unexplained, gapPct, underPct, averageEffect, findings }
  }, [vals, basis])

  const details = { ...vals, basisOfSettlement: BASIS.find((b) => b.value === basis)?.label ?? null, gap: result.gap, unexplained: result.unexplained }

  const report = {
    score: 100 - Math.min(100, result.gapPct),
    headline: result.unexplained > 0
      ? `${fmtAED(result.unexplained)} of your settlement gap is unexplained.`
      : 'The offer is close to what you claimed.',
    summary: `Claimed ${fmtAED(vals.claimed)} · offered ${fmtAED(vals.offered)} · excess ${fmtAED(vals.excess)}.`,
    findings: result.findings,
    benchmark: 'Indicative only. A proper review reads the offer against your policy wording and the adjuster’s report.',
  }

  return (
    <div id={block?.secondary ? undefined : CHECK_ANCHOR_ID} style={s.shell}>
      <div style={s.pad}>
        <span style={s.badge}>Offer checker</span>
        <h3 style={s.heading}>{block?.title || 'Is the offer on the table actually fair?'}</h3>
        <p style={{ ...s.muted, margin: '0 0 1.5rem' }}>
          {block?.subtitle || 'Underpayment gets far less scrutiny than refusal, because accepting feels like winning. Put the numbers side by side before you respond.'}
        </p>

        {SLIDERS.map((f) => (
          <div key={f.key} style={{ marginBottom: '1.25rem' }}>
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

        <label style={{ ...s.label, marginBottom: '8px' }}>Basis of settlement in your policy</label>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '6px' }}>
          {BASIS.map((b) => {
            const on = basis === b.value
            return (
              <button key={b.value} type="button" onClick={() => { startCheck('offer-check'); setBasis(on ? null : b.value) }}
                style={{ padding: '10px 6px', fontFamily: 'var(--font-body)', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', border: `1px solid ${on ? 'var(--teal)' : 'var(--border-dark)'}`, background: on ? 'var(--teal-pale)' : 'var(--light-bg)', color: on ? 'var(--teal-dark)' : 'var(--text-mid)' }}>
                {b.label}
              </button>
            )
          })}
        </div>
        {basis && (
          <p style={{ ...s.muted, fontSize: '12.5px', margin: '8px 0 0' }}>
            {BASIS.find((b) => b.value === basis).note}
          </p>
        )}
      </div>

      <div className="print-invert print-keep" style={{ background: 'var(--navy)', color: '#fff', padding: isMobile ? '1.4rem 1.25rem' : '1.75rem 2rem' }}>
        <div style={{ ...s.eyebrow, color: 'var(--teal)' }}>Unexplained shortfall</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '2.1rem' : '2.8rem', fontWeight: 800, color: result.unexplained > 0 ? 'var(--gold)' : 'var(--teal)', letterSpacing: '-0.02em', lineHeight: 1.1, margin: '6px 0 8px' }}>
          {result.unexplained > 0 ? fmtAED(result.unexplained) : 'None'}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.9 }}>
          <div>Claimed &nbsp;·&nbsp; {fmtAED(vals.claimed)}</div>
          <div>Offered &nbsp;·&nbsp; −{fmtAED(vals.offered)}</div>
          <div>Your excess &nbsp;·&nbsp; −{fmtAED(vals.excess)}</div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '6px', paddingTop: '6px', color: '#fff', fontWeight: 700 }}>
            Still to be explained &nbsp;·&nbsp; {fmtAED(result.unexplained)}
          </div>
        </div>
      </div>

      <div style={s.pad}>
        <div style={{ ...s.eyebrow, marginBottom: '10px' }}>{done ? 'Your full read' : 'What could be behind it'}</div>
        <FindingList findings={result.findings} revealAll={done} noun="reason" />

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
                Do not accept the offer until someone has read it against your wording. We will come back
                {receipt?.when ? ` ${receipt.when.toLowerCase()}` : ' shortly'} with what to put to them.
                {receipt?.reference && <> Your reference is <strong style={{ color: 'var(--navy)' }}>{receipt.reference}</strong>.</>}
              </p>
              <a href="tel:+971509765976" style={{ ...s.primaryBtn, marginTop: '1rem', textDecoration: 'none' }}>
                <Phone size={15} /> Call 050 976 5976
              </a>
            </>
          ) : (
            <ToolCapture
              isMobile={isMobile}
              service="Legal Claims Support"
              source="offer-check"
              toolId="offer-check"
              reportTitle="Your settlement offer review"
              message={`Offer check: claimed ${fmtAED(vals.claimed)}, offered ${fmtAED(vals.offered)}, unexplained ${fmtAED(result.unexplained)}.`}
              details={details}
              report={report}
              heading="Have it read before you accept"
              note="Settlement is normally full and final. We'll check the offer against your wording and the adjuster's report, and tell you what to challenge."
              ctaLabel="Review my offer"
              onSubmitted={(r) => { setReceipt(r); setDone(true) }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
