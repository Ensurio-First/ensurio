import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, MessageSquare, CheckCircle2, Clock, Shield, ChevronDown } from 'lucide-react'
import ProtoNav from '../prototype/home/components/ProtoNav'
import ProtoFooter from '../prototype/home/components/ProtoFooter'
import { useIsMobile } from '../prototype/home/hooks/useIsMobile'
import '../prototype/prototype.css'

/* ─── Static data ─── */

const COUNTRY_CODES = [
  { code: '+971', flag: '🇦🇪', label: 'UAE' },
  { code: '+966', flag: '🇸🇦', label: 'KSA' },
  { code: '+974', flag: '🇶🇦', label: 'Qatar' },
  { code: '+973', flag: '🇧🇭', label: 'Bahrain' },
  { code: '+968', flag: '🇴🇲', label: 'Oman' },
  { code: '+965', flag: '🇰🇼', label: 'Kuwait' },
  { code: '+91',  flag: '🇮🇳', label: 'India' },
  { code: '+44',  flag: '🇬🇧', label: 'UK' },
  { code: '+1',   flag: '🇺🇸', label: 'USA' },
  { code: '+61',  flag: '🇦🇺', label: 'Australia' },
]

const enquiryTypes = [
  'Insurance Audit',
  'Risk Assessment',
  'Policy Review',
  'Claims Advisory',
  'Legal Claims Support',
  'Coverage Gap Analysis',
  'Business Insurance Quote',
  'Personal Insurance Quote',
  'Other',
]

const contactDetails = [
  {
    Icon: Mail,
    label: 'Email',
    lines: ['consult@insurefirst.ae', 'lobo@insurefirst.ae'],
    href: 'mailto:consult@insurefirst.ae',
    action: 'Send an email',
  },
  {
    Icon: Phone,
    label: 'Phone',
    lines: ['+971 50 976 5976'],
    href: 'tel:+971509765976',
    action: 'Call now',
  },
  {
    Icon: MapPin,
    label: 'Location',
    lines: ['Dubai, United Arab Emirates'],
    href: 'https://maps.google.com/?q=Dubai,UAE',
    action: 'Open in Google Maps',
    external: true,
  },
  {
    Icon: Clock,
    label: 'Office Hours',
    lines: ['Mon – Fri: 9:00 AM – 6:00 PM', 'Sat: 9:00 AM – 1:00 PM'],
    href: null,
    action: null,
  },
]

const trustPoints = [
  { Icon: Shield, text: 'CBUAE Licensed — License 143' },
  { Icon: CheckCircle2, text: 'Independent, conflict-free advisory' },
  { Icon: Clock, text: 'Response within 1 business day' },
]

const faqs = [
  { q: 'Is the initial consultation free?', a: 'Yes. We offer a no-obligation first consultation to understand your situation before recommending any engagement.' },
  { q: 'How quickly can you respond to a claim?', a: 'We respond to claim enquiries the same business day and can be engaged on an emergency basis for urgent losses.' },
  { q: 'Do you work with all insurers in UAE?', a: 'Yes. As an independent consultant licensed by CBUAE, we work across all registered insurers in the UAE market.' },
  { q: 'What types of businesses do you advise?', a: 'We advise businesses of all sizes — from SMEs to large corporates — across construction, logistics, hospitality, manufacturing, and professional services.' },
]

/* ─── Input border helper ─── */
function borderColor(key, errors, touched, form) {
  if (errors[key]) return '#EF4444'
  if (touched[key] && form[key]?.trim()) return '#10B981'
  return '#94A3B8'
}

/* ─── Form success ─── */
function FormSuccess() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', padding: '3rem 2rem' }}
    >
      <div style={{ width: '64px', height: '64px', background: 'var(--teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', borderRadius: '50%' }}>
        <CheckCircle2 size={32} color="var(--teal)" />
      </div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.75rem' }}>Enquiry Received</h3>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '340px', margin: '0 auto 1.5rem' }}>
        Thank you for reaching out. Fredrick will review your enquiry and respond <strong>within one business day</strong>.
      </p>
      <a
        href="tel:+971509765976"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '13px 24px', background: 'var(--navy)', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', minHeight: '48px' }}
      >
        <Phone size={15} /> Call us directly
      </a>
    </motion.div>
  )
}

