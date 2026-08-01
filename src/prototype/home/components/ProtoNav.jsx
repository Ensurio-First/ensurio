import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useIsMobile } from '../hooks/useIsMobile.js'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import logoImg from '../../../assets/insure-first-logo.svg'
import { socialLinks } from '../data/index.js'
import { serviceCategories, getServicesByCategory } from '../data/services.js'
import { openQuote } from '../../../lib/quote'

/*
 * Insurance Services is a two-level mega menu: each category column links to its
 * hub page, and lists every insurance line underneath it. Built from services.js
 * so adding a line there adds it to the nav automatically.
 */
const INSURANCE_MEGA = serviceCategories.map((cat) => ({
  label: cat.title,
  href: `/insurance-services/${cat.slug}`,
  items: getServicesByCategory(cat.title).map((line) => ({
    label: line.title,
    href: `/insurance/${line.slug}`,
  })),
}))

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  {
    label: 'Who We Help',
    href: '/services#who-we-help',
    dropdown: [
      { label: 'Business Owners', href: '/who-we-help/business-owners' },
      { label: 'Finance Managers', href: '/who-we-help/finance-managers' },
      { label: 'Operations Managers', href: '/who-we-help/operations-managers' },
      { label: 'Individuals & Families', href: '/who-we-help/individuals-families' },
    ],
  },
  {
    label: 'Industries',
    href: '/#industries',
    dropdown: [
      { label: 'Construction', href: '/industries/construction' },
      { label: 'Manufacturing', href: '/industries/manufacturing' },
      { label: 'Logistics', href: '/industries/logistics' },
      { label: 'Hospitality', href: '/industries/hospitality' },
      { label: 'Aviation', href: '/industries/aviation' },
      { label: 'Engineering', href: '/industries/engineering' },
    ],
  },
  {
    label: 'Solutions',
    href: '/services#solutions',
    dropdown: [
      { label: 'Insurance Audit', href: '/solutions/insurance-audit' },
      { label: 'Risk Assessment', href: '/solutions/risk-assessment' },
      { label: 'Policy Review', href: '/solutions/policy-review' },
      // Ordered the way the situation unfolds: you make a claim first, and the
      // second only matters once the first has gone wrong.
      { label: 'Making a Claim', href: '/solutions/claims-advisory' },
      { label: 'Claim Refused or Underpaid', href: '/solutions/legal-claims-support' },
      { label: 'Coverage Gap Analysis', href: '/solutions/coverage-gap-analysis' },
    ],
  },
  {
    label: 'Insurance Services',
    href: '/services#insurance-services',
    mega: INSURANCE_MEGA,
  },
  // The most-clicked claims entry now lands on the stage router, which opens by
  // asking where the visitor is and routes them — including handing declined
  // claims to the disputes page. It used to drop them on a services anchor.
  { label: 'Claims Support', href: '/solutions/claims-advisory' },
  {
    label: 'Consultancy',
    href: '/risk-management',
    dropdown: [
      { label: 'Risk Management Consultancy', href: '/risk-management' },
      { label: 'Management Consultancy', href: '/management-consultancy' },
    ],
  },
  { label: 'Insights', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
]

