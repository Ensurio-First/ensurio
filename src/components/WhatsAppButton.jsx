import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import botIcon from '../assets/bot.png'

const WA_NUMBER = '971509765976'
const WA_MESSAGE = 'Hello! I found Ensurio First online and would like to learn more about your services.'
const BOT_URL = 'https://wa.me/971509765976?text=I+want+to+chat+with+the+Ensurio+bot'

const BANNER_HEIGHT = 56 // approx banner height in px

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false)
  const [bannerUp, setBannerUp] = useState(false)
  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`

  useEffect(() => {
    const on  = () => setBannerUp(true)
    const off = () => setBannerUp(false)
    window.addEventListener('ensurio:banner-on', on)
    window.addEventListener('ensurio:banner-off', off)
    return () => {
      window.removeEventListener('ensurio:banner-on', on)
      window.removeEventListener('ensurio:banner-off', off)
    }
  }, [])

  const isMobile = window.innerWidth < 600
  const bottomOffset = (bannerUp && isMobile) ? 28 + BANNER_HEIGHT + 10 : 28

  return (
    <motion.div
      animate={{ bottom: bottomOffset }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{ position: 'fixed', bottom: bottomOffset, right: '28px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}
    >

      {/* Popup options */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              background: 'var(--white)',
              boxShadow: '0 8px 32px rgba(13,27,75,0.18)',
              overflow: 'hidden',
              minWidth: '210px',
            }}
          >
            {/* Header */}
            <div style={{ background: 'var(--navy)', padding: '10px 14px' }}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>Ensurio First</p>
              <p style={{ fontSize: '13px', color: 'var(--white)', fontWeight: 600 }}>How can we help?</p>
            </div>

            {/* Options */}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', textDecoration: 'none', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f0faf7')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ width: '32px', height: '32px', background: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4.5C9.596 4.5 4.5 9.596 4.5 16c0 2.262.638 4.376 1.745 6.17L4.5 27.5l5.494-1.73A11.46 11.46 0 0016 27.5c6.404 0 11.5-5.096 11.5-11.5S22.404 4.5 16 4.5z" fill="#25D366"/>
                  <path d="M21.77 18.617c-.295-.148-1.748-.862-2.019-.961-.27-.099-.467-.148-.663.148-.197.295-.763.961-.935 1.158-.172.197-.344.222-.639.074-.295-.148-1.245-.459-2.372-1.464-.877-.781-1.468-1.747-1.64-2.042-.172-.295-.018-.454.129-.601.132-.132.295-.344.443-.516.148-.172.197-.295.295-.492.099-.197.049-.37-.025-.517-.074-.148-.663-1.6-.908-2.19-.24-.577-.483-.498-.663-.507l-.565-.01c-.197 0-.517.074-.787.37s-1.033 1.01-1.033 2.462 1.057 2.856 1.205 3.054c.148.197 2.08 3.175 5.04 4.453.705.304 1.255.486 1.684.622.707.225 1.351.193 1.86.117.567-.085 1.748-.714 1.995-1.404.246-.69.246-1.281.172-1.404-.073-.123-.27-.197-.565-.344z" fill="#fff"/>
                </svg>
              </span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>Talk on WhatsApp</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chat with our team</div>
              </div>
            </a>

            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', textDecoration: 'none', transition: 'background 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f0faf7')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ width: '32px', height: '32px', background: 'var(--navy)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                <img src={botIcon} alt="Bot" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              </span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>Talk to Bot</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Instant AI assistance</div>
              </div>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: '58px', height: '58px', borderRadius: '50%',
          background: open ? 'var(--navy)' : 'var(--teal)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(13,27,75,0.3)',
          transition: 'background 0.25s',
          padding: 0, overflow: 'hidden',
        }}
        aria-label="Chat with us"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} style={{ fontSize: '22px', color: 'var(--white)', lineHeight: 1 }}>
              ×
            </motion.span>
          ) : (
            <motion.img key="bot" src={botIcon} alt="Chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
          )}
        </AnimatePresence>
      </motion.button>

    </motion.div>
  )
}
