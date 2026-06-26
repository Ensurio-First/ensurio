import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { testimonials } from '../data/index.js'
import { useIsMobile } from '../hooks/useIsMobile.js'

export default function ProtoTestimonials() {
  const isMobile = useIsMobile()

  return (
    <section style={{ background: 'var(--light-bg)', padding: isMobile ? '3rem 0' : '5rem 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
        {/* Header */}
        <div style={{ textAlign: isMobile ? 'left' : 'center', marginBottom: isMobile ? '1.5rem' : '3rem' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.75rem' }}>
            Client Results
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>
            What Our Clients Say
          </h2>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)' }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ background: 'var(--teal-pale)' }}
              style={{
                background: 'var(--white)',
                padding: isMobile ? '1.25rem' : '1.75rem',
                borderRadius: 0,
                borderTop: '3px solid var(--teal)',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'default',
              }}
            >
              {/* Stars — hidden on mobile to save space */}
              {!isMobile && (
                <div style={{ display: 'flex', gap: '3px', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
              )}

              {/* Quote icon */}
              <Quote size={24} color="var(--border)" style={{ marginBottom: '0.75rem' }} />

              {/* Quote text */}
              <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '13px' : '14px', color: 'var(--text-dark)', lineHeight: 1.7, fontStyle: 'italic', flex: 1, marginBottom: isMobile ? '1rem' : '1.5rem' }}>
                "{t.quote}"
              </p>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'var(--navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--teal)',
                  flexShrink: 0,
                  borderRadius: 0,
                  fontFamily: 'var(--font-heading)',
                }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>
                    {t.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