export default function ProtoNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [mobileExpanded, setMobileExpanded] = useState(null)
  const [mobileSubExpanded, setMobileSubExpanded] = useState(null)
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const megaLink = NAV_LINKS.find((l) => l.mega)

  return (
    <>
      {/* ── Top bar — hidden on mobile ── */}
      {!isMobile && (
        <div className="no-print" style={{ background: 'var(--white)', padding: '7px 0', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <span>www.insurefirst.ae is powered by Fredrick Insurance Consultant licensed by CBUAE — LICENSE 143</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {socialLinks.map(({ label, href, path }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Insure First on ${label}`}
                  title={label}
                  style={{
                    width: '22px',
                    height: '22px',
                    background: 'var(--light-bg)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-mid)',
                    flexShrink: 0,
                    transition: 'color 0.15s, border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--teal)'
                    e.currentTarget.style.borderColor = 'var(--teal)'
                    e.currentTarget.style.background = 'var(--teal-pale)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-mid)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.background = 'var(--light-bg)'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Logo / contact bar ── */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px', gap: '2rem' }}>

          {/* Logo + legal entity name */}
          <Link to="/" style={{ flexShrink: 0, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
            <img src={logoImg} alt="Insure First" style={{ height: isMobile ? '32px' : '44px', width: 'auto', display: 'block' }} />
            <span style={{ borderLeft: '1px solid var(--border)', paddingLeft: isMobile ? '8px' : '12px', fontFamily: 'var(--font-body)', fontSize: isMobile ? '10px' : '12px', fontWeight: 600, lineHeight: 1.3, color: 'var(--navy)', letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
              Ensurio First<br />RMC FZC
            </span>
          </Link>

          {/* Contact info — hidden below the desktop breakpoint (see prototype.css) */}
          <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'nowrap', alignItems: 'center' }} className="proto-contact-bar">
            {[
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square"><rect x="2" y="4" width="20" height="16"/><polyline points="2,4 12,13 22,4"/></svg>, label: 'Email Address', value: 'consult@insurefirst.ae', href: 'mailto:consult@insurefirst.ae' },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 014 6a2 2 0 012-2z"/></svg>, label: 'Phone Number', value: '0509765976', href: 'tel:+971509765976' },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>, label: 'Our Location', value: 'Dubai, U.A.E', href: '#' },
            ].map(({ icon, label, value, href }) => (
              <a key={label} href={href} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)', flexShrink: 0 }}>
                  {icon}
                </div>
                <div style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--navy)' }}>{value}</div>
                </div>
              </a>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => openQuote({ service: 'Quote request', source: 'nav-quote', heading: 'Get a quote' })}
            style={{ flexShrink: 0, background: 'var(--teal)', color: 'var(--white)', padding: '12px 24px', fontSize: '13.5px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '0.01em', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--teal-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--teal)'}
            className="proto-quote-btn"
          >
            Get A Quote
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'none', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}
            className="proto-hamburger"
            aria-label="Toggle menu"
          >
            <motion.span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--navy)', transformOrigin: 'center' }} animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.22 }} />
            <motion.span style={{ display: 'block', width: '16px', height: '2px', background: 'var(--navy)' }} animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.18 }} />
            <motion.span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--navy)', transformOrigin: 'center' }} animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.22 }} />
          </button>
        </div>
      </div>

      {/* ── Main nav bar ── */}
      <nav style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(13,27,75,0.06)' }}>
        {/* The container owns the close-on-leave so the full-width mega panel — which
            lives outside its trigger item — stays open while the pointer is inside it. */}
        <div
          style={{ position: 'relative', maxWidth: '1280px', margin: '0 auto', padding: '0 4rem', display: 'flex', alignItems: 'center', height: '48px', gap: '0' }}
          className="proto-nav-desktop"
          onMouseLeave={() => setActiveDropdown(null)}
        >
          {NAV_LINKS.map((link) =>
            link.dropdown || link.mega ? (
              <div
                key={link.label}
                style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
                onMouseEnter={() => setActiveDropdown(link.label)}
              >
                <button
                  onClick={() => navigate(link.href)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '0 14px', height: '100%',
                    fontSize: '13.5px', fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    color: activeDropdown === link.label ? 'var(--teal)' : 'var(--navy)',
                    borderBottom: activeDropdown === link.label ? '2px solid var(--teal)' : '2px solid transparent',
                    transition: 'color 0.15s',
                    letterSpacing: '0.01em',
                  }}
                >
                  {link.label}
                  <ChevronDown size={13} style={{ transition: 'transform 0.2s', transform: activeDropdown === link.label ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>

                <AnimatePresence>
                  {link.dropdown && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', top: '100%', left: 0,
                        minWidth: '220px', background: 'var(--white)',
                        borderTop: '3px solid var(--teal)',
                        boxShadow: '0 8px 32px rgba(13,27,75,0.18)',
                        zIndex: 200, paddingTop: '4px', paddingBottom: '4px',
                      }}
                    >
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => setActiveDropdown(null)}
                          style={{ display: 'block', padding: '10px 18px', fontSize: '13px', fontWeight: 500, color: 'var(--navy)', textDecoration: 'none', fontFamily: 'var(--font-body)', transition: 'all 0.12s', borderLeft: '3px solid transparent' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--teal)'; e.currentTarget.style.borderLeftColor = 'var(--teal)'; e.currentTarget.style.background = 'var(--teal-pale)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--navy)'; e.currentTarget.style.borderLeftColor = 'transparent'; e.currentTarget.style.background = 'transparent' }}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                style={{
                  display: 'flex', alignItems: 'center', height: '100%',
                  padding: '0 14px', fontSize: '13.5px', fontWeight: 600,
                  color: 'var(--navy)', textDecoration: 'none',
                  fontFamily: 'var(--font-body)', letterSpacing: '0.01em',
                  borderBottom: '2px solid transparent', transition: 'color 0.15s',
                }}
                onMouseEnter={e => { setActiveDropdown(null); e.currentTarget.style.color = 'var(--teal)'; e.currentTarget.style.borderBottomColor = 'var(--teal)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--navy)'; e.currentTarget.style.borderBottomColor = 'transparent' }}
              >
                {link.label}
              </Link>
            )
          )}

          {/* Full-width mega panel — one column per insurance category */}
          <AnimatePresence>
            {megaLink && activeDropdown === megaLink.label && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: 'var(--white)',
                  borderTop: '3px solid var(--teal)',
                  boxShadow: '0 8px 32px rgba(13,27,75,0.18)',
                  zIndex: 200,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${megaLink.mega.length}, 1fr)`, gap: '1px', background: 'var(--border)', padding: '1px 0 0' }}>
                  {megaLink.mega.map((col) => (
                    <div key={col.label} style={{ background: 'var(--white)', padding: '1.4rem 1.5rem 1.5rem' }}>
                      <Link
                        to={col.href}
                        onClick={() => setActiveDropdown(null)}
                        style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 800, color: 'var(--navy)', textDecoration: 'none', letterSpacing: '-0.01em', paddingBottom: '0.6rem', marginBottom: '0.7rem', borderBottom: '2px solid var(--teal)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--teal)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--navy)' }}
                      >
                        {col.label}
                      </Link>
                      {col.items.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setActiveDropdown(null)}
                          style={{ display: 'block', padding: '6px 0 6px 10px', fontSize: '13px', fontWeight: 500, lineHeight: 1.4, color: 'var(--text-mid)', textDecoration: 'none', fontFamily: 'var(--font-body)', borderLeft: '2px solid transparent', transition: 'color 0.12s, border-color 0.12s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--teal)'; e.currentTarget.style.borderLeftColor = 'var(--teal)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-mid)'; e.currentTarget.style.borderLeftColor = 'transparent' }}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--light-bg)', borderTop: '1px solid var(--border)', padding: '0.7rem 1.5rem' }}>
                  <Link
                    to={megaLink.href}
                    onClick={() => setActiveDropdown(null)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--teal-dark)', textDecoration: 'none' }}
                  >
                    View all insurance services →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden', background: 'var(--white)', borderTop: '1px solid var(--border)' }}
              className="proto-mobile-menu"
            >
              <div style={{ padding: '0.75rem 4rem 1rem' }}>
                {NAV_LINKS.map((link) =>
                  link.mega ? (
                    /* Two-level accordion: category → its insurance lines */
                    <div key={link.label}>
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === link.label ? null : link.label)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', fontSize: '14px', fontWeight: 600, color: 'var(--navy)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-body)' }}
                      >
                        {link.label}
                        <ChevronDown size={14} style={{ transform: mobileExpanded === link.label ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                      </button>
                      <AnimatePresence>
                        {mobileExpanded === link.label && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                            {link.mega.map((col) => (
                              <div key={col.label}>
                                <button
                                  onClick={() => setMobileSubExpanded(mobileSubExpanded === col.label ? null : col.label)}
                                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', fontSize: '13.5px', fontWeight: 600, color: mobileSubExpanded === col.label ? 'var(--teal)' : 'var(--navy)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-body)', textAlign: 'left' }}
                                >
                                  {col.label}
                                  <ChevronDown size={13} style={{ flexShrink: 0, transform: mobileSubExpanded === col.label ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                </button>
                                <AnimatePresence>
                                  {mobileSubExpanded === col.label && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden', background: 'var(--light-bg)' }}>
                                      <Link to={col.href} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '9px 28px', fontSize: '12.5px', fontWeight: 700, color: 'var(--teal-dark)', textDecoration: 'none', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-body)' }}>
                                        All {col.label}
                                      </Link>
                                      {col.items.map((item) => (
                                        <Link key={item.href} to={item.href} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '9px 28px', fontSize: '12.5px', color: 'var(--text-muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-body)' }}>
                                          {item.label}
                                        </Link>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : link.dropdown ? (
                    <div key={link.label}>
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === link.label ? null : link.label)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', fontSize: '14px', fontWeight: 600, color: 'var(--navy)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-body)' }}
                      >
                        {link.label}
                        <ChevronDown size={14} style={{ transform: mobileExpanded === link.label ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                      </button>
                      <AnimatePresence>
                        {mobileExpanded === link.label && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                            {link.dropdown.map((item) => (
                              <Link key={item.label} to={item.href} style={{ display: 'block', padding: '10px 16px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-body)' }}
                                onClick={() => setMenuOpen(false)}
                              >
                                {item.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link key={link.label} to={link.href} style={{ display: 'block', padding: '12px 0', fontSize: '14px', fontWeight: 600, color: 'var(--navy)', textDecoration: 'none', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-body)' }}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )
                )}
                <button onClick={() => { setMenuOpen(false); openQuote({ service: 'Quote request', source: 'nav-quote', heading: 'Get a quote' }) }} style={{ display: 'block', width: '100%', marginTop: '1rem', background: 'var(--teal)', color: 'var(--white)', padding: '13px', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
                  Get A Quote
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
