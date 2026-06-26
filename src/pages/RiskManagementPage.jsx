import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PremiumCheck from '../components/DiagnosticTool/PremiumCheck'
import AboutSection from '../components/AboutSection'
import aboutImg from '../assets/advisor-handshake.jpg'
import ContactSection from '../components/ContactSection'
import { useWindowWidth } from '../hooks/useWindowWidth'
import advisorImg from '../assets/advisor-couple.jpg'

const IOP_PHASES = [
  { num: '01', title: 'Policy Audit & Technical Alignment', desc: 'Meticulous audit of coverage, deductibles, warranties, exclusions, and premium alignment against your actual risk footprint.' },
  { num: '02', title: 'Total Cost of Risk (TCOR) Analysis', desc: 'Evaluation of historical claim frequencies, administrative overheads, and uninsured exposures to establish a lean financial baseline.' },
  { num: '03', title: 'Risk Retention & Deductible Restructuring', desc: 'Analyzing balance sheet capacity to determine optimal self-insured retentions (SIRs) and deductible thresholds to drive down premiums.' },
  { num: '04', title: 'Claim Mitigation & Risk Profile Enhancement', desc: 'Implementing safety protocols and BCP to secure preferred risk status from insurers, ensuring competitive future renewal rates.' },
]

const STATS = [
  { num: '$40M+', label: 'Premiums\noptimised' },
  { num: '500+', label: 'Corporates\nprotected' },
  { num: '15+', label: 'Years of\nexpertise' },
]

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11 } } }
const itemVariants = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }

export default function RiskManagementPage() {
  const width = useWindowWidth()
  const isDesktop = width > 960

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '3.5rem 2rem 4.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-120px', right: '-80px', width: '640px', height: '640px', background: 'radial-gradient(circle, rgba(0,184,153,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1, display: isDesktop ? 'grid' : 'block', gridTemplateColumns: '38% 62%', gap: '3rem', alignItems: 'start' }}>

          {/* LEFT: copy */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--teal-pale)', border: '1px solid rgba(0,184,153,0.3)', padding: '6px 14px', marginBottom: '1.75rem', fontSize: '12px', color: 'var(--teal-dark)', fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }} />
                Pillar I · Risk Management Consultancy
              </div>
            </motion.div>

            <motion.h1 variants={itemVariants} style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, lineHeight: 1.07, marginBottom: '1.25rem', color: 'var(--navy)', letterSpacing: '-0.025em' }}>
              Protect Every Dollar,
              <span style={{ color: 'var(--teal)', display: 'block' }}>Minimise Every Risk.</span>
            </motion.h1>

            <motion.p variants={itemVariants} style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.5rem', maxWidth: '420px' }}>
              Our Insurance Optimisation Programme (IOP) benchmarks your TCOR, closes coverage gaps, and typically delivers 10–28% in annual premium savings.
            </motion.p>

            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {['Risk Management Consultancy', 'IOP Certified Advisors'].map((item) => (
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
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--white)', lineHeight: 1.3 }}>Insurance Premium Check</p>
              </div>
              <div style={{ background: 'var(--white)', padding: '1.25rem 1.5rem' }}>
                <PremiumCheck />
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── Human element ────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--white)', padding: '0', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', minHeight: '420px' }}>
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ position: 'relative', overflow: 'hidden', minHeight: isDesktop ? 'auto' : '300px' }}
          >
            <img
              src={advisorImg}
              alt="Financial advisor with clients"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(13,27,75,0.18), transparent)' }} />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.12 }}
            style={{ background: 'var(--navy)', padding: isDesktop ? '4rem 3.5rem' : '2.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, marginBottom: '1rem' }}>
              Our Approach
            </p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 800, color: 'var(--white)', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
              More Than Insurance —<br />A Trusted Partnership.
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              Every business is unique. We sit with you, understand your risk landscape, and design a programme that protects what you've built — not just a generic policy review.
            </p>
            <blockquote style={{ borderLeft: '3px solid var(--teal)', paddingLeft: '1.25rem', margin: '0 0 1.75rem', fontStyle: 'italic', fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
              "Our clients don't just save on premiums — they gain clarity on exactly what's protecting their business and what isn't."
            </blockquote>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[{ num: '98%', label: 'Client retention' }, { num: '10–28%', label: 'Avg. premium savings' }].map(({ num, label }) => (
                <div key={num}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--teal)', lineHeight: 1 }}>{num}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '3px' }}>{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── IOP Framework ────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--light-bg)', padding: '5rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, marginBottom: '0.5rem' }}>IOP Framework</p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Insurance Optimisation Programme
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: '580px', marginBottom: '2.5rem' }}>
            A structured 4-phase engagement that addresses every root cause of premium overpayment and coverage misalignment.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1px', background: 'var(--border)' }} className="services-iop">
            {IOP_PHASES.map((phase, i) => (
              <motion.div key={phase.num} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.45 }} whileHover={{ background: '#EEF2FF' }} style={{ background: 'var(--white)', padding: '1.75rem' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--border-dark)', lineHeight: 1, marginBottom: '0.6rem' }}>{phase.num}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem' }}>{phase.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{phase.desc}</div>
              </motion.div>
            ))}
          </div>

          {/* Why IOP callout */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--navy)', borderLeft: '3px solid var(--teal)', display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--teal)', marginBottom: '0.4rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Why IOP?</p>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, maxWidth: '680px' }}>
                Most businesses overpay 10–28% on insurance premiums due to coverage misalignment, poor claims profiling, and lack of market benchmarking. IOP addresses all four root causes in a single structured engagement.
              </p>
            </div>
            <a href="#contact" style={{ flexShrink: 0, alignSelf: 'center', background: 'var(--teal)', color: 'var(--white)', padding: '10px 20px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal-dark)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--teal)')}>
              Start IOP Audit →
            </a>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <AboutSection image={aboutImg} imagePosition="right" />

      {/* ── Contact + Map ────────────────────────────────────────────────── */}
      <ContactSection />
    </>
  )
}
