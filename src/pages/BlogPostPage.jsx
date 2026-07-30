import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useParams, Navigate } from 'react-router-dom'
import {
  Clock, ArrowLeft, ArrowRight, Phone,
  Shield, Target, Truck, Users, Flame, Gem, Lock, Building2, Store, Package, Check,
} from 'lucide-react'
import ProtoNav from '../prototype/home/components/ProtoNav'
import ProtoFooter from '../prototype/home/components/ProtoFooter'
import { useIsMobile } from '../prototype/home/hooks/useIsMobile'
import { blogPosts, getPostBySlug } from '../prototype/home/data/blog.js'
import '../prototype/prototype.css'

const ICONS = { shield: Shield, target: Target, truck: Truck, users: Users, flame: Flame, gem: Gem, lock: Lock, building: Building2, store: Store, package: Package }

/* ── Attention: key-stat panel (light, gold-accented — contrasts with the dark hero) ── */
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
              {/* Question */}
              <span style={{ flex: 1, fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.98rem' : '1.1rem', fontWeight: 700, color: isOpen ? 'var(--white)' : 'var(--navy)', lineHeight: 1.4, transition: 'color 0.25s' }}>
                {item.q}
              </span>
              {/* Morphing + / − toggle */}
              <span style={{ flexShrink: 0, position: 'relative', width: isMobile ? '20px' : '22px', height: isMobile ? '20px' : '22px' }} aria-hidden="true">
                <span style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2px', marginTop: '-1px', background: 'var(--teal)', transition: 'background 0.25s' }} />
                <span style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: '2px', marginLeft: '-1px', background: isOpen ? 'var(--teal)' : 'var(--navy)', transform: isOpen ? 'scaleY(0)' : 'scaleY(1)', transition: 'transform 0.28s ease, background 0.25s' }} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
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

