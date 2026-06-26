import { motion } from 'framer-motion'
import { trustStats } from '../data/index.js'
import { useIsMobile } from '../hooks/useIsMobile.js'

export default function ProtoTrustBar() {
  const isMobile = useIsMobile()

  return (
    <section style={{ background: 'var(--navy)', padding: '0' }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: '1px',
        background: 'rgba(255,255,255,0.08)',
      }}>
        {trustStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            style={{ padding: isMobile ? '1.25rem 0.75rem' : '1.75rem', textAlign: 'center', background: 'var(--navy)' }}
          >
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : '2rem', fontWeight: 800, color: 'var(--teal)' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: isMobile ? '11px' : '13px', color: 'rgba(255,255,255,0.55)', marginTop: '4px', fontFamily: 'var(--font-body)' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
