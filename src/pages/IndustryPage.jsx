import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowRight, Phone, ShieldCheck } from 'lucide-react'
import ProtoNav from '../prototype/home/components/ProtoNav'
import ProtoFooter from '../prototype/home/components/ProtoFooter'
import { Block } from '../prototype/home/components/contentBlocks'
import { useIsMobile } from '../prototype/home/hooks/useIsMobile'
import { getIndustryBySlug } from '../prototype/home/data/industries.js'
import PageCtaBand from '../components/PageCtaBand'
import scrollToCheck, { hasToolBlock, toolCtaLabel } from '../components/interactive/scrollToCheck'
import '../prototype/prototype.css'

export default function IndustryPage() {
  const { slug } = useParams()
  const isMobile = useIsMobile()
  const ind = getIndustryBySlug(slug)
  // Pages carrying an on-page check lead with it instead of asking for a meeting.
  const hasCheck = hasToolBlock(ind?.body)
  const checkCta = toolCtaLabel(ind?.body)

  useEffect(() => {
    if (!ind) return
    const prevTitle = document.title
    document.title = ind.metaTitle || `${ind.title} Insurance | Insure First`
    let meta = document.querySelector('meta[name="description"]')
    let created = false
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
      created = true
    }
    const prevDesc = meta.getAttribute('content')
    meta.setAttribute('content', ind.metaDescription || ind.tagline)
    return () => {
      document.title = prevTitle
      if (created) meta.remove()
      else if (prevDesc !== null) meta.setAttribute('content', prevDesc)
    }
  }, [ind])

  if (!ind) return <Navigate to="/services" replace />

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111827' }}>
      <ProtoNav />
      <main>
        {/* Hero */}
        <section style={{ position: 'relative', borderBottom: '3px solid var(--teal)', overflow: 'hidden' }}>
          {ind.image && <img src={ind.image} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,27,75,0.8)' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '3rem 0.75rem' : '4.5rem 4rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
                <Link to="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Home</Link>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/</span>
                <span style={{ fontSize: '13px', color: 'var(--teal)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Industries</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.9rem' : 'clamp(2rem, 3.6vw, 3rem)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '1.1rem', maxWidth: '760px' }}>
                {ind.title} Insurance
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '15px' : '17px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: '640px', marginBottom: '1.75rem' }}>
                {ind.tagline}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: ind.badges ? '1.75rem' : 0 }}>
                {hasCheck ? (
                  <button type="button" onClick={scrollToCheck} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px', background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700 }}>
                    {checkCta} <ArrowRight size={15} />
                  </button>
                ) : (
                  <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px', background: 'var(--teal)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                    Book a Free Review <ArrowRight size={15} />
                  </Link>
                )}
                <a href="tel:+971509765976" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.32)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                  <Phone size={15} /> Call Us
                </a>
              </div>
              {ind.badges && (
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {ind.badges.map((b) => (
                    <span key={b} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', padding: '6px 12px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                      <ShieldCheck size={13} color="var(--teal)" /> {b}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Body */}
        <article style={{ background: 'var(--white)', padding: isMobile ? '2.5rem 0' : '4rem 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
            {ind.body.map((block, i) => (
              <Block key={i} block={block} isMobile={isMobile} />
            ))}
          </div>
        </article>

        {/* Recommended cover for this industry */}
        {ind.relatedServices && ind.relatedServices.length > 0 && (
          <section style={{ background: 'var(--light-bg)', padding: isMobile ? '2.5rem 0' : '3.5rem 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>
                Recommended for {ind.title.toLowerCase()}
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', margin: '0 0 1.5rem' }}>
                Cover worth reviewing
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)' }}>
                {ind.relatedServices.map((s) => (
                  <Link key={s.href} to={s.href} style={{ textDecoration: 'none', background: 'var(--white)', display: 'block' }}>
                    <div
                      style={{ padding: isMobile ? '1.1rem' : '1.4rem', borderTop: '3px solid var(--teal)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--light-bg)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--white)' }}
                    >
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: 700, color: 'var(--navy)', margin: 0, lineHeight: 1.3 }}>{s.label}</h3>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--teal-dark)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px' }}>Explore <ArrowRight size={14} /></span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <PageCtaBand
          isMobile={isMobile}
          hasCheck={hasCheck}
          title={`Insurance built for ${ind.title.toLowerCase()}`}
          blurb="Leave your details for a no-obligation review with an independent advisor who understands your sector. Prefer to talk?"
          service={`${ind.title} enquiry`}
          source="industry-page"
        />
      </main>
      <ProtoFooter />
    </div>
  )
}
