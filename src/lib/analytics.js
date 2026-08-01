/*
 * Analytics — a thin wrapper over gtag.
 *
 * Everything no-ops when gtag is absent (ad blockers, local dev, a preview with
 * the tag stripped), so nothing here can break a form submission. Analytics
 * failing must never cost a lead.
 *
 * The events exist to answer one question the leads table cannot: how many
 * people START a tool versus finish it. Supabase already tells you how many
 * submitted, which is the numerator. Without the denominator you cannot tell a
 * tool nobody wants from a tool everybody abandons at question three.
 */

const GA_ID = 'G-VDYR2B06QG'

const gtag = (...args) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args)
  }
}

/**
 * Send an event. Parameters with null/undefined values are dropped, because
 * GA4 shows them as "(not set)" rather than omitting them.
 */
export function track(name, params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== ''),
  )
  gtag('event', name, clean)
}

/**
 * Register a route change. gtag fires its own page_view on load, but this is a
 * single-page app — every navigation after the first is invisible to GA unless
 * we say so.
 */
export function trackPageView(path) {
  gtag('config', GA_ID, { page_path: path, send_page_view: true })
}

/* ── The three tool events ─────────────────────────────────────────────── */

// Someone answered the first question. The denominator.
export const trackToolStart = (toolId) => track('tool_start', { tool_id: toolId })

// They reached a result without giving details — the tool did its job even if
// they never convert, and the gap between this and tool_submit is the price of
// the gate.
export const trackToolComplete = (toolId, score) =>
  track('tool_complete', { tool_id: toolId, score })

// The conversion. Mark this one as a key event in GA4.
export const trackLeadSubmit = ({ toolId, service, source, score }) =>
  track('lead_submit', { tool_id: toolId, service, source, score })
