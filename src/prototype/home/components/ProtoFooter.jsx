import { Link } from 'react-router-dom'
import logoImg from '../../../assets/insure-first-logo.svg'
import { socialLinks } from '../data/index.js'
import { useIsMobile } from '../hooks/useIsMobile.js'

/*
 * Every one of these was href="#" — the whole footer looked like navigation and
 * went nowhere. Each label now points at the page that actually exists, and the
 * hash targets are real ids (ScrollToTop honours them across route changes).
 */
const footerLinks = {
  Solutions: [
    { label: 'Insurance Audit', href: '/solutions/insurance-audit' },
    { label: 'Risk Assessment', href: '/solutions/risk-assessment' },
    { label: 'Policy Review', href: '/solutions/policy-review' },
    { label: 'Making a Claim', href: '/solutions/claims-advisory' },
    { label: 'Claim Refused or Underpaid', href: '/solutions/legal-claims-support' },
    { label: 'Coverage Gap Analysis', href: '/solutions/coverage-gap-analysis' },
  ],
  'Insurance Services': [
    { label: 'Business Insurance', href: '/insurance-services/business' },
    { label: 'Specialist Insurance', href: '/insurance-services/specialist' },
    { label: 'Professional Protection', href: '/insurance-services/professional' },
    { label: 'Personal Insurance', href: '/insurance-services/personal' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Founder', href: '/#founder' },
    { label: 'Who We Help', href: '/services#who-we-help' },
    { label: 'Industries We Serve', href: '/#industries' },
    { label: 'Insights', href: '/blog' },
    { label: 'Contact', href: '/contact' },
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

            {/* Social accounts */}
            <div style={{ display: 'flex', gap: '0.625rem', marginTop: isMobile ? '1rem' : '1.5rem' }}>
              {socialLinks.map(({ label, href, path }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Insure First on ${label}`}
                  title={label}
                  style={{
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.18)',
                    color: 'rgba(255,255,255,0.65)',
                    borderRadius: 0,
                    flexShrink: 0,
                    transition: 'color 0.15s, border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--teal)'
                    e.currentTarget.style.borderColor = 'var(--teal)'
                    e.currentTarget.style.background = 'rgba(0,184,153,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--teal)', marginBottom: isMobile ? '0.75rem' : '1.25rem' }}>
                {heading}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {links.map(({ label, href }) => (
                  <li key={label} style={{ marginBottom: isMobile ? '0.45rem' : '0.6rem' }}>
                    <Link
                      to={href}
                      style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '13px' : '14px', color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--teal)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
                    >
                      {label}
                    </Link>
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
