import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

const STATS = [
  { num: '15+', label: 'Years of trusted\nadvisory' },
  { num: '500+', label: 'Corporates\nprotected' },
  { num: '$40M+', label: 'Premiums\noptimised' },
]

export default function Hero() {
  return (
    <section style={{
      background: 'var(--white)',
      borderBottom: '1px solid var(--border)',
      padding: '5rem 2rem 5.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle bg glow */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-60px',
        width: '640px', height: '640px',
        background: 'radial-gradient(circle, rgba(0,184,153,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">

          {/* Rebrand badge */}
          <motion.div variants={itemVariants}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'var(--teal-pale)', border: '1px solid rgba(0,184,153,0.3)',
              padding: '6px 14px', marginBottom: '1.75rem',
              fontSize: '12px', color: 'var(--teal-dark)', fontWeight: 600, letterSpacing: '0.01em',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--teal)', display: 'inline-block', flexShrink: 0 }} />
              Rebranding &amp; Expansion — Insure First is now Ensurio First
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 800, lineHeight: 1.05, marginBottom: '1.25rem',
            color: 'var(--navy)', letterSpacing: '-0.025em',
          }}>
            Same Trusted Expertise,{' '}
            <span style={{ color: 'var(--teal)', display: 'block' }}>Expanded Horizons.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p variants={itemVariants} style={{
            fontSize: '1.0625rem', color: 'var(--text-muted)', lineHeight: 1.8,
            marginBottom: '2.25rem', fontWeight: 400, maxWidth: '620px',
          }}>
            Ensurio First Risk Management Consultancies — a premier multi-disciplinary advisory firm
            delivering 360-degree corporate protection and strategic growth solutions across the GCC.
          </motion.p>

          {/* Trust items */}
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {['Risk Management Consultancy', 'Management Consultancy'].map((item) => (
              <span key={item} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 500, color: 'var(--text-mid)' }}>
                <span style={{ width: '18px', height: '18px', background: 'var(--teal-pale)', border: '1.5px solid var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--teal-dark)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                {item}
              </span>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <Link to="/risk-management" style={{ background: 'var(--navy)', color: 'var(--white)', padding: '13px 28px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-body)', display: 'inline-block', transition: 'background 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--navy)')}
            >
              Free Premium Check →
            </Link>
            <Link to="/management-consultancy" style={{ background: 'transparent', color: 'var(--navy)', padding: '13px 28px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-body)', display: 'inline-block', border: '2px solid var(--border)', transition: 'border-color 0.2s, color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.color = 'var(--teal)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--navy)' }}
            >
              Management Consulting
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '3rem', paddingTop: '2rem', borderTop: '2px solid var(--border)', flexWrap: 'wrap' }}>
            {STATS.map(({ num, label }) => (
              <div key={num} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1, letterSpacing: '-0.02em' }}>{num}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{label}</span>
              </div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}