/* ─── Contact form ─── */
function ContactForm({ isMobile }) {
  const [form, setForm] = useState({ name: '', email: '', countryCode: '+971', phone: '', enquiry: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  const isValidPhone = (v) => v.replace(/\s/g, '').length >= 7

  const validate = (f = form) => {
    const e = {}
    if (!f.name.trim()) e.name = 'Full name is required'
    if (!f.email.trim() || !isValidEmail(f.email)) e.email = 'Valid email is required'
    if (!f.phone.trim() || !isValidPhone(f.phone)) e.phone = 'Valid phone number is required'
    if (!f.message.trim()) e.message = 'Please describe how we can help'
    return e
  }

  const set = (key, value) => {
    const updated = { ...form, [key]: value }
    setForm(updated)
    if (touched[key]) {
      const e = validate(updated)
      setErrors((prev) => ({ ...prev, [key]: e[key] || '' }))
    }
  }

  const blur = (key) => {
    setTouched((prev) => ({ ...prev, [key]: true }))
    const e = validate()
    setErrors((prev) => ({ ...prev, [key]: e[key] || '' }))
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const allTouched = { name: true, email: true, phone: true, message: true }
    setTouched(allTouched)
    const e = validate()
    if (Object.keys(e).filter(k => e[k]).length) { setErrors(e); return }
    setSubmitted(true)
  }

  const labelStyle = { display: 'block', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--navy)', marginBottom: '7px' }
  const inputStyle = (key) => ({
    width: '100%', padding: '0 14px', height: '48px',
    fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dark)',
    background: 'var(--white)', border: `1.5px solid ${borderColor(key, errors, touched, form)}`,
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  })
  const errorStyle = { fontFamily: 'var(--font-body)', fontSize: '12px', color: '#EF4444', marginTop: '4px' }
  const fieldWrap = { marginBottom: '1.5rem' }

  if (submitted) return <FormSuccess />

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* Name + Email */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0 1.25rem' }}>
        <div style={fieldWrap}>
          <label htmlFor="cf-name" style={labelStyle}>Full Name <span style={{ color: '#EF4444' }}>*</span></label>
          <input id="cf-name" type="text" value={form.name} placeholder="Ahmed Al Mansoori"
            onChange={(e) => set('name', e.target.value)} onBlur={() => blur('name')}
            style={inputStyle('name')} aria-required="true" aria-describedby={errors.name ? 'cf-name-err' : undefined} />
          {errors.name && <p id="cf-name-err" style={errorStyle}>{errors.name}</p>}
        </div>
        <div style={fieldWrap}>
          <label htmlFor="cf-email" style={labelStyle}>Email Address <span style={{ color: '#EF4444' }}>*</span></label>
          <input id="cf-email" type="email" value={form.email} placeholder="you@company.ae"
            onChange={(e) => set('email', e.target.value)} onBlur={() => blur('email')}
            style={inputStyle('email')} aria-required="true" aria-describedby={errors.email ? 'cf-email-err' : undefined} />
          {errors.email && <p id="cf-email-err" style={errorStyle}>{errors.email}</p>}
        </div>
      </div>

      {/* Phone with country code */}
      <div style={fieldWrap}>
        <label htmlFor="cf-phone" style={labelStyle}>Phone Number <span style={{ color: '#EF4444' }}>*</span></label>
        <div style={{ display: 'flex', gap: '0', border: `1.5px solid ${borderColor('phone', errors, touched, form)}`, background: 'var(--white)', transition: 'border-color 0.15s' }}>
          <select
            value={form.countryCode}
            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
            style={{ height: '48px', padding: '0 8px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-dark)', background: '#F8FAFC', border: 'none', borderRight: '1.5px solid #CBD5E1', outline: 'none', cursor: 'pointer', flexShrink: 0, minWidth: '90px' }}
            aria-label="Country code"
          >
            {COUNTRY_CODES.map(({ code, flag, label }) => (
              <option key={code} value={code}>{flag} {code}</option>
            ))}
          </select>
          <input id="cf-phone" type="tel" value={form.phone} placeholder="50 976 5976"
            onChange={(e) => set('phone', e.target.value)} onBlur={() => blur('phone')}
            style={{ flex: 1, height: '48px', padding: '0 14px', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dark)', background: 'var(--white)', border: 'none', outline: 'none', boxSizing: 'border-box' }}
            aria-required="true" aria-describedby={errors.phone ? 'cf-phone-err' : undefined} />
        </div>
        {errors.phone && <p id="cf-phone-err" style={errorStyle}>{errors.phone}</p>}
      </div>

      {/* Enquiry type */}
      <div style={fieldWrap}>
        <label htmlFor="cf-enquiry" style={labelStyle}>What Can We Help With?</label>
        <select id="cf-enquiry" value={form.enquiry} onChange={(e) => setForm({ ...form, enquiry: e.target.value })}
          style={{ width: '100%', height: '48px', padding: '0 14px', fontFamily: 'var(--font-body)', fontSize: '14px', color: form.enquiry ? 'var(--text-dark)' : 'var(--text-muted)', background: 'var(--white)', border: '1.5px solid #94A3B8', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
          <option value="">Select an enquiry type…</option>
          {enquiryTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Message */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="cf-message" style={labelStyle}>Your Message <span style={{ color: '#EF4444' }}>*</span></label>
        <textarea id="cf-message" rows={5} value={form.message}
          placeholder="Briefly describe your situation or what you'd like to discuss…"
          onChange={(e) => set('message', e.target.value)} onBlur={() => blur('message')}
          style={{ width: '100%', padding: '14px', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dark)', background: 'var(--white)', border: `1.5px solid ${borderColor('message', errors, touched, form)}`, outline: 'none', resize: 'vertical', boxSizing: 'border-box', minHeight: '120px', transition: 'border-color 0.15s', lineHeight: 1.6 }}
          aria-required="true" aria-describedby={errors.message ? 'cf-message-err' : undefined} />
        {errors.message && <p id="cf-message-err" style={errorStyle}>{errors.message}</p>}
      </div>

      {/* Submit */}
      <button type="submit"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 32px', height: '52px', background: 'var(--navy)', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: '0.02em', width: isMobile ? '100%' : 'auto', justifyContent: 'center', transition: 'background 0.2s', minWidth: '220px' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--navy-light)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--navy)'}
      >
        Get My Expert Advice →
      </button>

      {/* Privacy */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '1rem', lineHeight: 1.65 }}>
        By submitting you agree to be contacted about your insurance enquiry.{' '}
        <strong style={{ color: 'var(--text-mid)' }}>We never share your data with third parties.</strong>
      </p>
    </form>
  )
}

/* ─── FAQ accordion ─── */
function FaqAccordion({ isMobile }) {
  const [open, setOpen] = useState(null)

  return (
    <section style={{ background: 'var(--white)', padding: isMobile ? '2.5rem 0' : '4rem 0', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>Quick Answers</p>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '1.75rem' }}>Frequently Asked Questions</h2>
        <div style={{ maxWidth: '780px' }}>
          {faqs.map((faq, i) => (
            <div key={faq.q} style={{ borderBottom: '1px solid var(--border)' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '1rem', minHeight: '52px' }}
                aria-expanded={open === i}
              >
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '14px' : '15px', fontWeight: 700, color: open === i ? 'var(--teal)' : 'var(--navy)', transition: 'color 0.15s' }}>{faq.q}</span>
                <ChevronDown size={18} color={open === i ? 'var(--teal)' : 'var(--text-muted)'} style={{ flexShrink: 0, transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.22s' }} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.75, paddingBottom: '1.1rem' }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Sticky mobile bar ─── */
function StickyMobileBar() {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300, display: 'flex', gap: '1px', background: 'var(--border)', boxShadow: '0 -2px 12px rgba(13,27,75,0.15)' }} className="proto-mobile-menu">
      <a href="tel:+971509765976"
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--navy)', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', padding: '14px 0', minHeight: '52px' }}>
        <Phone size={17} /> Call Now
      </a>
      <a href="https://wa.me/971509765976" target="_blank" rel="noopener noreferrer"
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#25D366', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', padding: '14px 0', minHeight: '52px' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
        WhatsApp
      </a>
    </div>
  )
}

/* ─── Page ─── */
export default function ContactPage() {
  const isMobile = useIsMobile()

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111827', paddingBottom: isMobile ? '52px' : '0' }}>
      <ProtoNav />
      <main>

        {/* ── Hero ── */}
        <section style={{ background: 'var(--navy)', padding: isMobile ? '3rem 0.75rem' : '4.5rem 0', borderBottom: '3px solid var(--teal)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(14,164,114,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(14,164,114,0.04) 1px,transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0' : '0 4rem', position: 'relative', zIndex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Link to="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Home</Link>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/</span>
                <span style={{ fontSize: '13px', color: 'var(--teal)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Contact Us</span>
              </div>
              <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.75rem' }}>
                Let's Talk
              </p>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.75rem' : 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', maxWidth: '600px', marginBottom: '1.25rem', lineHeight: 1.2 }}>
                Get Expert Insurance Advice Today
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '14px' : '16px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8, maxWidth: '520px', marginBottom: '1.75rem' }}>
                Book a no-obligation consultation with Fredrick Lobo and find out exactly where your insurance stands.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {trustPoints.map(({ Icon, text }) => {
                  const isResponse = text.startsWith('Response')
                  return (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isResponse ? 'rgba(14,164,114,0.18)' : 'rgba(255,255,255,0.07)', border: `1px solid ${isResponse ? 'rgba(14,164,114,0.4)' : 'rgba(255,255,255,0.12)'}`, padding: '6px 14px' }}>
                      <Icon size={14} color="var(--teal)" />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: isResponse ? 800 : 600 }}>{text}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Main content ── */}
        <section style={{ background: 'var(--light-bg)', padding: isMobile ? '2rem 0' : '5rem 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr', gap: isMobile ? '1.5rem' : '1px', background: isMobile ? 'transparent' : 'var(--border)' }}>

              {/* Left: Form */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                style={{ background: 'var(--white)', padding: isMobile ? '1.5rem' : '2.5rem 3rem', height: '100%', boxSizing: 'border-box' }}
              >
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <MessageSquare size={20} color="var(--teal)" />
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>Send Us a Message</h2>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Fill in the form and we will come back to you{' '}
                    <strong style={{ color: 'var(--navy)' }}>within one business day</strong>.
                  </p>
                </div>
                <ContactForm isMobile={isMobile} />
              </motion.div>

              {/* Right: Contact info */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: isMobile ? 'transparent' : 'var(--border)', height: '100%' }}
              >
                {contactDetails.map(({ Icon, label, lines, href, action, external }) => (
                  <div key={label} style={{ background: 'var(--white)', padding: isMobile ? '1.1rem' : '1.5rem 2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', background: 'var(--teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color="var(--teal)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: '4px' }}>{label}</p>
                      {lines.map((line) => (
                        <p key={line} style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--navy)', fontWeight: 500, margin: '0 0 2px' }}>{line}</p>
                      ))}
                      {action && href && (
                        <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--teal)', textDecoration: 'none', marginTop: '6px', display: 'inline-block', minHeight: '24px' }}>
                          {action} →
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {/* WhatsApp CTA */}
                <div style={{ background: 'var(--navy)', padding: isMobile ? '1.25rem' : '1.75rem 2rem', flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: '0.5rem' }}>Prefer WhatsApp?</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: '1rem' }}>
                    Message us directly for a faster response.
                  </p>
                  <a href="https://wa.me/971509765976" target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '0 20px', height: '48px', background: '#25D366', color: '#ffffff', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 800, textDecoration: 'none', letterSpacing: '0.01em' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                    Chat on WhatsApp
                  </a>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── FAQ accordion ── */}
        <FaqAccordion isMobile={isMobile} />

      </main>
      <ProtoFooter />
      {isMobile && <StickyMobileBar />}
    </div>
  )
}
