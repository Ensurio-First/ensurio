import { motion } from 'framer-motion'
import FamilyCheck from '../components/DiagnosticTool/FamilyCheck'
import AboutSection from '../components/AboutSection'
import aboutImg from '../assets/advisor-documents.jpg'
import ContactSection from '../components/ContactSection'
import { useWindowWidth } from '../hooks/useWindowWidth'
import advisorImg from '../assets/advisor-agreement.jpg'

const SVC_ICONS = {
  succession: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
      <circle cx="14" cy="5" r="3"/>
      <circle cx="6" cy="22" r="3"/>
      <circle cx="22" cy="22" r="3"/>
      <line x1="14" y1="8" x2="14" y2="14"/>
      <line x1="14" y1="14" x2="6" y2="19"/>
      <line x1="14" y1="14" x2="22" y2="19"/>
    </svg>
  ),
  estate: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M14 3L4 7v8c0 5 4.5 9 10 10 5.5-1 10-5 10-10V7L14 3z"/>
      <polyline points="10,14 13,17 18,11"/>
    </svg>
  ),
  governance: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="3" width="20" height="22"/>
      <line x1="9" y1="9" x2="19" y2="9"/>
      <line x1="9" y1="14" x2="19" y2="14"/>
      <line x1="9" y1="19" x2="15" y2="19"/>
    </svg>
  ),
  valuation: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
      <polyline points="4,24 4,4"/>
      <polyline points="4,24 24,24"/>
      <polyline points="6,18 11,10 16,13 22,6"/>
      <polyline points="18,6 22,6 22,10"/>
    </svg>
  ),
  trust: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
      <circle cx="9" cy="11" r="4"/>
      <circle cx="19" cy="11" r="4"/>
      <path d="M2 24c0-4 3-6 7-6M26 24c0-4-3-6-7-6M14 18c-2 0-5 1-5 6M14 18c2 0 5 1 5 6"/>
    </svg>
  ),
  efficiency: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
      <line x1="4" y1="8" x2="24" y2="8"/>
      <line x1="4" y1="14" x2="24" y2="14"/>
      <line x1="4" y1="20" x2="24" y2="20"/>
      <rect x="7" y="5.5" width="5" height="5" fill="var(--white)" stroke="currentColor"/>
      <rect x="16" y="11.5" width="5" height="5" fill="var(--white)" stroke="currentColor"/>
      <rect x="10" y="17.5" width="5" height="5" fill="var(--white)" stroke="currentColor"/>
    </svg>
  ),
}

const MGMT_SERVICES = [
  { icon: SVC_ICONS.succession, title: 'Family Business Succession Planning', desc: 'Navigating the transition of leadership and ownership to the next generation with structured legal and operational frameworks.' },
  { icon: SVC_ICONS.estate, title: 'Estate & Legacy Structuring', desc: 'Strategic guidance on creating legally sound corporate Wills and estate structures that protect intergenerational wealth.' },
  { icon: SVC_ICONS.governance, title: 'Family Business Governance', desc: "Drafting MOA & AOA specifically tailored for family businesses to pass seamlessly to the owners' children." },
  { icon: SVC_ICONS.valuation, title: 'Business Valuation & Exit Strategies', desc: 'Finding the optimal path to sell your business with adequately appreciated value and market positioning.' },
  { icon: SVC_ICONS.trust, title: 'Stakeholder Trust & Relationship Building', desc: 'Creating institutional trust with suppliers and buyers through transparent, sustainable communication strategies.' },
  { icon: SVC_ICONS.efficiency, title: 'Operational Efficiency & Process Optimisation', desc: 'Analyzing workflows to eliminate redundancies, reduce overheads, and improve productivity across the organization.' },
]

const STATS = [
  { num: '6', label: 'Advisory\nservices' },
  { num: '500+', label: 'Businesses\nadvised' },
  { num: '15+', label: 'Years of\nexpertise' },
]

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11 } } }
const itemVariants = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }

