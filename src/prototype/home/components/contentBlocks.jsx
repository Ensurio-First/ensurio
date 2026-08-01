import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Shield, Target, Truck, Users, Flame, Gem, Lock, Building2, Store, Package, Check, ArrowRight, Phone,
} from 'lucide-react'
import CoverageCheck from '../../../components/interactive/CoverageCheck'
import scrollToCheck, { CHECK_ANCHOR_ID } from '../../../components/interactive/scrollToCheck'

/*
 * Shared content-block system. Drives both the blog (BlogPostPage) and the
 * service/solution pages (ServicePage) from a `body` array of typed blocks.
 * Render a block with <Block block={block} isMobile={isMobile} />.
 */

const ICONS = { shield: Shield, target: Target, truck: Truck, users: Users, flame: Flame, gem: Gem, lock: Lock, building: Building2, store: Store, package: Package }

/* ── Attention: key-stat panel (light, gold-accented) ── */
function StatHero({ block, isMobile }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.25rem' : '2.5rem', alignItems: 'center', background: 'var(--light-bg)', borderLeft: '4px solid var(--gold)', padding: isMobile ? '1.5rem 1.25rem' : '2.4rem 2.5rem', margin: '1.25rem 0 2rem' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: isMobile ? '2.7rem' : '3.7rem', color: 'var(--gold)', lineHeight: 1, letterSpacing: '-0.03em' }}>{block.big}</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: isMobile ? '1.3rem' : '1.55rem', color: 'var(--navy)', letterSpacing: '-0.02em', margin: '0.6rem 0 0', maxWidth: '20ch' }}>{block.headline}</h2>
      </div>
      <div style={{ borderLeft: isMobile ? 'none' : '1px solid var(--border-dark)', paddingLeft: isMobile ? 0 : '2.5rem' }}>
        {block.text && <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-mid)', fontSize: isMobile ? '14px' : '15.5px', lineHeight: 1.7, margin: '0 0 1.1rem' }}>{block.text}</p>}
        {block.stats && (
          <div style={{ display: 'flex', gap: isMobile ? '1.5rem' : '2rem', flexWrap: 'wrap' }}>
            {block.stats.map((s, i) => (
              <div key={i} style={{ borderTop: '2px solid var(--teal)', paddingTop: '0.5rem' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: isMobile ? '1.05rem' : '1.2rem', color: 'var(--navy)' }}>{s.n}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', maxWidth: '24ch' }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Interest: bold lead sentence ── */
function LeadLine({ block, isMobile }) {
  return (
    <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', fontSize: isMobile ? '1.1rem' : '1.35rem', lineHeight: 1.45, letterSpacing: '-0.01em', margin: '0.25rem 0 1.4rem', maxWidth: '32ch' }}>
      {block.text}
    </p>
  )
}

/* ── Interest: chip strip / tags ── */
function Chips({ block, isMobile }) {
  const highlight = block.highlight || 0
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '0.25rem 0 1.5rem' }}>
      {block.items.map((label, i) => {
        const on = i < highlight
        return (
          <span key={label} style={{ border: `1px solid ${on ? 'var(--teal)' : 'var(--border-dark)'}`, background: on ? 'var(--teal-pale)' : 'var(--light-bg)', color: on ? 'var(--teal-dark)' : 'var(--text-mid)', fontFamily: 'var(--font-body)', fontSize: isMobile ? '12.5px' : '13px', fontWeight: 600, padding: '7px 14px' }}>{label}</span>
        )
      })}
    </div>
  )
}

/* ── Interest/Desire: icon card grid (risk = teal, cover = gold) ── */
function CardGrid({ block, isMobile }) {
  const gold = block.variant === 'cover'
  const cols = isMobile ? 1 : (block.columns || 3)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1px', background: 'var(--border)', margin: '0.25rem 0 1.75rem' }}>
      {block.items.map((it, i) => {
        const Icon = ICONS[it.icon] || Shield
        return (
          <div key={i} style={{ background: 'var(--white)', padding: isMobile ? '1.1rem' : '1.25rem', borderTop: gold ? '2px solid var(--gold)' : 'none' }}>
            <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: gold ? 'var(--gold-soft)' : 'var(--teal-pale)', color: gold ? 'var(--gold-dark)' : 'var(--teal)', marginBottom: '0.75rem' }}>
              <Icon size={20} />
            </div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', fontSize: '0.98rem', margin: '0 0 0.25rem' }}>{it.title}</h4>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>{it.text}</p>
          </div>
        )
      })}
    </div>
  )
}

