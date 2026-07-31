import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { serviceCategories, getServicesByCategory } from '../data/services.js'
import { useIsMobile } from '../hooks/useIsMobile.js'

/*
 * Built from services.js — the same source as the nav mega menu — so every
 * category and every insurance line here links to the page that exists for it.
 */
const CATEGORIES = serviceCategories.map((cat) => ({
  slug: cat.slug,
  category: cat.title,
  items: getServicesByCategory(cat.title).map((line) => ({ slug: line.slug, title: line.title })),
}))

function MobileAccordion() {
  const [open, setOpen] = useState(0)

  return (
    <div style={{ border: '1px solid var(--border)' }}>
      {CATEGORIES.map((cat, i) => (
        <div key={cat.category} style={{ borderBottom: i < CATEGORIES.length - 1 ? '1px solid var(--border)' : 'none' }}>

          {/* Header */}
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.875rem 1rem', background: open === i ? 'var(--navy)' : 'var(--white)',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              borderLeft: open === i ? '3px solid var(--teal)' : '3px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700,
              color: open === i ? 'var(--white)' : 'var(--navy)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {cat.category}
            </span>
            <ChevronDown
              size={16}
              style={{
                color: open === i ? 'var(--teal)' : 'var(--text-muted)',
                transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s',
                flexShrink: 0,
              }}
            />
          </button>

          {/* Items */}
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '0.75rem 1.25rem 1.25rem', background: 'var(--light-bg)' }}>
                  {cat.items.map((item) => (
                    <Link
                      key={item.slug}
                      to={`/insurance/${item.slug}`}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}
                    >
                      <span style={{ width: '6px', height: '6px', background: 'var(--teal)', flexShrink: 0, marginTop: '7px', display: 'inline-block' }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dark)', lineHeight: 1.5 }}>
                        {item.title}
                      </span>
                    </Link>
                  ))}
                  <Link
                    to={`/insurance-services/${cat.slug}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '0.85rem', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--teal-dark)', textDecoration: 'none' }}
                  >
                    All {cat.category} <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

export default function ProtoServices() {
  const isMobile = useIsMobile()

  return (
    <section style={{ background: 'var(--light-bg)', padding: isMobile ? '3rem 0' : '5rem 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>

        {/* Header */}
        <div style={{ textAlign: isMobile ? 'left' : 'center', marginBottom: isMobile ? '1.75rem' : '3rem' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>
            Insurance Services
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.5rem' : 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: isMobile ? '0' : '1rem' }}>
            Comprehensive Insurance Services
          </h2>
          {!isMobile && (
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto', fontSize: '15px', lineHeight: 1.7 }}>
              From commercial property to specialist risk, we advise on the full spectrum of insurance products available in the UAE market.
            </p>
          )}
        </div>

        {/* Mobile: accordion | Desktop: 4-col grid */}
        {isMobile ? (
          <MobileAccordion />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)' }}>
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{ background: 'var(--white)', padding: '1.75rem', display: 'flex', flexDirection: 'column' }}
              >
                <Link
                  to={`/insurance-services/${cat.slug}`}
                  style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '0.75rem', borderBottom: '2px solid var(--teal)', marginBottom: '1rem', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--navy)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--teal)' }}
                >
                  <h3 style={{ margin: 0, font: 'inherit', color: 'inherit', letterSpacing: 'inherit' }}>{cat.category}</h3>
                </Link>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                  {cat.items.map((item) => (
                    <li key={item.slug} style={{ marginBottom: '0.6rem' }}>
                      <Link
                        to={`/insurance/${item.slug}`}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', textDecoration: 'none', color: 'var(--text-dark)', transition: 'color 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--teal)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dark)' }}
                      >
                        <span style={{ width: '6px', height: '6px', background: 'var(--teal)', flexShrink: 0, marginTop: '6px', display: 'inline-block' }} />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.5 }}>{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/insurance-services/${cat.slug}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '1rem', fontFamily: 'var(--font-body)', fontSize: '12.5px', fontWeight: 700, color: 'var(--teal-dark)', textDecoration: 'none' }}
                >
                  Explore category <ArrowRight size={13} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Consultancy — the two advisory practices, each with its own page */}
        <div style={{ marginTop: isMobile ? '1.5rem' : '2rem', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)' }}>
          {[
            { to: '/risk-management', title: 'Risk Management Consultancy', desc: 'Structured risk identification, mitigation, and transfer strategy for your operations.' },
            { to: '/management-consultancy', title: 'Management Consultancy', desc: 'Operational and governance advisory that strengthens how your business handles risk.' },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              style={{ background: 'var(--white)', padding: isMobile ? '1.25rem' : '1.5rem 1.75rem', textDecoration: 'none', display: 'block', borderTop: '3px solid var(--teal)', transition: 'background 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--light-bg)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--white)' }}
            >
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1rem' : '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.35rem' }}>
                {c.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '0.75rem' }}>
                {c.desc}
              </p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', fontSize: '12.5px', fontWeight: 700, color: 'var(--teal-dark)' }}>
                Learn more <ArrowRight size={13} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
