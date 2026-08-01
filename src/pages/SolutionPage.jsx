import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowRight, Phone, ShieldCheck } from 'lucide-react'
import ProtoNav from '../prototype/home/components/ProtoNav'
import ProtoFooter from '../prototype/home/components/ProtoFooter'
import { Block } from '../prototype/home/components/contentBlocks'
import { useIsMobile } from '../prototype/home/hooks/useIsMobile'
import { getSolutionBySlug } from '../prototype/home/data/solutions.js'
import PageCtaBand from '../components/PageCtaBand'
import scrollToCheck, { hasToolBlock, toolCtaLabel } from '../components/interactive/scrollToCheck'
import '../prototype/prototype.css'

export default function SolutionPage() {
  const { slug } = useParams()
  const isMobile = useIsMobile()
  const solution = getSolutionBySlug(slug)
  // Pages carrying an on-page check lead with it instead of asking for a meeting.
  const hasCheck = hasToolBlock(solution?.body)
  const checkCta = toolCtaLabel(solution?.body)

  useEffect(() => {
    if (!solution) return
    const prevTitle = document.title
    document.title = solution.metaTitle || `${solution.title} | Insure First`
    let meta = document.querySelector('meta[name="description"]')
    let created = false
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
      created = true
    }
    const prevDesc = meta.getAttribute('content')
    meta.setAttribute('content', solution.metaDescription || solution.tagline)
    return () => {
      document.title = prevTitle
      if (created) meta.remove()
      else if (prevDesc !== null) meta.setAttribute('content', prevDesc)
    }
  }, [solution])

  if (!solution) return <Navigate to="/services" replace />

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111827' }}>
      <ProtoNav />
      <main>
        {/* Hero */}
        <section style={{ position: 'relative', borderBottom: '3px solid var(--teal)', overflow: 'hidden' }}>
          {solution.image && <img src={solution.image} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,27,75,0.82)' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '3rem 0.75rem' : '4.5rem 4rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
                <Link to="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Home</Link>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/</span>
                <Link to="/services#solutions" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Solutions</Link>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/</span>
                <span style={{ fontSize: '13px', color: 'var(--teal)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{solution.title}</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.9rem' : 'clamp(2rem, 3.6vw, 3rem)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '1.1rem', maxWidth: '760px' }}>
                {solution.title}
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '15px' : '17px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: '640px', marginBottom: '1.75rem' }}>
                {solution.tagline}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: solution.badges ? '1.75rem' : 0 }}>
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
              {solution.badges && (
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {solution.badges.map((b) => (
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
            {solution.body.map((block, i) => (
              <Block key={i} block={block} isMobile={isMobile} />
            ))}
          </div>
        </article>

        {/* Pages named for the visitor's situation rather than the service
            cannot have their heading built by string-joining the title —
            "Ready to get started with claim refused or underpaid?" — so those
            supply their own. `serviceName` keeps lead tagging on the internal
            name whatever the public label says. */}
        <PageCtaBand
          isMobile={isMobile}
          hasCheck={hasCheck}
          title={solution.ctaHeading || `Ready to get started with ${solution.title.toLowerCase()}?`}
          blurb="Leave your details for a no-obligation consultation with an independent advisor — we work for you, not the insurer. Prefer to talk?"
          service={solution.serviceName || solution.title}
          source="solution-page"
          heading={solution.ctaFormHeading || `Book ${solution.title}`}
        />
      </main>
      <ProtoFooter />
    </div>
  )
}
