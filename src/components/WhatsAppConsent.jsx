/*
 * WhatsApp contact opt-in — asks whether the lead is happy to be reached on
 * WhatsApp and whether the same phone number can be used (revealing an
 * alternate-number field if not). Controlled: parent holds `value` and passes
 * `onChange`. At submit, run the value through `resolveWhatsApp(value, phone)`
 * to get the { whatsappOptIn, whatsappNumber } fields for submitLead.
 */

export const emptyWhatsApp = { optIn: false, sameNumber: true, altNumber: '' }

export function resolveWhatsApp(value, phone) {
  if (!value || !value.optIn) return { whatsappOptIn: false, whatsappNumber: null }
  const num = (value.sameNumber ? phone : value.altNumber) || null
  return { whatsappOptIn: true, whatsappNumber: num }
}

function WaMark({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366" style={{ flexShrink: 0 }} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

export default function WhatsAppConsent({ value = emptyWhatsApp, onChange, phone = '', dark = false }) {
  const { optIn, sameNumber, altNumber } = value
  const patch = (p) => onChange({ ...value, ...p })

  const rowText = dark ? 'rgba(255,255,255,0.9)' : 'var(--navy)'
  const subText = dark ? 'rgba(255,255,255,0.7)' : 'var(--text-mid)'
  const cbStyle = { width: '17px', height: '17px', accentColor: '#25D366', cursor: 'pointer', flexShrink: 0, marginTop: '1px' }
  const trimmedPhone = (phone || '').trim()

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', cursor: 'pointer' }}>
        <input type="checkbox" checked={optIn} onChange={(e) => patch({ optIn: e.target.checked })} style={cbStyle} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', fontSize: '13.5px', fontWeight: 600, color: rowText, lineHeight: 1.4 }}>
          <WaMark size={15} /> Contact me on WhatsApp
        </span>
      </label>

      {optIn && (
        <div style={{ marginTop: '8px', paddingLeft: '26px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={sameNumber} onChange={(e) => patch({ sameNumber: e.target.checked })} style={cbStyle} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: subText, lineHeight: 1.4 }}>
              Use this same number{trimmedPhone ? ` (${trimmedPhone})` : ''}
            </span>
          </label>
          {!sameNumber && (
            <input
              type="tel"
              aria-label="WhatsApp number"
              placeholder="WhatsApp number"
              value={altNumber}
              onChange={(e) => patch({ altNumber: e.target.value })}
              style={{ width: '100%', height: '42px', padding: '0 13px', marginTop: '8px', boxSizing: 'border-box', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dark)', background: 'var(--white)', border: '1.5px solid var(--border-dark)', outline: 'none' }}
            />
          )}
        </div>
      )}
    </div>
  )
}
