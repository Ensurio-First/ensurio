import { motion } from 'framer-motion'
import { useIsMobile } from '../hooks/useIsMobile.js'

const credentials = [
  'ACII — Chartered Insurance Institute',
  'CBUAE Licensed Insurance Consultant (License No. 143)',
  '25+ Years in UAE & International Insurance Markets',
  'Specialist in Commercial, Industrial & Aviation Risk',
  'Independent Claims Advocate & Legal Advisory',
]

const credentialBadges = ['ACII Qualified', 'CBUAE License 143', 'Insurance Technical & Legal Consultant']

export default function ProtoFounder() {
  const isMobile = useIsMobile()

  return (
    <section id="founder" style={{ background: 'var(--white)', padding: isMobile ? '3rem 0' : '5rem 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '2rem' : '4rem', alignItems: 'center' }}>
          {/* Image placeholder — order 0 on mobile (first) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              background: 'var(--navy)',
              minHeight: isMobile ? '280px' : '400px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 0,
              order: isMobile ? 0 : 0,
            }}
          >
            {/* Initials */}
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, color: 'var(--teal)', marginBottom: '0.5rem' }}>
              FL
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--white)', marginBottom: '0.25rem' }}>
              Fredrick Lobo
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
              Founder &amp; Principal Consultant
            </div>

            {/* Credential badge overlay at bottom */}
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['ACII', 'CBUAE Lic. 143', '25+ Yrs'].map((badge) => (
                <div key={badge} style={{ padding: '4px 10px', border: '1px solid var(--teal)', borderRadius: 0, fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--teal)', background: 'rgba(0,184,153,0.08)' }}>
                  {badge}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Content — order 1 on mobile (below image) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ order: isMobile ? 1 : 1, padding: isMobile ? '1.5rem 0' : '0' }}
          >
            <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.75rem' }}>
              Our Founder
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
              Fredrick Lobo
            </h2>

            {/* Credential items — hidden on mobile, show only badge tags */}
            {!isMobile && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}>
                {credentials.map((cred) => (
                  <li key={cred} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.6rem' }}>
                    <span style={{ width: '6px', height: '6px', background: 'var(--teal)', flexShrink: 0, marginTop: '7px', borderRadius: 0, display: 'inline-block' }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dark)', lineHeight: 1.6 }}>{cred}</span>
                  </li>
                ))}
              </ul>
            )}

            <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '13px' : '15px', color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: '1rem' }}>
              Fredrick Lobo founded Insure First with a single mission: to give UAE businesses access to truly independent insurance expertise. With over 25 years of experience across commercial, industrial, aviation, and specialist insurance markets, Fredrick has helped more than 130 businesses secure the right coverage, resolve complex claims, and reduce unnecessary insurance costs.
            </p>
            {!isMobile && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: '1.75rem' }}>
                As a CBUAE-licensed consultant and ACII-qualified professional, Fredrick operates independently of any insurer — meaning his advice is always in the client's best interest.
              </p>
            )}

            {/* Credential badge tags */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: isMobile ? '1rem' : '1.75rem' }}>
              {credentialBadges.map((badge) => (
                <span key={badge} style={{ padding: isMobile ? '4px 8px' : '5px 12px', border: '1px solid var(--teal)', borderRadius: 0, fontFamily: 'var(--font-body)', fontSize: isMobile ? '11px' : '12px', fontWeight: 600, color: 'var(--teal-dark)', background: 'var(--teal-pale)' }}>
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
