import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const CIRCUMFERENCE = 2 * Math.PI * 52

function getScoreColor(score) {
  if (score < 40) return '#EF4444'
  if (score < 60) return '#F59E0B'
  if (score < 75) return '#00B899'
  return '#10B981'
}

function getScoreLabel(score) {
  if (score < 40) return 'High Risk'
  if (score < 60) return 'Moderate Risk'
  if (score < 75) return 'Developing'
  return 'Strong'
}

const styles = {
  wrap: { textAlign: 'center', marginBottom: '1.25rem' },
  ringWrap: {
    width: '120px',
    height: '120px',
    margin: '0 auto 0.75rem',
    position: 'relative',
  },
  svg: {
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
  },
  scoreInner: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNum: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1,
  },
  scoreSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  scoreLabel: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '4px',
  },
  scoreDesc: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    maxWidth: '320px',
    margin: '0 auto',
  },
}

/* Exported sub-components for the desktop 3-zone result layout */
export function ScoreRingOnly({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const color = getScoreColor(score)
  const dashArray = (animatedScore / 100) * CIRCUMFERENCE
  useEffect(() => {
    const start = Date.now(), duration = 1200
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      setAnimatedScore(Math.round((1 - Math.pow(1 - p, 3)) * score))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score])
  return (
    <div style={{ width: '100px', height: '100px', flexShrink: 0, position: 'relative' }}>
      <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="#E2E8F0" strokeWidth="8" />
        <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dashArray} ${CIRCUMFERENCE - dashArray}`} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, lineHeight: 1, color }}>{animatedScore}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/100</span>
      </div>
    </div>
  )
}

export function ScoreLabelOnly({ score }) {
  const color = getScoreColor(score)
  const label = getScoreLabel(score)
  return <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color }}>{label}</div>
}

export default function ScoreResult({ score, description }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const color = getScoreColor(score)
  const label = getScoreLabel(score)
  const dashArray = (animatedScore / 100) * CIRCUMFERENCE
  const dashOffset = CIRCUMFERENCE - dashArray

  useEffect(() => {
    const start = Date.now()
    const duration = 1200
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score])

  return (
    <motion.div
      style={styles.wrap}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div style={styles.ringWrap}>
        <svg style={styles.svg} viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="8"
          />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dashArray} ${CIRCUMFERENCE - dashArray}`}
            style={{ transition: 'none' }}
          />
        </svg>
        <div style={styles.scoreInner}>
          <span style={{ ...styles.scoreNum, color }}>{animatedScore}</span>
          <span style={styles.scoreSub}>/100</span>
        </div>
      </div>
      <div style={{ ...styles.scoreLabel, color }}>{label}</div>
      <div style={styles.scoreDesc}>{description}</div>
    </motion.div>
  )
}
