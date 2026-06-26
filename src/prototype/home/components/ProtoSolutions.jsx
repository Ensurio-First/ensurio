import { motion } from 'framer-motion'
import { ClipboardCheck, Search, FileText, Headphones, Gavel, BarChart3 } from 'lucide-react'
import { solutions } from '../data/index.js'

const iconMap = {
  ClipboardCheck,
  Search,
  FileText,
  Headphones,
  Gavel,
  BarChart3,
}

export default function ProtoSolutions() {
  return (
    <section id="solutions" style={{ background: 'var(--white)', padding: '5rem 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 4rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.75rem' }}>
            Our Solutions
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            How We Help Your Business
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto', fontSize: '15px', lineHeight: 1.7 }}>
            Independent consultancy services designed to give your business the right coverage at the right price.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)' }}>
          {solutions.map((solution, i) => {
            const Icon = iconMap[solution.icon]
            return (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ background: 'var(--teal-pale)' }}
                style={{
                  background: 'var(--white)',
                  padding: '1.75rem',
                  borderRadius: 0,
                  borderTop: i % 2 === 0 ? '3px solid var(--teal)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'default',
                }}
              >
                <div style={{ width: '40px', height: '40px', background: 'var(--teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', borderRadius: 0 }}>
                  {Icon && <Icon size={22} color="var(--teal)" />}
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
                  {solution.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem', flex: 1 }}>
                  {solution.desc}
                </p>
                <a href="#contact" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--teal)', textDecoration: 'none' }}>
                  Learn More →
                </a>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
