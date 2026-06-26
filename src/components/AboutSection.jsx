import { motion } from 'framer-motion'
import { useWindowWidth } from '../hooks/useWindowWidth'

const TIMELINE = [
  { year: 'Founded', text: 'Established as Insure First Consultancy — built on trust, precise advisory, and unyielding client dedication.' },
  { year: 'Growth', text: 'Expanded client base across the GCC, protecting over 500 corporates and optimising $40M+ in insurance premiums.' },
  { year: 'Today', text: 'Operating as Ensurio First Risk Management Consultancies — a premier multi-disciplinary advisory firm for the region.' },
]

const STATS = [
  { num: '15+', label: 'Years of trusted advisory' },
  { num: '500+', label: 'Corporate clients protected' },
  { num: '$40M+', label: 'Premiums optimised' },
  { num: '98%', label: 'Client retention rate' },
]

export default function AboutSection({ image, imagePosition = 'right' }) {
  const width = useWindowWidth()
  const isDesktop = width > 960
  const imgRight = imagePosition === 'right'

  return (
    <section id="about" style={{ background: 'var(--white)', overflow: 'hidden' }}>

      {/* ── Main story row ── */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: image && isDesktop ? '1fr 1fr' : '1fr',
        minHeight: isDesktop ? '460px' : 'auto',
      }}>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: imgRight ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            padding: isDesktop ? '4rem 3.5rem' : '2.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            order: (image && isDesktop) ? (imgRight ? 0 : 1) : 0,
          }}
        >
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, marginBottom: '0.75rem' }}>
            Our Story
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
            From Insure First<br />to Ensurio First.
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1rem', maxWidth: '480px' }}>
            Founded as Insure First Consultancy, we built our reputation on a foundation of trust, precise advisory,
            and unyielding client dedication. As the business landscape transformed, so did we.
          </p>
          <blockquote style={{ borderLeft: '3px solid var(--teal)', paddingLeft: '1.25rem', margin: '0 0 2rem', fontStyle: 'italic', fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.75 }}>
            "By blending our deep-rooted heritage in corporate protection with cutting-edge Risk Management
            and Management Consultancy capabilities, we provide businesses with a 360-degree shield."
          </blockquote>

          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
                style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
              >
                <div style={{ flexShrink: 0, paddingTop: '4px' }}>
                  <div style={{ width: '8px', height: '8px', background: 'var(--teal)' }} />
                  {i < TIMELINE.length - 1 && (
                    <div style={{ width: '1px', height: '32px', background: 'var(--border)', margin: '4px 0 0 3.5px' }} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>{item.year}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{item.text}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Image — only shown on desktop */}
        {image && isDesktop && (
          <motion.div
            initial={{ opacity: 0, x: imgRight ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ position: 'relative', overflow: 'hidden', order: imgRight ? 1 : 0 }}
          >
            <img
              src={image}
              alt="Ensurio First advisors"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: imgRight
                ? 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)'
                : 'linear-gradient(to left, rgba(255,255,255,0.1), transparent)',
            }} />
          </motion.div>
        )}
      </div>

      {/* ── Stats strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ background: 'var(--navy)', borderTop: '3px solid var(--teal)' }}
      >
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
          gap: '1px', background: 'rgba(255,255,255,0.06)',
        }}>
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.num}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              style={{ padding: isDesktop ? '2rem 1.5rem' : '1.5rem 1rem', textAlign: 'center', background: 'var(--navy)' }}
            >
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: isDesktop ? 'clamp(1.75rem, 3vw, 2.5rem)' : '1.75rem', fontWeight: 800, color: 'var(--teal)', lineHeight: 1, marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
                {stat.num}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </section>
  )
}
