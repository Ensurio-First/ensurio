import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { insights } from '../data/index.js'
import { useIsMobile } from '../hooks/useIsMobile.js'
import blogDubai    from '../../../assets/blog-dubai.jpg'
import blogSigning  from '../../../assets/blog-signing.jpg'
import blogBusiness from '../../../assets/blog-business.jpg'

const blogImages = [blogDubai, blogSigning, blogBusiness]

export default function ProtoInsights() {
  const isMobile = useIsMobile()

  return (
    <section id="insights" style={{ background: 'var(--light-bg)', padding: isMobile ? '3rem 0' : '5rem 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: isMobile ? '1.5rem' : '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>
              Latest Insights
            </p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', margin: 0 }}>
              From Our Blog
            </h2>
          </div>
          <a href="#" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--teal)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            View All Insights →
          </a>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)' }}>
          {insights.map((article, i) => (
            <motion.article
              key={article.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{ background: 'var(--white)', display: 'flex', flexDirection: 'column', cursor: 'pointer', overflow: 'hidden' }}
              onMouseEnter={e => e.currentTarget.querySelector('img').style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.querySelector('img').style.transform = 'scale(1)'}
            >
              {/* Image */}
              <div style={{ overflow: 'hidden', height: isMobile ? '180px' : '200px', flexShrink: 0 }}>
                <img
                  src={blogImages[i]}
                  alt={article.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', transition: 'transform 0.4s ease' }}
                />
              </div>

              {/* Content */}
              <div style={{ padding: isMobile ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, borderTop: '3px solid var(--teal)' }}>
                {/* Tag — hidden on mobile */}
                {!isMobile && (
                  <div style={{ display: 'inline-block', alignSelf: 'flex-start', background: 'var(--teal-pale)', color: 'var(--teal-dark)', padding: '4px 10px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-body)', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
                    {article.tag}
                  </div>
                )}

                {/* Title */}
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: isMobile ? '0' : '0.6rem', lineHeight: 1.4, flex: isMobile ? 0 : 1 }}>
                  {article.title}
                </h3>

                {/* Excerpt — hidden on mobile */}
                {!isMobile && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                    {article.excerpt}
                  </p>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)', marginTop: isMobile ? '0.75rem' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>{article.date}</span>
                    {!isMobile && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} color="var(--text-muted)" />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>{article.readTime}</span>
                      </div>
                    )}
                  </div>
                  <a href="#" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--teal)', textDecoration: 'none' }}>
                    Read More →
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  )
}
