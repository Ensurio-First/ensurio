import { Lock } from 'lucide-react'

/*
 * Findings, with the gate.
 *
 * Every tool ends the same way: show the first finding, blur the rest behind a
 * count, then reveal everything once the visitor has claimed the result. The
 * blur is deliberately shallow — they should be able to tell there is something
 * real underneath, because a gate that hides whether anything is there at all
 * reads as a trick rather than an exchange.
 */

const TONE = { high: '#EF4444', medium: '#F59E0B', low: 'var(--teal)' }

function Finding({ finding, blurred }) {
  return (
    <div
      aria-hidden={blurred || undefined}
      style={{
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${TONE[finding.severity] ?? TONE.medium}`,
        padding: '12px 15px',
        marginBottom: '8px',
        background: 'var(--white)',
        filter: blurred ? 'blur(4px)' : 'none',
        userSelect: blurred ? 'none' : 'auto',
      }}
    >
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14.5px', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.4 }}>
        {finding.title}
      </div>
      {finding.detail && (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '4px' }}>
          {finding.detail}
        </div>
      )}
      {finding.note && !blurred && (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', fontWeight: 700, color: '#B45309', marginTop: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {finding.note}
        </div>
      )}
    </div>
  )
}

export default function FindingList({ findings = [], revealAll = false, noun = 'finding', freeCount = 1 }) {
  if (findings.length === 0) return null

  const visible = revealAll ? findings : findings.slice(0, freeCount)
  const hidden = revealAll ? 0 : Math.max(0, findings.length - freeCount)

  return (
    <>
      {visible.map((f, i) => <Finding key={i} finding={f} />)}

      {hidden > 0 && (
        <div style={{ position: 'relative', marginBottom: '4px' }}>
          {findings.slice(freeCount, freeCount + 2).map((f, i) => <Finding key={i} finding={f} blurred />)}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'var(--navy)', color: '#fff', padding: '8px 16px', fontFamily: 'var(--font-body)', fontSize: '12.5px', fontWeight: 700 }}>
              <Lock size={13} /> {hidden} more {noun}{hidden === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
