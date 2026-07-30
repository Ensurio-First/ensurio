import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight } from 'lucide-react'
import ProtoNav from '../prototype/home/components/ProtoNav'
import ProtoFooter from '../prototype/home/components/ProtoFooter'
import { useIsMobile } from '../prototype/home/hooks/useIsMobile'
import { blogPosts } from '../prototype/home/data/blog.js'
import '../prototype/prototype.css'

function PageHero({ isMobile, featured }) {
  return (
    <section style={{ position: 'relative', borderBottom: '3px solid var(--teal)', overflow: 'hidden' }}>
      <img
        src={featured.image}
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,27,75,0.72)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(14,164,114,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(14,164,114,0.04) 1px,transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '3rem 0.75rem' : '4.5rem 4rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Link to="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Home</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/</span>
            <span style={{ fontSize: '13px', color: 'var(--teal)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Insights</span>
          </div>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.75rem' }}>
            Insights & Resources
          </p>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.75rem' : 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', maxWidth: '700px', marginBottom: '1.25rem', lineHeight: 1.2 }}>
            From Our Blog
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '14px' : '16px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8, maxWidth: '560px' }}>
            Practical guidance on insurance, risk, and claims for UAE businesses — from our licensed advisory team, to help you protect what you have built.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function FeaturedPost({ isMobile, post }) {
  return (
    <section style={{ background: 'var(--white)', padding: isMobile ? '2.5rem 0 0' : '4rem 0 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
        <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr', background: 'var(--light-bg)', borderTop: '3px solid var(--teal)', overflow: 'hidden', cursor: 'pointer' }}
            onMouseEnter={(e) => { const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1.04)' }}
            onMouseLeave={(e) => { const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1)' }}
          >
            <div style={{ overflow: 'hidden', minHeight: isMobile ? '220px' : '340px', position: 'relative' }}>
              <img src={post.image} alt={post.imageAlt || post.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} />
            </div>
            <div style={{ padding: isMobile ? '1.5rem' : '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ background: 'var(--teal)', color: 'var(--white)', padding: '4px 10px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-body)', letterSpacing: '0.08em' }}>
                  Featured
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-dark)' }}>{post.tag}</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.35rem' : '1.9rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: '1rem' }}>
                {post.title}
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '14px' : '15px', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                {post.excerpt}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>{post.date}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} color="var(--text-muted)" />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>{post.readTime}</span>
                  </div>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--teal)' }}>
                  Read Article <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </motion.article>
        </Link>
      </div>
    </section>
  )
}

function PostGrid({ isMobile, posts }) {
  return (
    <section style={{ background: 'var(--white)', padding: isMobile ? '2rem 0 3rem' : '3rem 0 5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
        <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>
            All Articles
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', margin: 0 }}>
            More From the Blog
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)' }}>
          {posts.map((post, i) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <motion.article
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08 }}
                style={{ background: 'var(--white)', display: 'flex', flexDirection: 'column', cursor: 'pointer', overflow: 'hidden', height: '100%' }}
                onMouseEnter={(e) => { const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1.04)' }}
                onMouseLeave={(e) => { const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1)' }}
              >
                <div style={{ overflow: 'hidden', height: isMobile ? '180px' : '200px', flexShrink: 0 }}>
                  <img src={post.image} alt={post.imageAlt || post.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', transition: 'transform 0.4s ease' }} />
                </div>

                <div style={{ padding: isMobile ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, borderTop: '3px solid var(--teal)' }}>
                  <div style={{ display: 'inline-block', alignSelf: 'flex-start', background: 'var(--teal-pale)', color: 'var(--teal-dark)', padding: '4px 10px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-body)', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
                    {post.tag}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.6rem', lineHeight: 1.4 }}>
                    {post.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem', flex: 1 }}>
                    {post.excerpt}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>{post.date}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} color="var(--text-muted)" />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>{post.readTime}</span>
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--teal)' }}>
                      Read More →
                    </span>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function BlogPage() {
  const isMobile = useIsMobile()
  const [featured, ...rest] = blogPosts

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111827' }}>
      <ProtoNav />
      <main>
        <PageHero isMobile={isMobile} featured={featured} />
        <FeaturedPost isMobile={isMobile} post={featured} />
        <PostGrid isMobile={isMobile} posts={rest} />
      </main>
      <ProtoFooter />
    </div>
  )
}
