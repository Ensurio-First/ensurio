import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PremiumCheck from './PremiumCheck'
import FamilyCheck from './FamilyCheck'
import { useWindowWidth } from '../../hooks/useWindowWidth'

const TABS = [
  { id: 'iop',  icon: '🛡', label: 'Insurance Premium Check' },
  { id: 'fam',  icon: '🏛', label: 'Family Business Readiness' },
]

const cardShadow = '0 24px 64px rgba(13,27,75,0.28)'

/* ── Shared sub-components ─────────────────────────────────────────── */

function TealBar() {
  return <div style={{ height: '3px', background: 'var(--teal)', width: '100%' }} />
}

function HeaderLabel() {
  return (
    <p style={{
      fontSize: '13px', letterSpacing: '0.18em', textTransform: 'uppercase',
      color: 'var(--teal)', fontWeight: 700, marginBottom: '8px',
      fontFamily: 'var(--font-body)',
    }}>
      Free Diagnostic Tool
    </p>
  )
}

function HeaderTitle() {
  return (
    <p style={{
      fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800,
      color: 'var(--white)', lineHeight: 1.3,
    }}>
      Discover Your Risk Profile — Free in Minutes
    </p>
  )
}

/* ── Desktop landscape layout ──────────────────────────────────────── */
function LandscapeCard({ activeTab, setActiveTab, activeIdx }) {
  return (
    <div style={{ width: '100%', boxShadow: cardShadow, overflow: 'hidden' }}>
      {/* TOP: header + horizontal tabs */}
      <TealBar />
      <div style={{ background: 'var(--navy)', padding: '1.25rem 1.75rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <HeaderLabel />
            <HeaderTitle />
          </div>
        </div>

        {/* Horizontal tabs */}
        <div style={{ display: 'flex', position: 'relative' }}>
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '10px 16px 14px',
                border: 'none',
                background: 'transparent',
                color: activeTab === tab.id ? 'var(--white)' : 'rgba(255,255,255,0.4)',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                textAlign: 'center',
                lineHeight: 1.4,
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '15px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          {/* Sliding underline */}
          <motion.div
            layout
            style={{ position: 'absolute', bottom: 0, height: '3px', background: 'var(--teal)', width: '50%' }}
            animate={{ left: `${activeIdx * 50}%` }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          />
        </div>
      </div>

      {/* BOTTOM: form content */}
      <div style={{ background: 'var(--white)', padding: '1.5rem 1.75rem', position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'iop' ? (
            <motion.div key="iop"
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.22 }}
            >
              <PremiumCheck />
            </motion.div>
          ) : (
            <motion.div key="fam"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}
            >
              <FamilyCheck />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Mobile portrait layout (unchanged) ───────────────────────────── */
function PortraitCard({ activeTab, setActiveTab, activeIdx }) {
  return (
    <div style={{ background: 'var(--white)', boxShadow: cardShadow, overflow: 'hidden', width: '100%', maxWidth: '540px', margin: '0 auto' }}>
      <TealBar />
      <div style={{ background: 'var(--navy)', padding: '1.25rem 1.5rem 0' }}>
        <HeaderLabel />
        <HeaderTitle />

        <div style={{ display: 'flex', position: 'relative', marginTop: '1.25rem' }}>
          {TABS.map((tab, i) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '10px 12px 14px', border: 'none', background: 'transparent',
              color: activeTab === tab.id ? 'var(--white)' : 'rgba(255,255,255,0.4)',
              fontSize: '12px', fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'center',
              lineHeight: 1.4, transition: 'color 0.2s',
            }}>
              <span style={{ display: 'block', fontSize: '15px', marginBottom: '3px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          <motion.div layout style={{ position: 'absolute', bottom: 0, height: '3px', background: 'var(--teal)', width: '50%' }}
            animate={{ left: `${activeIdx * 50}%` }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          />
        </div>
      </div>

      <div style={{ padding: '1.5rem', minHeight: '420px', position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'iop' ? (
            <motion.div key="iop" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.25 }}>
              <PremiumCheck />
            </motion.div>
          ) : (
            <motion.div key="fam" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
              <FamilyCheck />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Root ──────────────────────────────────────────────────────────── */
export default function DiagnosticTool() {
  const [activeTab, setActiveTab] = useState('iop')
  const activeIdx = TABS.findIndex((t) => t.id === activeTab)
  const width = useWindowWidth()
  const isDesktop = width > 900

  return isDesktop
    ? <LandscapeCard activeTab={activeTab} setActiveTab={setActiveTab} activeIdx={activeIdx} />
    : <PortraitCard  activeTab={activeTab} setActiveTab={setActiveTab} activeIdx={activeIdx} />
}
