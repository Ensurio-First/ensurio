import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams, Navigate } from 'react-router-dom'
import { Clock, ArrowLeft, ArrowRight, Phone } from 'lucide-react'
import ProtoNav from '../prototype/home/components/ProtoNav'
import ProtoFooter from '../prototype/home/components/ProtoFooter'
import { Block } from '../prototype/home/components/contentBlocks'
import { useIsMobile } from '../prototype/home/hooks/useIsMobile'
import { blogPosts, getPostBySlug } from '../prototype/home/data/blog.js'
import { getServiceByRelatedBlog } from '../prototype/home/data/services.js'
import ToolTeaser from '../components/interactive/ToolTeaser'
import '../prototype/prototype.css'

export default function BlogPostPage() {
  const { slug } = useParams()
  const isMobile = useIsMobile()
  const post = getPostBySlug(slug)

  // Only promise a check if the service this article points at actually has one.
  const linkedCheck = Boolean(
    getServiceByRelatedBlog(slug)?.body?.some((b) => b.type === 'gapcheck'),
  )

  // Apply the post's SEO meta title / description while it is mounted, then
  // restore the previous values on unmount.
  useEffect(() => {
    if (!post) return
    const prevTitle = document.title
    document.title = post.metaTitle || `${post.title} | Insure First`

    let meta = document.querySelector('meta[name="description"]')
    let created = false
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
      created = true
    }
    const prevDesc = meta.getAttribute('content')
    meta.setAttribute('content', post.metaDescription || post.excerpt)

    return () => {
      document.title = prevTitle
      if (created) meta.remove()
      else if (prevDesc !== null) meta.setAttribute('content', prevDesc)
    }
  }, [post])

  if (!post) return <Navigate to="/blog" replace />

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111827' }}>
      <ProtoNav />
      <main>
        {/* Hero */}
        <section style={{ position: 'relative', borderBottom: '3px solid var(--teal)', overflow: 'hidden' }}>
          <img src={post.image} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,27,75,0.78)' }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '3rem 0.75rem' : '4.5rem 4rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <Link to="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Home</Link>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/</span>
                <Link to="/blog" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Insights</Link>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/</span>
                <span style={{ fontSize: '13px', color: 'var(--teal)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{post.tag}</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.65rem' : 'clamp(1.9rem, 3.2vw, 2.75rem)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '1.5rem', maxWidth: '900px' }}>
                {post.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{post.author}</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{post.date}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={12} color="rgba(255,255,255,0.6)" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{post.readTime}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Article body */}
        <article style={{ background: 'var(--white)', padding: isMobile ? '2.5rem 0' : '4rem 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
            {post.body.map((block, i) => (
              <Block key={i} block={block} isMobile={isMobile} />
            ))}

            {/* Blog → service hand-off. Where that service carries a check, offer
                the check rather than the service: someone who has just read why
                cargo cover fails is ready to test their own, not to browse. */}
            {post.serviceLink && (
              linkedCheck ? (
                <ToolTeaser
                  isMobile={isMobile}
                  href={post.serviceLink.href}
                  title="You have just read the theory. Now check yours."
                  prompt={`A few questions on your ${post.serviceLink.label.toLowerCase()} — your score shows before you give any details.`}
                />
              ) : (
                <Link to={post.serviceLink.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--teal-pale)', border: '1px solid var(--teal)', padding: isMobile ? '1rem 1.1rem' : '1.15rem 1.5rem', margin: '1.25rem 0 0', textDecoration: 'none', flexWrap: 'wrap' }}>
                  <span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-dark)', marginBottom: '2px' }}>Related service</span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--navy)', fontSize: '1.05rem' }}>{post.serviceLink.label}</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--teal-dark)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap' }}>Explore this service <ArrowRight size={15} /></span>
                </Link>
              )
            )}

            {/* Back link */}
            <div style={{ marginTop: isMobile ? '2rem' : '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: 'var(--teal)', textDecoration: 'none' }}>
                <ArrowLeft size={15} /> Back to all articles
              </Link>
            </div>
          </div>
        </article>

        {/* CTA */}
        <section style={{ background: 'var(--navy)', borderTop: '3px solid var(--teal)', padding: isMobile ? '2.5rem 0' : '3.5rem 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.3rem' : '1.6rem', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                Have a question about your cover?
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(255,255,255,0.65)', margin: 0, maxWidth: '480px', lineHeight: 1.7 }}>
                Book a no-obligation consultation and we will review exactly where your insurance stands today.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flexShrink: 0 }}>
              <Link to="/contact" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '13px 26px', background: 'var(--teal)', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Book a Consultation <ArrowRight size={15} />
              </Link>
              <a href="tel:+971509765976" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '13px 26px', background: 'transparent', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                <Phone size={15} /> Call Us
              </a>
            </div>
          </div>
        </section>

        {/* Related posts */}
        <section style={{ background: 'var(--light-bg)', padding: isMobile ? '3rem 0' : '4.5rem 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
            <div style={{ marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>
                Keep Reading
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', margin: 0 }}>
                Related Insights
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)' }}>
              {related.map((rp) => (
                <Link key={rp.slug} to={`/blog/${rp.slug}`} style={{ textDecoration: 'none' }}>
                  <article
                    style={{ background: 'var(--white)', display: 'flex', flexDirection: 'column', cursor: 'pointer', overflow: 'hidden', height: '100%' }}
                    onMouseEnter={(e) => { const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1.04)' }}
                    onMouseLeave={(e) => { const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1)' }}
                  >
                    <div style={{ overflow: 'hidden', height: isMobile ? '160px' : '180px', flexShrink: 0 }}>
                      <img src={rp.image} alt={rp.imageAlt || rp.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} />
                    </div>
                    <div style={{ padding: isMobile ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, borderTop: '3px solid var(--teal)' }}>
                      <div style={{ display: 'inline-block', alignSelf: 'flex-start', background: 'var(--teal-pale)', color: 'var(--teal-dark)', padding: '4px 10px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-body)', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                        {rp.tag}
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.4, margin: 0 }}>
                        {rp.title}
                      </h3>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <ProtoFooter />
    </div>
  )
}
