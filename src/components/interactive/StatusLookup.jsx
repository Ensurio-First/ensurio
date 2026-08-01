import { useState } from 'react'
import { Search, Phone, CheckCircle2 } from 'lucide-react'
import toolStyles from './toolStyles'
import { CHECK_ANCHOR_ID } from './scrollToCheck'
import { lookupLeadStatus } from '../../lib/supabase'

/*
 * Reference lookup.
 *
 * Every submission already issues a reference like IF-7K2M9X and puts it on
 * screen and in the email. This lets someone come back and see where their
 * enquiry actually stands instead of wondering whether it arrived — which is
 * the question that otherwise becomes a phone call.
 *
 * Requires the email as well as the reference. A wrong reference and a
 * mismatched email produce identical responses, so this cannot be used to work
 * out which references exist.
 */

const STAGES = ['received', 'contacted', 'in-review', 'advising', 'closed']

export default function StatusLookup({ block, isMobile }) {
  const s = toolStyles(isMobile)
  const [reference, setReference] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | loading | found | notfound | error
  const [data, setData] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setState('loading')
    try {
      const res = await lookupLeadStatus({ reference, email })
      if (res.found) { setData(res); setState('found') }
      else setState('notfound')
    } catch (err) {
      setState(err.message === 'invalid-input' ? 'notfound' : 'error')
    }
  }

  const inputStyle = {
    width: '100%', height: '46px', padding: '0 14px', boxSizing: 'border-box',
    fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dark)',
    background: 'var(--white)', border: '1.5px solid var(--border-dark)', outline: 'none',
  }

  const stageIndex = data ? STAGES.indexOf(data.status) : -1

  return (
    <div id={block?.secondary ? undefined : CHECK_ANCHOR_ID} style={s.shell}>
      <div style={s.pad}>
        <span style={s.badge}>Check your reference</span>
        <h3 style={s.heading}>{block?.title || 'Already sent us something? See where it stands'}</h3>
        <p style={{ ...s.muted, margin: '0 0 1.25rem' }}>
          {block?.subtitle || 'Enter the reference we gave you and the email you used. Both, because a reference on its own is not a password.'}
        </p>

        {state !== 'found' && (
          <form onSubmit={submit} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '160px 1fr auto', gap: '10px', alignItems: 'start' }}>
              <input aria-label="Your reference" type="text" placeholder="IF-XXXXXX" value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                style={{ ...inputStyle, letterSpacing: '0.06em', fontWeight: 700 }} />
              <input aria-label="Email address" type="email" placeholder="The email you used" value={email}
                onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
              <button type="submit" disabled={state === 'loading'}
                style={{ ...s.primaryBtn, height: '46px', justifyContent: 'center', cursor: state === 'loading' ? 'wait' : 'pointer' }}>
                {state === 'loading' ? 'Looking…' : <><Search size={15} /> Look up</>}
              </button>
            </div>

            {state === 'notfound' && (
              <p role="alert" style={{ ...s.muted, fontSize: '13px', margin: '12px 0 0', color: '#B45309' }}>
                No enquiry matches that reference and email together. Check both — the reference looks like
                <strong> IF-7K2M9X</strong>, and the email has to be the one you submitted with. If you are
                still stuck, call us and we will find it.
              </p>
            )}
            {state === 'error' && (
              <p role="alert" style={{ ...s.muted, fontSize: '13px', margin: '12px 0 0', color: '#EF4444' }}>
                We could not check that just now. Please try again, or call us.
              </p>
            )}
          </form>
        )}

        {state === 'found' && data && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <CheckCircle2 size={20} color="var(--teal)" />
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                {data.statusLabel}
              </h4>
            </div>
            <p style={{ ...s.muted, margin: '0 0 1.25rem' }}>{data.statusDetail}</p>

            {/* Stage rail — shows how far along, and how much is left */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
              {STAGES.map((st, i) => (
                <div key={st} style={{ flex: 1, height: '5px', background: i <= stageIndex ? 'var(--teal)' : 'var(--border)' }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', ...s.muted, fontSize: '11px', marginBottom: '1.5rem' }}>
              <span>Received</span><span>Closed</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '13.5px' }}>
              <tbody>
                {[
                  ['Reference', data.reference],
                  ['Submitted', new Date(data.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
                  ['About', data.service || 'General enquiry'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: '7px 12px 7px 0', color: 'var(--text-muted)', fontWeight: 700, fontSize: '12px', whiteSpace: 'nowrap', verticalAlign: 'top' }}>{k}</td>
                    <td style={{ padding: '7px 0', color: 'var(--text-dark)' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ ...s.divider, display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="tel:+971509765976" style={{ ...s.primaryBtn, textDecoration: 'none' }}>
                <Phone size={15} /> Call and quote {data.reference}
              </a>
              <button type="button" onClick={() => { setState('idle'); setData(null); setReference(''); setEmail('') }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textDecoration: 'underline', padding: 0 }}>
                Look up another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
