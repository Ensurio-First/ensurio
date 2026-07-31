import { motion } from 'framer-motion'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile.js'
import InlineLeadForm from '../../../components/InlineLeadForm'

const contactItems = [
  { Icon: Mail, label: 'Email', value: 'consult@insurefirst.ae' },
  { Icon: Phone, label: 'Phone', value: '+971 50 976 5976' },
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
        gridTemplateColumns: isMobile ? '1fr' : '1.05fr 0.95fr',
        gap: isMobile ? '2.5rem' : '4rem',
        alignItems: 'center',
      }}>
        {/* Left: copy + contact info */}
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
            Leave your details and Fredrick Lobo's team will call you back — usually the same day. Or reach us directly below.
          </p>

          {/* Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            {contactItems.map(({ Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color="var(--white)" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <a
            href="tel:+971509765976"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.875rem 1.75rem', background: 'transparent', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}
          >
            <Phone size={15} /> Call Us Now
          </a>
        </motion.div>

        {/* Right: inline lead form — submit without leaving the page */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <InlineLeadForm
            service="Home page enquiry"
            source="home-contact"
            heading="Book a free consultation"
            note="Tell us how to reach you and an advisor will be in touch — no obligation."
            cta="Request a Callback"
          />
        </motion.div>
      </div>
    </section>
  )
}
