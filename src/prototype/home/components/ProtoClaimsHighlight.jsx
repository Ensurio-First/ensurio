import { motion } from 'framer-motion'
import claimsImg from '../../../assets/claims-advisory.jpg'
import { useIsMobile } from '../hooks/useIsMobile.js'

const claimsStats = [
  { value: '98%', label: 'Claim success rate' },
  { value: '25+', label: 'Years advocacy' },
  { value: '24/7', label: 'Support available' },
]

export default function ProtoClaimsHighlight() {
  const isMobile = useIsMobile()

  return (
    <section id="claims" style={{ position: 'relative', overflow: 'hidden', borderTop: '3px solid var(--teal)' }}>

      {/* Background image — no gradient */}
      <img
        src={claimsImg}
        alt="Claims advisory"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }}
      />

      {/* Solid navy overlay for legibility */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(12,31,79,0.82)' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '780px', margin: '0 auto', textAlign: 'center', padding: isMobile ? '2.5rem 1rem' : '5rem 4rem' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>

          <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '1rem' }}>
            Claims Advisory
          </div>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
            When Claims Become Complicated,{isMobile ? ' ' : <br />}We Stand Beside You
          </h2>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto 2rem' }}>
            As an independent claims advocate, we work exclusively for you — not for the insurer. From first notification of loss through to final settlement, we maximise your outcome at every stage.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: isMobile ? '1.75rem' : '2.5rem', flexWrap: 'wrap', gap: isMobile ? '0' : '0' }}>
            {claimsStats.map((stat, i) => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: isMobile ? '0 0.875rem' : '0 2rem' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : '2rem', fontWeight: 800, color: 'var(--teal)' }}>{stat.value}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>{stat.label}</div>
                </div>
                {i < claimsStats.length - 1 && (
                  <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.2)' }} />
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="#contact"
            style={{ display: isMobile ? 'block' : 'inline-block', width: isMobile ? '100%' : 'auto', padding: '13px 28px', background: 'var(--teal)', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em', transition: 'background 0.2s', boxSizing: 'border-box' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--teal-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--teal)'}
          >
            Get Claims Support Now
          </a>

        </motion.div>
      </div>
    </section>
  )
}
