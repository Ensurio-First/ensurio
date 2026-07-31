import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowRight, Phone, ShieldCheck } from 'lucide-react'
import ProtoNav from '../prototype/home/components/ProtoNav'
import ProtoFooter from '../prototype/home/components/ProtoFooter'
import { Block } from '../prototype/home/components/contentBlocks'
import { useIsMobile } from '../prototype/home/hooks/useIsMobile'
import { getServiceBySlug } from '../prototype/home/data/services.js'
import { getPostBySlug } from '../prototype/home/data/blog.js'
import InlineLeadForm from '../components/InlineLeadForm'
import '../prototype/prototype.css'

export default function ServicePage() {
  const { slug } = useParams()
  const isMobile = useIsMobile()
  const service = getServiceBySlug(slug)

  useEffect(() => {
    if (!service) return
    const prevTitle = document.title
    document.title = service.metaTitle || `${service.title} | Insure First`
    let meta = document.querySelector('meta[name="description"]')
    let created = false
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
      created = true
    }
    const prevDesc = meta.getAttribute('content')
    meta.setAttribute('content', service.metaDescription || service.tagline)
    return () => {
      document.title = prevTitle
      if (created) meta.remove()
      else if (prevDesc !== null) meta.setAttribute('content', prevDesc)
    }
  }, [service])

  if (!service) return <Navigate to="/services" replace />

  const relatedPost = service.relatedBlog ? getPostBySlug(service.relatedBlog) : null

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111827' }}>
      <ProtoNav />
      <main>
        {/* Hero */}
        <section style={{ position: 'relative', borderBottom: '3px solid var(--teal)', overflow: 'hidden' }}>
          {service.image && <img src={service.image} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,27,75,0.8)' }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '3rem 0.75rem' : '4.5rem 4rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
                <Link to="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Home</Link>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/</span>
                <Link to="/services#insurance-services" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Insurance Services</Link>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/</span>
                <span style={{ fontSize: '13px', color: 'var(--teal)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{service.category}</span>
              </div>

              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.9rem' : 'clamp(2rem, 3.6vw, 3rem)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '1.1rem', maxWidth: '820px' }}>
                {service.title}
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '15px' : '17px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: '620px', marginBottom: '1.75rem' }}>
                {service.tagline}
              </p>

              {/* Primary CTAs */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: service.badges ? '1.75rem' : 0 }}>
                <Link to={`/contact?service=${encodeURIComponent(service.title)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px', background: 'var(--teal)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                  Get a Quote <ArrowRight size={15} />
                </Link>
                <a href="tel:+971509765976" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.32)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                  <Phone size={15} /> Call Us
                </a>
              </div>

              {/* Trust badges */}
              {service.badges && (
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {service.badges.map((b) => (
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
            {service.body.map((block, i) => (
              <Block key={i} block={block} isMobile={isMobile} />
            ))}
          </div>
        </article>

        {/* Related blog — closes the service → blog funnel */}
        {relatedPost && (
          <section style={{ background: 'var(--light-bg)', padding: isMobile ? '2.5rem 0' : '3.5rem 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '1rem' }}>
                From our blog
              </p>
              <Link to={`/blog/${relatedPost.slug}`} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', background: 'var(--white)', border: '1px solid var(--border)', borderTop: '3px solid var(--teal)', textDecoration: 'none', overflow: 'hidden' }}>
                <div style={{ overflow: 'hidden', minHeight: isMobile ? '160px' : 'auto', position: 'relative' }}>
                  <img src={relatedPost.image} alt={relatedPost.imageAlt || relatedPost.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: isMobile ? '1.25rem' : '1.75rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-dark)', marginBottom: '0.5rem' }}>{relatedPost.tag} · {relatedPost.readTime}</span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: '0.6rem' }}>{relatedPost.title}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>{relatedPost.excerpt}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--teal-dark)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '14px' }}>Read the full guide <ArrowRight size={15} /></span>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Final CTA with inline form */}
        <section style={{ background: 'var(--navy)', borderTop: '3px solid var(--teal)', padding: isMobile ? '2.75rem 0' : '4rem 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.05fr 0.95fr', gap: isMobile ? '1.75rem' : '3rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
                Ready to get {service.title.replace(' Insurance', '')} cover right?
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'rgba(255,255,255,0.66)', lineHeight: 1.7, maxWidth: '460px', marginBottom: '1.5rem' }}>
                Leave your details for a no-obligation review with an independent advisor — we work for you, not the insurer. Prefer to talk?
              </p>
              <a href="tel:+971509765976" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--teal)', fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>
                <Phone size={16} /> Call 050 976 5976
              </a>
            </div>
            <InlineLeadForm service={service.title} source="service-page" heading="Request a quote" cta="Request a Callback" />
          </div>
        </section>
      </main>
      <ProtoFooter />
    </div>
  )
}
