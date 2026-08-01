import { useState, useEffect, useMemo } from 'react'
import { Check, Save, Phone, FileText, Printer } from 'lucide-react'
import toolStyles from './toolStyles'
import { CHECK_ANCHOR_ID } from './scrollToCheck'
import ToolCapture from './ToolCapture'
import { useLeadJourney } from '../../context/LeadJourneyContext'

/*
 * Evidence pack builder.
 *
 * Claims are settled on the documented record, and the record is always weakest
 * where it was reconstructed weeks later from memory. This gives the visitor a
 * structured place to write things down on day one, while they still remember
 * the sequence, the names and the times.
 *
 * Two decisions make it actually useful rather than another form:
 *
 * 1. It saves to localStorage on every keystroke. A claim runs over weeks; a
 *    tool that loses your work when you close the tab would be worse than a
 *    notebook. Nothing is sent anywhere until they explicitly ask us to look
 *    at it — the draft is theirs alone until then.
 *
 * 2. Completeness is shown as a proportion rather than a validation error.
 *    Nothing here is required, because a half-filled pack written on the day
 *    beats a complete one written from memory a month later.
 */

const STORAGE_KEY = 'ensurio:evidence-pack'

const FIELDS = [
  { key: 'what', label: 'What happened', type: 'textarea', rows: 4,
    placeholder: 'In your own words — what happened, in the order it happened.',
    hint: 'Write it now while the sequence is fresh. Adjusters notice when an account changes between tellings.' },
  { key: 'when', label: 'Date and time it happened', type: 'text',
    placeholder: 'e.g. 14 March, around 21:30',
    hint: 'Approximate is fine, but say it is approximate. Your notification window is measured from this moment.' },
  { key: 'where', label: 'Where it happened', type: 'text',
    placeholder: 'Site, unit, address or vehicle' },
  { key: 'discovered', label: 'When you discovered it', type: 'text',
    placeholder: 'If different from when it happened',
    hint: 'For theft and water damage these are often days apart, and the difference matters to the claim.' },
  { key: 'damage', label: 'What was damaged, lost or injured', type: 'textarea', rows: 3,
    placeholder: 'List items, quantities and rough values where you can.' },
  { key: 'witnesses', label: 'Witnesses', type: 'textarea', rows: 2,
    placeholder: 'Names and contact numbers of anyone who saw it',
    hint: 'People move on and change jobs. Contact details captured now are often impossible to get later.' },
  { key: 'authorities', label: 'Police, civil defence or authority reports', type: 'text',
    placeholder: 'Report number and which authority' },
  { key: 'insurerContact', label: 'Who you have spoken to at the insurer', type: 'textarea', rows: 3,
    placeholder: 'Name, date, what was said or agreed',
    hint: 'Log every call as it happens. Verbal assurances carry almost no weight unless you can show when they were given and by whom.' },
  { key: 'mitigation', label: 'What you did to prevent further damage', type: 'textarea', rows: 2,
    placeholder: 'Emergency repairs, security, moving stock — and what it cost',
    hint: 'Mitigation costs are usually recoverable, and failing to mitigate can reduce a claim. Both make this worth recording.' },
  { key: 'policyRef', label: 'Policy and claim reference numbers', type: 'text',
    placeholder: 'If you have them to hand' },
]

const PHOTO_ITEMS = [
  'Wide shots showing the whole scene',
  'Close-ups of each damaged item',
  'Serial numbers or identifying marks',
  'The cause, if it is visible',
  'Surrounding property or vehicles',
  'Any temporary repairs you made',
]

