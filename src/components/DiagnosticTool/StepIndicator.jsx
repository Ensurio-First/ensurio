import { motion } from 'framer-motion'

export default function StepIndicator({ steps, current }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {/* Step track */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {steps.map((label, i) => {
          const isDone = i < current
          const isActive = i === current
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
              {/* Step box */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <motion.div
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-body)',
                    flexShrink: 0,
                    background: isDone ? 'var(--teal)' : isActive ? 'var(--navy)' : 'transparent',
                    color: isDone || isActive ? 'var(--white)' : 'var(--text-muted)',
                    border: isDone ? '2px solid var(--teal)' : isActive ? '2px solid var(--navy)' : '2px solid var(--border)',
                    position: 'relative',
                    zIndex: 1,
                    transition: 'all 0.3s',
                  }}
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  {isDone ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>✓</motion.span>
                  ) : (
                    i + 1
                  )}
                </motion.div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--navy)' : isDone ? 'var(--teal)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  transition: 'color 0.3s',
                }}>
                  {label}
                </span>
              </div>

              {/* Connecting segment */}
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: 'var(--border)', position: 'relative', overflow: 'hidden', marginBottom: '18px' }}>
                  <motion.div
                    style={{ position: 'absolute', inset: 0, background: 'var(--teal)', transformOrigin: 'left' }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isDone ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