/* ── Interest: quiet exclusions panel ── */
function Exclusions({ block, isMobile }) {
  return (
    <div style={{ background: 'var(--light-bg)', border: '1px solid var(--border)', padding: isMobile ? '1.1rem 1.25rem' : '1.4rem 1.6rem', margin: '0.25rem 0 1.75rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px 32px' }}>
        {block.items.map((label) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: '13.5px' }}>
            <span style={{ width: '18px', height: '18px', flexShrink: 0, border: '1px solid var(--border-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
              <span style={{ width: '8px', height: '1.5px', background: 'currentColor', display: 'block' }} />
            </span>
            <span style={{ textDecoration: 'line-through', textDecorationColor: 'var(--border-dark)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Desire: cost comparison bars + factor chips ── */
function CostBars({ block, isMobile }) {
  return (
    <div style={{ border: '1px solid var(--border)', background: 'var(--white)', padding: isMobile ? '1.1rem 1.25rem' : '1.5rem 1.6rem', margin: '0.25rem 0 1.75rem' }}>
      {block.bars.map((b, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '92px 1fr' : '130px 1fr auto', alignItems: 'center', gap: isMobile ? '10px' : '14px', marginBottom: '14px' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--navy)' }}>{b.who}</span>
          <span style={{ position: 'relative', height: '30px', background: 'var(--light-bg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', inset: '0 auto 0 0', width: b.level === 'hi' ? '88%' : '26%', background: b.level === 'hi' ? 'linear-gradient(90deg, var(--gold), var(--gold-dark))' : 'linear-gradient(90deg, var(--teal), var(--teal-dark))' }} />
          </span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--navy)', fontSize: '0.9rem', gridColumn: isMobile ? '2' : 'auto', textAlign: isMobile ? 'right' : 'left' }}>{b.amount}</span>
        </div>
      ))}
      {block.factors && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '1rem' }}>
          {block.factors.map((f) => (
            <span key={f} style={{ border: '1px solid var(--border-dark)', background: 'var(--light-bg)', color: 'var(--text-mid)', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, padding: '5px 11px' }}>{f}</span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Desire: ticked checklist (2-up on desktop) ── */
function Checklist({ block, isMobile }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? '0' : '0 2.5rem', margin: '0.25rem 0 1.75rem' }}>
      {block.items.map((it, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ width: '22px', height: '22px', flexShrink: 0, background: 'var(--teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} strokeWidth={3} /></span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '14px' : '15px', color: 'var(--text-dark)', lineHeight: 1.6 }}>
            {it.strong ? <b style={{ color: 'var(--navy)' }}>{it.strong}</b> : null}{it.strong ? ' ' : ''}{it.text}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Desire: numbered step timeline ── */
function Steps({ block, isMobile }) {
  return (
    <div style={{ margin: '0.25rem 0 1.75rem' }}>
      {block.items.map((it, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '46px 1fr', gap: '16px', padding: '15px 0', borderBottom: i < block.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <span style={{ width: '42px', height: '42px', background: 'var(--navy)', color: 'var(--teal)', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{String(i + 1).padStart(2, '0')}</span>
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', fontSize: '1rem', margin: '2px 0 3px' }}>{it.title}</h4>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{it.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Action: inline CTA band ── */
function CtaBand({ block, isMobile }) {
  return (
    <div style={{ background: 'linear-gradient(120deg, var(--navy), var(--navy-mid))', color: '#fff', borderLeft: '3px solid var(--teal)', padding: isMobile ? '1.5rem 1.25rem' : '1.85rem 2rem', margin: '1rem 0 1.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
      <div>
        <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: isMobile ? '1.2rem' : '1.35rem', letterSpacing: '-0.02em', margin: '0 0 0.35rem' }}>{block.heading}</h3>
        {block.text && <p style={{ color: 'rgba(255,255,255,0.66)', fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.6, margin: 0, maxWidth: '46ch' }}>{block.text}</p>}
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
        {block.primary && <Link to={block.primary.href || '/contact'} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', background: 'var(--teal)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>{block.primary.label} <ArrowRight size={15} /></Link>}
        {block.secondary && <a href={block.secondary.href} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.32)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}><Phone size={15} /> {block.secondary.label}</a>}
      </div>
    </div>
  )
}

/* ── Interest: FAQ accordion (navy active card) ── */
function FaqAccordion({ items, isMobile }) {
  const [open, setOpen] = useState(null)
  const padX = isMobile ? 16 : 22

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '0.75rem 0 1.5rem' }}>
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div
            key={i}
            style={{
              background: isOpen ? 'var(--navy)' : 'var(--white)',
              border: `1px solid ${isOpen ? 'var(--navy)' : 'var(--border)'}`,
              borderLeft: `3px solid ${isOpen ? 'var(--teal)' : 'transparent'}`,
              boxShadow: isOpen ? '0 12px 30px rgba(13,27,75,0.18)' : 'none',
              transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => { if (!isOpen) { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.borderLeftColor = 'var(--teal)' } }}
            onMouseLeave={(e) => { if (!isOpen) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.borderLeftColor = 'transparent' } }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: isMobile ? `0.95rem ${padX}px` : `1.15rem ${padX}px`, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ flex: 1, fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.98rem' : '1.1rem', fontWeight: 700, color: isOpen ? 'var(--white)' : 'var(--navy)', lineHeight: 1.4, transition: 'color 0.25s' }}>
                {item.q}
              </span>
              <span style={{ flexShrink: 0, position: 'relative', width: isMobile ? '20px' : '22px', height: isMobile ? '20px' : '22px' }} aria-hidden="true">
                <span style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2px', marginTop: '-1px', background: 'var(--teal)', transition: 'background 0.25s' }} />
                <span style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: '2px', marginLeft: '-1px', background: isOpen ? 'var(--teal)' : 'var(--navy)', transform: isOpen ? 'scaleY(0)' : 'scaleY(1)', transition: 'transform 0.28s ease, background 0.25s' }} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '14.5px' : '15.5px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.85, margin: 0, padding: isMobile ? `0 ${padX}px 1.1rem` : `0 ${padX}px 1.3rem` }}>
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

const fmtAED = (n) => 'AED ' + Math.round(n).toLocaleString('en-US')

/* ── Engagement tool: interactive premium estimator ── */
function PremiumEstimator({ block, isMobile }) {
  const cfg = block.config
  const [vals, setVals] = useState(() => cfg.fields.map((f) => f.default))
  const set = (i, v) => setVals((prev) => prev.map((x, idx) => (idx === i ? v : x)))
  const est = cfg.estimate(vals)

  // A price is only meaningful if the cover behind it is right, so hand the
  // visitor on to the page's check. Detected after mount rather than threaded
  // through as a prop — the check renders in the same pass, further down.
  const [hasCheck, setHasCheck] = useState(false)
  useEffect(() => { setHasCheck(Boolean(document.getElementById(CHECK_ANCHOR_ID))) }, [])

  return (
    <div style={{ border: '1px solid var(--teal)', borderTop: '4px solid var(--teal)', background: 'var(--white)', boxShadow: 'var(--shadow-md)', margin: '1.25rem 0 2rem' }}>
      <div style={{ padding: isMobile ? '1.25rem' : '1.75rem 2rem' }}>
        <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--teal-dark)', background: 'var(--teal-pale)', padding: '3px 9px' }}>Instant estimate</span>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--navy)', fontSize: isMobile ? '1.2rem' : '1.4rem', letterSpacing: '-0.02em', margin: '0.75rem 0 0.35rem' }}>{cfg.title}</h3>
        {cfg.note && <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-muted)', margin: '0 0 1.4rem', lineHeight: 1.6 }}>{cfg.note}</p>}

        {cfg.fields.map((f, i) => (
          <div key={f.label} style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '7px' }}>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--navy)' }}>{f.label}</label>
              {f.type !== 'select' && <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13.5px', fontWeight: 800, color: 'var(--teal-dark)' }}>{f.format ? f.format(vals[i]) : vals[i]}{f.unit ? ` ${f.unit}` : ''}</span>}
            </div>
            {f.type === 'select' ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {f.options.map((opt) => {
                  const on = vals[i] === opt.value
                  return (
                    <button key={opt.value} onClick={() => set(i, opt.value)} style={{ flex: 1, minWidth: '84px', padding: '9px 10px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: `1px solid ${on ? 'var(--teal)' : 'var(--border-dark)'}`, background: on ? 'var(--teal-pale)' : 'var(--light-bg)', color: on ? 'var(--teal-dark)' : 'var(--text-mid)' }}>{opt.label}</button>
                  )
                })}
              </div>
            ) : (
              <input type="range" min={f.min} max={f.max} step={f.step} value={vals[i]} onChange={(e) => set(i, Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--teal)' }} />
            )}
          </div>
        ))}

        <div style={{ background: 'var(--navy)', color: '#fff', padding: isMobile ? '1.1rem 1.25rem' : '1.25rem 1.5rem', marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Indicative annual premium</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: isMobile ? '1.4rem' : '1.7rem', color: 'var(--gold)', letterSpacing: '-0.01em' }}>{fmtAED(est.low)} – {fmtAED(est.high)}</div>
          </div>
          <Link to={(cfg.cta && cfg.cta.href) || '/contact'} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', background: 'var(--teal)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>{(cfg.cta && cfg.cta.label) || 'Get an exact quote'} <ArrowRight size={15} /></Link>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', color: 'var(--text-light)', margin: '0.75rem 0 0', fontStyle: 'italic' }}>Indicative only, based on typical market rates. Request a formal quote for exact pricing.</p>
        {hasCheck && (
          <button type="button" onClick={scrollToCheck}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '0.9rem', padding: 0, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13.5px', fontWeight: 700, color: 'var(--teal-dark)', textAlign: 'left' }}>
            A price only means something if the cover behind it is right — check yours <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Dispatcher — render any block by type ── */
export function Block({ block, isMobile }) {
  switch (block.type) {
    case 'stathero': return <StatHero block={block} isMobile={isMobile} />
    case 'lead': return <LeadLine block={block} isMobile={isMobile} />
    case 'chips': return <Chips block={block} isMobile={isMobile} />
    case 'cardgrid': return <CardGrid block={block} isMobile={isMobile} />
    case 'exclusions': return <Exclusions block={block} isMobile={isMobile} />
    case 'costbars': return <CostBars block={block} isMobile={isMobile} />
    case 'checklist': return <Checklist block={block} isMobile={isMobile} />
    case 'steps': return <Steps block={block} isMobile={isMobile} />
    case 'cta': return <CtaBand block={block} isMobile={isMobile} />
    case 'estimator': return <PremiumEstimator block={block} isMobile={isMobile} />
    case 'gapcheck': return <CoverageCheck block={block} isMobile={isMobile} />
    case 'faq': return <FaqAccordion items={block.items} isMobile={isMobile} />
    case 'h2': return (
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', margin: isMobile ? '1.75rem 0 0.75rem' : '2.5rem 0 1rem' }}>{block.text}</h2>
    )
    case 'h3': return (
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.05rem' : '1.2rem', fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.01em', margin: isMobile ? '1.5rem 0 0.5rem' : '1.75rem 0 0.6rem' }}>{block.text}</h3>
    )
    case 'ul': return (
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}>
        {block.items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.55rem' }}>
            <span style={{ width: '6px', height: '6px', background: 'var(--teal)', flexShrink: 0, marginTop: '8px', borderRadius: 0, display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '15px' : '16px', color: 'var(--text-dark)', lineHeight: 1.7 }}>{item}</span>
          </li>
        ))}
      </ul>
    )
    case 'quote': return (
      <blockquote style={{ borderLeft: '3px solid var(--teal)', background: 'var(--teal-pale)', padding: isMobile ? '1rem 1.25rem' : '1.5rem 2rem', margin: isMobile ? '1.5rem 0' : '2rem 0', fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.5, fontStyle: 'italic' }}>{block.text}</blockquote>
    )
    default: return (
      <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '15px' : '16.5px', color: 'var(--text-dark)', lineHeight: 1.85, margin: '0 0 1.25rem' }}>{block.text}</p>
    )
  }
}
