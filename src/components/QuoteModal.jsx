import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import InlineLeadForm from './InlineLeadForm'

/*
 * Global quote/consultation modal. Mounted once (in App). Any component can
 * open it via openQuote({ service, source }) from ../lib/quote — the form
 * submits straight to Supabase without navigating away.
 */
export default function QuoteModal() {
  const [open, setOpen] = useState(false)
  const [ctx, setCtx] = useState({ service: null, source: 'quote-modal', heading: 'Book a free consultation' })

  useEffect(() => {
    const onOpen = (e) => {
      setCtx({
        service: e.detail?.service ?? null,
        source: e.detail?.source ?? 'quote-modal',
        heading: e.detail?.heading ?? 'Book a free consultation',
      })
      setOpen(true)
    }
    window.addEventListener('ensurio:quote', onOpen)
    return () => window.removeEventListener('ensurio:quote', onOpen)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  return (
    <div
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(13,27,75,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', width: '100%', maxWidth: '440px', maxHeight: '92vh', overflowY: 'auto', background: 'var(--white)', boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2, background: 'rgba(255,255,255,0.9)', border: 'none', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={18} color="var(--navy)" />
        </button>
        <InlineLeadForm service={ctx.service} source={ctx.source} heading={ctx.heading} cta="Request a Callback" />
      </div>
    </div>
  )
}