export default function ManagementConsultancyPage() {
  const width = useWindowWidth()
  const isDesktop = width > 960

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '3.5rem 2rem 4.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-120px', left: '-80px', width: '640px', height: '640px', background: 'radial-gradient(circle, rgba(0,184,153,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1, display: isDesktop ? 'grid' : 'block', gridTemplateColumns: '38% 62%', gap: '3rem', alignItems: 'start' }}>

          {/* LEFT: copy */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--teal-pale)', border: '1px solid rgba(0,184,153,0.3)', padding: '6px 14px', marginBottom: '1.75rem', fontSize: '12px', color: 'var(--teal-dark)', fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }} />
                Pillar II · Management Consultancy
              </div>
            </motion.div>

            <motion.h1 variants={itemVariants} style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, lineHeight: 1.07, marginBottom: '1.25rem', color: 'var(--navy)', letterSpacing: '-0.025em' }}>
              Build a Business That
              <span style={{ color: 'var(--teal)', display: 'block' }}>Outlasts Generations.</span>
            </motion.h1>

            <motion.p variants={itemVariants} style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.5rem', maxWidth: '420px' }}>
              We partner with business leaders and family enterprises to solve complex structural challenges, maximise enterprise value, and ensure seamless continuity.
            </motion.p>

            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {['Family Business Advisory', 'Estate & Succession Planning'].map((item) => (
                <span key={item} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 500, color: 'var(--text-mid)' }}>
                  <span style={{ width: '18px', height: '18px', background: 'var(--teal-pale)', border: '1.5px solid var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--teal-dark)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {item}
                </span>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <a href="#contact" style={{ background: 'var(--navy)', color: 'var(--white)', padding: '12px 24px', fontSize: '13.5px', fontWeight: 700, textDecoration: 'none', display: 'inline-block', transition: 'background 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--navy)')}>
                Book a Free Consultation →
              </a>
            </motion.div>

            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '2.5rem', paddingTop: '2rem', borderTop: '2px solid var(--border)', flexWrap: 'wrap' }}>
              {STATS.map(({ num, label }) => (
                <div key={num}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1, letterSpacing: '-0.02em' }}>{num}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', whiteSpace: 'pre-line', lineHeight: 1.5 }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT: tool */}
          <motion.div initial={{ opacity: 0, x: 40, y: 16 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.75, delay: 0.22, ease: [0.22, 1, 0.36, 1] }} style={!isDesktop ? { marginTop: '2.5rem' } : {}}>
            <div style={{ boxShadow: '0 24px 64px rgba(13,27,75,0.22)', overflow: 'hidden' }}>
              <div style={{ height: '3px', background: 'var(--teal)' }} />
              <div style={{ background: 'var(--navy)', padding: '1rem 1.5rem 0.875rem' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, marginBottom: '4px' }}>Free Diagnostic Tool</p>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--white)', lineHeight: 1.3 }}>Family Business Readiness</p>
              </div>
              <div style={{ background: 'var(--white)', padding: '1.25rem 1.5rem' }}>
                <FamilyCheck />
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── Human element ────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--white)', padding: '0', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', minHeight: '420px' }}>
          {/* Content first on this page (image right) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ background: 'var(--navy)', padding: isDesktop ? '4rem 3.5rem' : '2.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', order: isDesktop ? 0 : 1 }}
          >
            <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, marginBottom: '1rem' }}>
              Our Approach
            </p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 800, color: 'var(--white)', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
              We Don't Just Advise —<br />We Walk With You.
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              Family businesses carry decades of hard work and personal legacy. Our consultants bring both strategic rigour and genuine care to every engagement — because your family's future deserves more than a template.
            </p>
            <blockquote style={{ borderLeft: '3px solid var(--teal)', paddingLeft: '1.25rem', margin: '0 0 1.75rem', fontStyle: 'italic', fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
              "We help families turn conversations they've been avoiding into plans they're proud of — and businesses that last."
            </blockquote>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[{ num: '500+', label: 'Businesses advised' }, { num: '98%', label: 'Client retention' }].map(({ num, label }) => (
                <div key={num}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--teal)', lineHeight: 1 }}>{num}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '3px' }}>{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.12 }}
            style={{ position: 'relative', overflow: 'hidden', minHeight: isDesktop ? 'auto' : '300px', order: isDesktop ? 1 : 0 }}
          >
            <img
              src={advisorImg}
              alt="Financial advisor with clients"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(13,27,75,0.18), transparent)' }} />
          </motion.div>
        </div>
      </section>

      {/* ── Advisory Services ────────────────────────────────────────────── */}
      <section style={{ background: 'var(--light-bg)', padding: '5rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, marginBottom: '0.5rem' }}>Advisory Services</p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Comprehensive Management Consulting
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: '580px', marginBottom: '2.5rem' }}>
            Transforming complex business challenges into structured growth, operational excellence, and lasting legacies for family enterprises across the GCC.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'var(--border)' }} className="services-mgmt">
            {MGMT_SERVICES.map((svc, i) => (
              <motion.div key={svc.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.45 }} whileHover={{ background: 'var(--teal-pale)' }} style={{ background: 'var(--white)', padding: '1.75rem' }}>
                <span style={{ color: 'var(--navy)', display: 'block', marginBottom: '1rem' }}>{svc.icon}</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>{svc.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{svc.desc}</div>
              </motion.div>
            ))}
          </div>

          {/* CTA callout */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--navy)', borderLeft: '3px solid var(--teal)', display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--teal)', marginBottom: '0.4rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Ready to Secure Your Legacy?</p>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, maxWidth: '680px' }}>
                Many family businesses lack structured governance and succession plans, putting years of hard work at risk. Our advisory team helps you build frameworks that last for generations.
              </p>
            </div>
            <a href="#contact" style={{ flexShrink: 0, alignSelf: 'center', background: 'var(--teal)', color: 'var(--white)', padding: '10px 20px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal-dark)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--teal)')}>
              Book a Consultation →
            </a>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <AboutSection image={aboutImg} imagePosition="left" />

      {/* ── Contact + Map ────────────────────────────────────────────────── */}
      <ContactSection />
    </>
  )
}
