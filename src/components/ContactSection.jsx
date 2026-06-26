import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import emailjs from '@emailjs/browser'

// Same EmailJS config as LeadGateForm
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID'
const EMAILJS_TEMPLATE_ID = 'YOUR_CONTACT_TEMPLATE_ID'
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY'

const IconEmail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
    <rect x="2" y="4" width="20" height="16"/><polyline points="2,4 12,13 22,4"/>
  </svg>
)
const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 014 6a2 2 0 012-2z"/>
  </svg>
)
const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
)
const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
    <path d="M4 4h16v13a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
    <polyline points="4,4 12,13 20,4"/>
    <line x1="4" y1="20" x2="8" y2="16"/><line x1="20" y1="20" x2="16" y2="16"/>
  </svg>
)

const CONTACT_INFO = [
  {
    icon: <IconEmail />,
    label: 'Email Address',
    lines: ['consult@insurefirst.ae', 'lobo@insurefirst.ae'],
    href: ['mailto:consult@insurefirst.ae', 'mailto:lobo@insurefirst.ae'],
  },
  {
    icon: <IconPhone />,
    label: 'Phone Number',
    lines: ['+971 50 976 5976'],
    href: ['tel:+971509765976'],
  },
  {
    icon: <IconPin />,
    label: 'Office Address',
    lines: [
      'Unit No: BA574, DMCC Business Centre',
      'Level No 1, Jewellery & Gemplex 3',
      'P.O 35973, Dubai, UAE',
    ],
  },
  {
    icon: <IconMail />,
    label: 'Mailing Address',
    lines: ['P.O.Box 35973, Dubai, DMCC', 'United Arab Emirates'],
  },
]

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '2px solid var(--border)',
  borderRadius: 0,
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  color: 'var(--text-dark)',
  background: 'var(--white)',
  outline: 'none',
  transition: 'border-color 0.2s',
}

export default function ContactSection() {
  const formRef = useRef()
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formRef.current, EMAILJS_PUBLIC_KEY)
      setStatus('sent')
      formRef.current.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" style={{ background: 'var(--light-bg)', padding: '5rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>
            Appointment
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: '520px' }}>
            Let's Protect Your Business, Life And Much More
          </h2>
          <p style={{ marginTop: '0.75rem', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '480px' }}>
            Drop in your details and our service team will get back to you. Or reach us directly using the information below.
          </p>
        </div>

        {/* Two-column: left = info + form, right = map */}
        <div className="contact-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '3rem', alignItems: 'start' }}>

          {/* LEFT */}
          <div>
            {/* Opening hours */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>Opening Hours</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Monday – Friday</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--navy)' }}>
                  <span style={{ width: '8px', height: '8px', background: 'var(--teal)', display: 'inline-block' }} />
                  8:30 AM – 5:30 PM
                </span>
              </div>
            </div>

            {/* Contact info grid */}
            <div className="contact-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
              {CONTACT_INFO.map((item) => (
                <div key={item.label}>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>{item.icon}</span> {item.label}
                  </div>
                  {item.lines.map((line, i) =>
                    item.href ? (
                      <a key={i} href={item.href[i] ?? item.href[0]} style={{ display: 'block', fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.6, textDecoration: 'none' }}
                        onMouseEnter={(e) => (e.target.style.color = 'var(--teal)')}
                        onMouseLeave={(e) => (e.target.style.color = 'var(--text-mid)')}
                      >
                        {line}
                      </a>
                    ) : (
                      <p key={i} style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.6, margin: 0 }}>{line}</p>
                    )
                  )}
                </div>
              ))}
            </div>

            {/* Contact form */}
            <div style={{ background: 'var(--white)', padding: '1.5rem', borderLeft: '3px solid var(--teal)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Send Us a Message</h3>

              {status === 'sent' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1.5rem', background: 'var(--teal-pale)', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>✓</div>
                  <p style={{ fontSize: '14px', color: 'var(--navy)', fontWeight: 600 }}>Message sent! We'll be in touch shortly.</p>
                </motion.div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} noValidate>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <input name="from_name" required placeholder="Full Name" style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--navy)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                    <input name="from_email" required type="email" placeholder="Email Address" style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--navy)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                  <input name="company" placeholder="Company Name" style={{ ...inputStyle, marginBottom: '10px' }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--navy)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                  <textarea name="message" required rows={3} placeholder="How can we help you?" style={{ ...inputStyle, resize: 'vertical', marginBottom: '12px' }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--navy)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />

                  {status === 'error' && (
                    <p style={{ fontSize: '12px', color: 'var(--danger)', marginBottom: '8px' }}>
                      ⚠ Could not send. Email us directly at consult@insurefirst.ae
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    style={{ background: 'var(--navy)', color: 'var(--white)', border: 'none', padding: '11px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', borderRadius: 0, transition: 'background 0.2s', width: '100%' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--navy)')}
                  >
                    {status === 'sending' ? 'Sending...' : 'Send Message →'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT: Google Map */}
          <div>
            <div style={{ overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '1rem' }}>
              <iframe
                title="Ensurio First Office Location"
                src="https://maps.google.com/maps?q=Almas+Tower+DMCC+Dubai+Jewellery+Gemplex&t=&z=15&ie=UTF8&iwloc=B&output=embed"
                width="100%"
                height="420"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href="https://maps.google.com/?q=Almas+Tower,+DMCC,+Dubai,+UAE"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--teal)', textDecoration: 'none', padding: '8px 0' }}
            >
              📍 Get Directions on Google Maps →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
