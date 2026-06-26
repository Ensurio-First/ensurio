import logoImg from '../../../assets/insure-first-logo.svg'
import { useIsMobile } from '../hooks/useIsMobile.js'

const footerLinks = {
  Solutions: [
    'Insurance Audit',
    'Risk Assessment',
    'Policy Review',
    'Claims Advisory',
    'Legal Claims Support',
    'Coverage Gap Analysis',
  ],
  'Insurance Services': [
    'Business Insurance',
    'Specialist Insurance',
    'Professional Protection',
    'Personal Insurance',
  ],
  Company: [
    'About Us',
    'Our Founder',
    'How We Work',
    'Industries We Serve',
    'Insights',
    'Contact',
  ],
}

export default function ProtoFooter() {
  const isMobile = useIsMobile()

  return (
    <footer style={{ background: 'var(--navy)', borderTop: '3px solid var(--teal)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '2.5rem 0.75rem' : '3rem 4rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1.5fr 1fr 1fr 1fr',
          gap: '2.5rem',
        }}>
          {/* Logo + description column — spans 2 cols on mobile */}
          <div style={{ gridColumn: isMobile ? 'span 2' : 'span 1' }}>
            <div style={{ marginBottom: '1rem' }}>
              <img src={logoImg} alt="Insure First" style={{ height: isMobile ? '28px' : '40px', width: 'auto', display: 'block' }} />
            </div>
            {!isMobile && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '260px' }}>
                Independent insurance consultancy providing expert advisory, risk audits, policy reviews, and claims support across the UAE.
              </p>
            )}
            {isMobile && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>
                Independent insurance consultancy. CBUAE Licensed.
              </p>
            )}
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--teal)', marginBottom: isMobile ? '0.75rem' : '1.25rem' }}>
                {heading}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {links.map((link) => (
                  <li key={link} style={{ marginBottom: isMobile ? '0.45rem' : '0.6rem' }}>
                    <a
                      href="#"
                      style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '13px' : '14px', color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--teal)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* License bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: isMobile ? '0.875rem 0.75rem' : '0.875rem 4rem',
        textAlign: 'center',
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          www.insurefirst.ae is powered by Fredrick Insurance Consultant licensed by CBUAE — LICENSE 143
        </p>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: isMobile ? '1rem 0.75rem' : '1.25rem 4rem',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: isMobile ? 'center' : 'left',
        gap: '0.5rem',
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          © {new Date().getFullYear()} Insure First. All rights reserved.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          CBUAE Licensed · License 143
        </p>
      </div>
    </footer>
  )
}
