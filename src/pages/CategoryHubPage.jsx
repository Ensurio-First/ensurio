import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowRight, Phone } from 'lucide-react'
import ProtoNav from '../prototype/home/components/ProtoNav'
import ProtoFooter from '../prototype/home/components/ProtoFooter'
import { useIsMobile } from '../prototype/home/hooks/useIsMobile'
import { getCategoryBySlug, getServicesByCategory } from '../prototype/home/data/services.js'
import '../prototype/prototype.css'

export default function CategoryHubPage() {
  const { category } = useParams()
  const isMobile = useIsMobile()
  const cat = getCategoryBySlug(category)

  useEffect(() => {
    if (!cat) return
    const prevTitle = document.title
    document.title = `${cat.title} | Insure First`
    let meta = document.querySelector('meta[name="description"]')
    let created = false
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
      created = true
    }
    const prevDesc = meta.getAttribute('content')
    meta.setAttribute('content', cat.intro)
    return () => {
      document.title = prevTitle
      if (created) meta.remove()
      else if (prevDesc !== null) meta.setAttribute('content', prevDesc)
    }
  }, [cat])

  if (!cat) return <Navigate to="/services" replace />

  const lines = getServicesByCategory(cat.title)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111827' }}>
      <ProtoNav />
      <main>
        {/* Hero */}
        <section style={{ position: 'relative', borderBottom: '3px solid var(--teal)', overflow: 'hidden' }}>
          <img src={cat.image} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,27,75,0.8)' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '3rem 0.75rem' : '4.5rem 4rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
                <Link to="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Home</Link>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/</span>
                <span style={{ fontSize: '13px', color: 'var(--teal)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Insurance Services</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.9rem' : 'clamp(2rem, 3.6vw, 3rem)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '1.1rem', maxWidth: '760px' }}>
                {cat.title}
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '15px' : '17px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: '620px', marginBottom: '1.75rem' }}>
                {cat.tagline}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px', background: 'var(--teal)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                  Get a Quote <ArrowRight size={15} />
                </Link>
                <a href="tel:+971509765976" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.32)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                  <Phone size={15} /> Call Us
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Intro + line grid */}
        <section style={{ background: 'var(--white)', padding: isMobile ? '2.5rem 0' : '4rem 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '15px' : '16.5px', color: 'var(--text-dark)', lineHeight: 1.85, maxWidth: '760px', marginBottom: isMobile ? '2rem' : '2.5rem' }}>
              {cat.intro}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1px', background: 'var(--border)' }}>
              {lines.map((line) => (
                <Link key={line.slug} to={`/insurance/${line.slug}`} style={{ textDecoration: 'none', background: 'var(--white)', display: 'block' }}>
                  <div
                    style={{ padding: isMobile ? '1.5rem' : '1.85rem 2rem', borderTop: '3px solid var(--teal)', height: '100%', display: 'flex', flexDirection: 'column', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--light-bg)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--white)' }}
                  >
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.15rem' : '1.3rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                      {line.title}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1.1rem', flex: 1 }}>
                      {line.tagline}
                    </p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--teal-dark)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13.5px' }}>
                      Explore this cover <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Other categories */}
        <section style={{ background: 'var(--light-bg)', padding: isMobile ? '2.5rem 0' : '3.5rem 0', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '1rem' }}>
              Explore other categories
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {[
                { slug: 'business', title: 'Business Insurance' },
                { slug: 'specialist', title: 'Specialist Insurance' },
                { slug: 'professional', title: 'Professional Protection' },
                { slug: 'personal', title: 'Personal Insurance' },
              ].filter((c) => c.slug !== cat.slug).map((c) => (
                <Link key={c.slug} to={`/insurance-services/${c.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-dark)', background: 'var(--white)', color: 'var(--navy)', fontFamily: 'var(--font-body)', fontSize: '13.5px', fontWeight: 600, padding: '9px 16px', textDecoration: 'none' }}>
                  {c.title} <ArrowRight size={14} color="var(--teal)" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ background: 'var(--navy)', borderTop: '3px solid var(--teal)', padding: isMobile ? '2.75rem 0' : '3.75rem 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Not sure which cover you need?
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'rgba(255,255,255,0.66)', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto 1.75rem' }}>
              Book a no-obligation review with an independent advisor — we work for you, not the insurer.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'var(--teal)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                Book a Free Review <ArrowRight size={15} />
              </Link>
              <a href="tel:+971509765976" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                <Phone size={15} /> Call an Advisor
              </a>
            </div>
          </div>
        </section>
      </main>
      <ProtoFooter />
    </div>
  )
}
