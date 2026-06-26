import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const PILLARS = [
  {
    tag: 'Pillar I',
    title: 'Risk Management Consultancy',
    tagline: 'Proactive strategies to anticipate, mitigate, and manage corporate vulnerability.',
    desc: 'Go beyond traditional coverage oversight with our signature Insurance Optimisation Programme (IOP). We benchmark your TCOR, close coverage gaps, and deliver measurable premium savings.',
    href: '/risk-management',
    cta: 'Explore Risk Management →',
    tool: 'Free Insurance Premium Check',
    highlights: ['Policy Audit & Technical Alignment', 'TCOR Analysis', 'Deductible Restructuring', 'Risk Profile Enhancement'],
  },
  {
    tag: 'Pillar II',
    title: 'Management Consultancy',
    tagline: 'Transforming challenges into structured growth, operational excellence, and lasting legacies.',
    desc: 'We partner with business leaders and family-owned enterprises to solve complex structural challenges, maximize enterprise value, and ensure seamless continuity across generations.',
    href: '/management-consultancy',
    cta: 'Explore Management Consultancy →',
    tool: 'Free Family Business Readiness Check',
    highlights: ['Succession Planning', 'Estate & Legacy Structuring', 'Family Business Governance', 'Business Valuation'],
  },
]

export default function Services() {
  return (
    <section id="services" style={{ padding: '6rem 2rem', background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{ fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, marginBottom: '0.5rem' }}>Our Services</p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.75rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Two Pillars of Expert Advisory
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: '580px', margin: '0 auto' }}>
            Combining deep-rooted heritage in corporate protection with cutting-edge advisory capabilities for a 360-degree shield and strategic growth blueprint.
          </p>
        </div>

        {/* Pillar cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '2px', background: 'var(--border)' }} className="services-pillars">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.tag}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ background: 'var(--white)', padding: '2.5rem' }}
            >
              {/* Tag */}
              <div style={{ display: 'inline-block', padding: '3px 0 6px', borderTop: '3px solid var(--teal)', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700 }}>{p.tag}</span>
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{p.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--teal)', fontStyle: 'italic', marginBottom: '1rem', fontWeight: 500 }}>{p.tagline}</p>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>{p.desc}</p>

              {/* Highlights */}
              <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '1.75rem' }}>
                {p.highlights.map((h) => (
                  <li key={h} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-mid)', fontWeight: 500 }}>
                    <span style={{ width: '14px', height: '14px', background: 'var(--teal-pale)', border: '1.5px solid var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: 'var(--teal)', flexShrink: 0 }}>✓</span>
                    {h}
                  </li>
                ))}
              </ul>

              {/* Free tool badge */}
              <div style={{ background: 'var(--teal-pale)', border: '1px solid rgba(0,184,153,0.25)', padding: '8px 12px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{ fontSize: '13px', color: 'var(--teal)', fontWeight: 600 }}>🎯 {p.tool}</span>
              </div>

              {/* CTA */}
              <Link
                to={p.href}
                style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--navy)', color: 'var(--white)', padding: '12px 22px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-body)', transition: 'background 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--navy)')}
              >
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
