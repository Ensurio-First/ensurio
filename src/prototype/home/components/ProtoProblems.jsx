import { motion } from 'framer-motion'
import { ShieldQuestion, TrendingDown, XCircle, FileQuestion, Scale, ClipboardCheck, Search, FileText, Headphones, Gavel, BarChart3 } from 'lucide-react'
import { problems, solutions } from '../data/index.js'
import problemsImg from '../../../assets/advisor-documents-banner.jpg'
import { useIsMobile } from '../hooks/useIsMobile.js'

const solutionIcons = { ClipboardCheck, Search, FileText, Headphones, Gavel, BarChart3 }
const problemIcons  = { ShieldQuestion, TrendingDown, XCircle, FileQuestion, Scale }

export default function ProtoProblems() {
  const isMobile = useIsMobile()

  return (
    <section id="solutions" style={{ background: 'var(--light-bg)', padding: isMobile ? '3rem 0' : '5rem 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>
              Challenges & Solutions
            </p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', margin: 0 }}>
              From Challenge to Clarity
            </h2>
          </div>
          {!isMobile && (
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', maxWidth: '400px', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
              We identify the risks your business faces and provide structured, independent solutions to resolve them.
            </p>
          )}
        </div>

        {/* Full-width image */}
        <div style={{ width: '100%', marginBottom: '1px' }}>
          <img
            src={problemsImg}
            alt="Insurance advisory meeting"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Two-column layout below image */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '5fr 7fr', gap: '1px', background: 'var(--border)' }}>

          {/* LEFT — Pain Points (navy) */}
          <div style={{ background: 'var(--navy)' }}>
            <div style={{ padding: isMobile ? '1rem 1rem' : '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', margin: 0 }}>
                Common Pain Points
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--white)', marginTop: '5px', marginBottom: 0 }}>
                Are Any of These Familiar?
              </p>
            </div>

            {problems.map((problem, i) => {
              const Icon = problemIcons[problem.icon]
              return (
                <motion.div
                  key={problem.title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.35 }}
                  style={{
                    display: 'flex', gap: isMobile ? '0.75rem' : '1rem', alignItems: 'flex-start',
                    padding: isMobile ? '0.75rem 1rem' : '1.1rem 2rem',
                    borderBottom: i < problems.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  }}
                >
                  <div style={{ width: isMobile ? '28px' : '34px', height: isMobile ? '28px' : '34px', background: 'rgba(14,164,114,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                    {Icon && <Icon size={16} color="var(--teal)" />}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: '13.5px', fontWeight: 700, color: 'var(--white)', marginBottom: '3px' }}>
                      {problem.title}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
                      {problem.desc}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* RIGHT — Solutions (white grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', alignContent: 'stretch' }}>

            {/* Header row spanning all cols */}
            <div style={{ gridColumn: isMobile ? 'span 2' : 'span 3', background: 'var(--white)', padding: isMobile ? '1rem 1rem 0.75rem' : '1.5rem 2rem 1rem', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', margin: 0 }}>
                How We Help
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginTop: '5px', marginBottom: 0 }}>
                Our Solutions
              </p>
            </div>

            {solutions.map((solution, i) => {
              const Icon = solutionIcons[solution.icon]
              return (
                <motion.div
                  key={solution.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  whileHover={{ background: 'var(--teal-pale)' }}
                  style={{
                    background: 'var(--white)',
                    padding: isMobile ? '1rem' : '1.5rem',
                    cursor: 'default',
                    borderTop: '3px solid var(--teal)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ width: isMobile ? '28px' : '36px', height: isMobile ? '28px' : '36px', background: 'var(--teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem', flexShrink: 0 }}>
                    {Icon && <Icon size={18} color="var(--teal)" />}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem' }}>
                    {solution.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '0.875rem', flex: 1 }}>
                    {solution.desc}
                  </p>
                  <a href="#contact" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--teal)', textDecoration: 'none' }}>
                    Learn More →
                  </a>
                </motion.div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