export default function EvidencePack({ block, isMobile }) {
  const s = toolStyles(isMobile)
  const { startCheck } = useLeadJourney()

  const [values, setValues] = useState({})
  const [photos, setPhotos] = useState([])
  const [restored, setRestored] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sent, setSent] = useState(null)

  // Restore any draft from a previous visit before the first paint of content.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const draft = JSON.parse(raw)
        setValues(draft.values || {})
        setPhotos(draft.photos || [])
        if (Object.values(draft.values || {}).some(Boolean)) setRestored(true)
      }
    } catch { /* a corrupt or blocked store just means starting fresh */ }
  }, [])

  // Persist on change. Cheap, and the alternative is losing someone's work.
  useEffect(() => {
    if (!Object.keys(values).length && !photos.length) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ values, photos }))
      setSaved(true)
      const t = setTimeout(() => setSaved(false), 1600)
      return () => clearTimeout(t)
    } catch { /* private browsing — the pack still works, it just will not persist */ }
  }, [values, photos])

  const set = (k, v) => { startCheck('evidence-pack'); setValues((prev) => ({ ...prev, [k]: v })) }
  const togglePhoto = (item) => {
    startCheck('evidence-pack')
    setPhotos((prev) => (prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]))
  }

  const completeness = useMemo(() => {
    const filled = FIELDS.filter((f) => (values[f.key] || '').trim().length > 2).length
    const total = FIELDS.length + 1 // +1 for the photo checklist
    return Math.round(((filled + (photos.length ? 1 : 0)) / total) * 100)
  }, [values, photos])

  const clearDraft = () => {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* nothing to clear */ }
    setValues({}); setPhotos([]); setRestored(false)
  }

  const details = { ...values, photographed: photos, completenessPct: completeness }

  const report = {
    score: completeness,
    headline: `Your evidence pack is ${completeness}% complete.`,
    summary: 'Incident record built on the claims advisory page.',
    findings: FIELDS
      .filter((f) => (values[f.key] || '').trim())
      .map((f) => ({ title: f.label, detail: values[f.key], severity: 'low' }))
      .concat(photos.length ? [{ title: 'Photographed', detail: photos.join('; '), severity: 'low' }] : []),
  }

  const inputStyle = {
    width: '100%', padding: '11px 13px', boxSizing: 'border-box',
    fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dark)',
    background: 'var(--white)', border: '1.5px solid var(--border-dark)', outline: 'none',
    lineHeight: 1.6, resize: 'vertical',
  }

  return (
    <div id={block?.secondary ? undefined : CHECK_ANCHOR_ID} style={s.shell}>
      {/* Only appears on paper: a loose printout has to say what it is and
          who produced it, or it is just an anonymous page of notes. */}
      <div className="print-only" style={{ borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '16px' }}>
        <strong style={{ fontSize: '13pt' }}>Claim evidence record</strong>
        <div style={{ fontSize: '9pt' }}>
          Insure First · consult@insurefirst.ae · 050 976 5976
          {sent?.reference ? ` · Reference ${sent.reference}` : ''}
        </div>
      </div>

      <div style={s.pad}>
        <span style={s.badge}>Evidence pack</span>
        <h3 style={s.heading}>{block?.title || 'Write it down now, while you still remember it'}</h3>
        <p style={{ ...s.muted, margin: '0 0 0.5rem' }}>
          {block?.subtitle || 'Claims are settled on the documented record — and the record is always weakest where it was rebuilt from memory weeks later. Nothing here is required, and nothing is sent to us until you ask.'}
        </p>
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', margin: '0 0 1.5rem' }}>
          <p style={{ ...s.muted, fontSize: '12.5px', margin: 0 }}>
            Saved in this browser as you type, so you can come back to it over the next few days.
          </p>
          <button type="button" onClick={() => window.print()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 16px', background: 'transparent', border: '1.5px solid var(--border-dark)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--navy)', whiteSpace: 'nowrap' }}>
            <Printer size={14} /> Print or save as PDF
          </button>
        </div>

        {restored && (
          <div style={{ background: 'var(--teal-pale)', border: '1px solid var(--teal)', padding: '11px 14px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--teal-dark)', fontWeight: 600 }}>
              We restored the pack you started earlier.
            </span>
            <button type="button" onClick={clearDraft}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-muted)', textDecoration: 'underline', padding: 0 }}>
              Start a new one
            </button>
          </div>
        )}

        {/* Completeness — a proportion, never a validation error */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
            <span style={s.eyebrow}>Pack completeness</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 800, color: 'var(--teal-dark)' }}>
              {saved && <><Save size={12} /> saved</>} {completeness}%
            </span>
          </div>
          <div style={{ height: '6px', background: 'var(--border)' }}>
            <div style={{ height: '100%', width: `${completeness}%`, background: 'var(--teal)', transition: 'width 0.25s' }} />
          </div>
        </div>

        {FIELDS.map((f) => (
          <div key={f.key} style={{ marginBottom: '1.15rem' }}>
            <label style={{ ...s.label, marginBottom: '6px' }}>{f.label}</label>
            {f.type === 'textarea'
              ? <textarea rows={f.rows} value={values[f.key] || ''} placeholder={f.placeholder}
                  onChange={(e) => set(f.key, e.target.value)} style={inputStyle} />
              : <input type="text" value={values[f.key] || ''} placeholder={f.placeholder}
                  onChange={(e) => set(f.key, e.target.value)} style={{ ...inputStyle, height: '44px', padding: '0 13px' }} />}
            {f.hint && <div style={{ ...s.muted, fontSize: '12px', marginTop: '4px' }}>{f.hint}</div>}
          </div>
        ))}

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ ...s.label, marginBottom: '8px' }}>What you have photographed</label>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '7px' }}>
            {PHOTO_ITEMS.map((item) => {
              const on = photos.includes(item)
              return (
                <button key={item} type="button" onClick={() => togglePhoto(item)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', cursor: 'pointer', textAlign: 'left', border: `1.5px solid ${on ? 'var(--teal)' : 'var(--border)'}`, background: on ? 'var(--teal-pale)' : 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '13.5px', fontWeight: 600, color: on ? 'var(--navy)' : 'var(--text-mid)' }}>
                  <span style={{ width: '17px', height: '17px', flexShrink: 0, border: `1.5px solid ${on ? 'var(--teal)' : 'var(--border-dark)'}`, background: on ? 'var(--teal)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {on && <Check size={11} color="#fff" strokeWidth={3} />}
                  </span>
                  {item}
                </button>
              )
            })}
          </div>
        </div>

        <div style={s.divider}>
          {sent ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ width: '26px', height: '26px', background: 'var(--teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={15} color="var(--teal)" strokeWidth={3} />
                </span>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                  Sent, {sent.name?.trim().split(/\s+/)[0]}
                </h4>
              </div>
              <p style={{ ...s.muted, margin: 0 }}>
                An advisor will read your pack and come back{sent.when ? ` ${sent.when.toLowerCase()}` : ''} with what is missing
                and what to send the insurer first.
                {sent.reference && <> Your reference is <strong style={{ color: 'var(--navy)' }}>{sent.reference}</strong>.</>}
                {' '}Your copy stays saved in this browser — keep adding to it as things happen.
              </p>
              <a href="tel:+971509765976" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '1rem', color: 'var(--teal-dark)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                <Phone size={15} /> Or call 050 976 5976
              </a>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '11px', alignItems: 'flex-start', background: 'var(--light-bg)', padding: '13px 15px', marginBottom: '1.25rem' }}>
                <FileText size={17} color="var(--teal-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ ...s.muted, fontSize: '13px' }}>
                  Sending this to us is optional. If you do, an advisor reads it and tells you what is missing
                  before the insurer finds the gap — and you keep your copy either way.
                </div>
              </div>
              <ToolCapture
                isMobile={isMobile}
                service="Claims Advisory"
                source="evidence-pack"
                toolId="evidence-pack"
                reportTitle="Your claim evidence pack"
                message={`Evidence pack submitted — ${completeness}% complete.`}
                details={details}
                report={report}
                heading="Want an advisor to review it?"
                note="We'll email your pack back to you and tell you what is missing, what to send the insurer, and in what order."
                ctaLabel="Send my pack for review"
                onSubmitted={(r) => setSent(r)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