function ArticleBody({ block, isMobile }) {
  if (block.type === 'stathero') return <StatHero block={block} isMobile={isMobile} />
  if (block.type === 'lead') return <LeadLine block={block} isMobile={isMobile} />
  if (block.type === 'chips') return <Chips block={block} isMobile={isMobile} />
  if (block.type === 'cardgrid') return <CardGrid block={block} isMobile={isMobile} />
  if (block.type === 'exclusions') return <Exclusions block={block} isMobile={isMobile} />
  if (block.type === 'costbars') return <CostBars block={block} isMobile={isMobile} />
  if (block.type === 'checklist') return <Checklist block={block} isMobile={isMobile} />
  if (block.type === 'steps') return <Steps block={block} isMobile={isMobile} />
  if (block.type === 'cta') return <CtaBand block={block} isMobile={isMobile} />
  if (block.type === 'faq') {
    return <FaqAccordion items={block.items} isMobile={isMobile} />
  }
  if (block.type === 'h2') {
    return (
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', margin: isMobile ? '1.75rem 0 0.75rem' : '2.5rem 0 1rem' }}>
        {block.text}
      </h2>
    )
  }
  if (block.type === 'h3') {
    return (
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.05rem' : '1.2rem', fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.01em', margin: isMobile ? '1.5rem 0 0.5rem' : '1.75rem 0 0.6rem' }}>
        {block.text}
      </h3>
    )
  }
  if (block.type === 'ul') {
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}>
        {block.items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.55rem' }}>
            <span style={{ width: '6px', height: '6px', background: 'var(--teal)', flexShrink: 0, marginTop: '8px', borderRadius: 0, display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '15px' : '16px', color: 'var(--text-dark)', lineHeight: 1.7 }}>{item}</span>
          </li>
        ))}
      </ul>
    )
  }
  if (block.type === 'quote') {
    return (
      <blockquote style={{ borderLeft: '3px solid var(--teal)', background: 'var(--teal-pale)', padding: isMobile ? '1rem 1.25rem' : '1.5rem 2rem', margin: isMobile ? '1.5rem 0' : '2rem 0', fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.5, fontStyle: 'italic' }}>
        {block.text}
      </blockquote>
    )
  }
  return (
    <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '15px' : '16.5px', color: 'var(--text-dark)', lineHeight: 1.85, margin: '0 0 1.25rem' }}>
      {block.text}
    </p>
  )
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const isMobile = useIsMobile()
  const post = getPostBySlug(slug)

  // Apply the post's SEO meta title / description while it is mounted, then
  // restore the previous values on unmount.
  useEffect(() => {
    if (!post) return
    const prevTitle = document.title
    document.title = post.metaTitle || `${post.title} | Insure First`

    let meta = document.querySelector('meta[name="description"]')
    let created = false
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
      created = true
    }
    const prevDesc = meta.getAttribute('content')
    meta.setAttribute('content', post.metaDescription || post.excerpt)

    return () => {
      document.title = prevTitle
      if (created) meta.remove()
      else if (prevDesc !== null) meta.setAttribute('content', prevDesc)
    }
  }, [post])

  if (!post) return <Navigate to="/blog" replace />

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111827' }}>
      <ProtoNav />
      <main>
        {/* Hero */}
        <section style={{ position: 'relative', borderBottom: '3px solid var(--teal)', overflow: 'hidden' }}>
          <img src={post.image} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,27,75,0.78)' }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '3rem 0.75rem' : '4.5rem 4rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <Link to="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Home</Link>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/</span>
                <Link to="/blog" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Insights</Link>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/</span>
                <span style={{ fontSize: '13px', color: 'var(--teal)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{post.tag}</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.65rem' : 'clamp(1.9rem, 3.2vw, 2.75rem)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '1.5rem', maxWidth: '900px' }}>
                {post.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{post.author}</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{post.date}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={12} color="rgba(255,255,255,0.6)" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{post.readTime}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Article body */}
        <article style={{ background: 'var(--white)', padding: isMobile ? '2.5rem 0' : '4rem 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
            {post.body.map((block, i) => (
              <ArticleBody key={i} block={block} isMobile={isMobile} />
            ))}

            {/* Back link */}
            <div style={{ marginTop: isMobile ? '2rem' : '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: 'var(--teal)', textDecoration: 'none' }}>
                <ArrowLeft size={15} /> Back to all articles
              </Link>
            </div>
          </div>
        </article>

        {/* CTA */}
        <section style={{ background: 'var(--navy)', borderTop: '3px solid var(--teal)', padding: isMobile ? '2.5rem 0' : '3.5rem 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.3rem' : '1.6rem', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                Have a question about your cover?
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(255,255,255,0.65)', margin: 0, maxWidth: '480px', lineHeight: 1.7 }}>
                Book a no-obligation consultation and we will review exactly where your insurance stands today.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flexShrink: 0 }}>
              <Link to="/contact" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '13px 26px', background: 'var(--teal)', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Book a Consultation <ArrowRight size={15} />
              </Link>
              <a href="tel:+971509765976" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '13px 26px', background: 'transparent', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                <Phone size={15} /> Call Us
              </a>
            </div>
          </div>
        </section>

        {/* Related posts */}
        <section style={{ background: 'var(--light-bg)', padding: isMobile ? '3rem 0' : '4.5rem 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
            <div style={{ marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>
                Keep Reading
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', margin: 0 }}>
                Related Insights
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)' }}>
              {related.map((rp) => (
                <Link key={rp.slug} to={`/blog/${rp.slug}`} style={{ textDecoration: 'none' }}>
                  <article
                    style={{ background: 'var(--white)', display: 'flex', flexDirection: 'column', cursor: 'pointer', overflow: 'hidden', height: '100%' }}
                    onMouseEnter={(e) => { const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1.04)' }}
                    onMouseLeave={(e) => { const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1)' }}
                  >
                    <div style={{ overflow: 'hidden', height: isMobile ? '160px' : '180px', flexShrink: 0 }}>
                      <img src={rp.image} alt={rp.imageAlt || rp.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} />
                    </div>
                    <div style={{ padding: isMobile ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, borderTop: '3px solid var(--teal)' }}>
                      <div style={{ display: 'inline-block', alignSelf: 'flex-start', background: 'var(--teal-pale)', color: 'var(--teal-dark)', padding: '4px 10px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-body)', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                        {rp.tag}
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.4, margin: 0 }}>
                        {rp.title}
                      </h3>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <ProtoFooter />
    </div>
  )
}
