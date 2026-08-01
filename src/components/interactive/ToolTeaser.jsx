import { Link } from 'react-router-dom'
import { ArrowRight, Gauge } from 'lucide-react'

/*
 * A compact hand-off from an article to the tool that matches it.
 *
 * Blog traffic arrives mid-problem — someone searching "cargo insurance
 * warehouse to warehouse" already suspects they have a gap. Ending that article
 * with "book a consultation" asks them to jump straight from a suspicion to a
 * meeting. Offering the two-minute check instead meets them at the size of
 * commitment they are actually ready for.
 *
 * Deliberately quiet: an inline card, not a takeover. The article is doing the
 * work of earning attention and should not be interrupted by a sales panel.
 */
export default function ToolTeaser({ isMobile, title, prompt, href, ctaLabel = 'Check your cover — 2 min' }) {
  if (!href) return null

  return (
    <Link
      to={href}
      style={{
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '0.9rem' : '1.5rem',
        border: '1px solid var(--border)',
        borderLeft: '4px solid var(--teal)',
        background: 'var(--light-bg)',
        padding: isMobile ? '1.15rem 1.25rem' : '1.35rem 1.6rem',
        margin: '1.75rem 0',
        textDecoration: 'none',
        transition: 'background 0.18s, border-color 0.18s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--teal-pale)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--light-bg)' }}
    >
      <span style={{ width: '40px', height: '40px', flexShrink: 0, background: 'var(--white)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Gauge size={20} color="var(--teal-dark)" />
      </span>

      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '15px' : '16px', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.35 }}>
          {title}
        </div>
        {prompt && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '3px' }}>
            {prompt}
          </div>
        )}
      </div>

      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', flexShrink: 0, background: 'var(--teal)', color: '#fff', padding: '11px 20px', fontFamily: 'var(--font-body)', fontSize: '13.5px', fontWeight: 700, whiteSpace: 'nowrap' }}>
        {ctaLabel} <ArrowRight size={14} />
      </span>
    </Link>
  )
}
