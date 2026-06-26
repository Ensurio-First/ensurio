import { motion } from 'framer-motion'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile.js'

const contactItems = [
  { Icon: Mail, label: 'Email', value: 'info@insurefirst.ae' },
  { Icon: Phone, label: 'Phone', value: '+971 50 000 0000' },
  { Icon: MapPin, label: 'Location', value: 'Dubai, United Arab Emirates' },
]

export default function ProtoContactCTA() {
  const isMobile = useIsMobile()

  return (
    <section
      id="contact"
      style={{ background: 'var(--navy)', padding: isMobile ? '3rem 0' : '5rem 0', borderTop: '3px solid var(--teal)' }}
    >
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '0 0.75rem' : '0 4rem',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '2.5rem' : '4rem',
        alignItems: 'center',
      }}>
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.75rem' }}>
            Get in Touch
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
            Ready to Protect Your Business?
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8, marginBottom: '2rem' }}>
            Book a no-obligation consultation with Fredrick Lobo and discover exactly where your business insurance stands today.
          </p>
          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
            <a
              href="#"
              style={{
                display: 'block',
                padding: '0.875rem 1.75rem',
                background: 'var(--teal)',
                color: 'var(--white)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                borderRadius: 0,
                letterSpacing: '0.02em',
                textAlign: 'center',
                boxSizing: 'border-box',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              Book a Consultation
            </a>
            <a
              href="tel:+971000000000"
              style={{
                display: 'block',
                padding: '0.875rem 1.75rem',
                background: 'transparent',
                color: 'var(--white)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 0,
                letterSpacing: '0.02em',
                textAlign: 'center',
                boxSizing: 'border-box',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              Call Us Now
            </a>
          </div>
        </motion.div>

        {/* Right: contact info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '1.25rem' : '1.5rem', flexWrap: isMobile ? 'wrap' : 'nowrap' }}
        >
          {contactItems.map(({ Icon, label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem' }}>
              <div style={{ width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: 0 }}>
                <Icon size={isMobile ? 16 : 20} color="var(--white)" />
              </div>
              <div>
                {/* Hide label on mobile, show only value */}
                {!isMobile && (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
                    {label}
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '13px' : '15px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
