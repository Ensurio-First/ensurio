/*
 * Zoho SalesIQ — a thin wrapper over the widget's JS API.
 *
 * Same rule as analytics.js: everything no-ops when the widget is absent (ad
 * blockers, local dev, a preview without the script). Chat failing must never
 * cost a lead, so nothing here is allowed to throw into a form submission.
 *
 * The widget is loaded from index.html, which also owns the `ready` callback —
 * it has to be assigned before the widget script runs, and this module loads
 * with the React bundle, far too late to win that race.
 *
 * Deliberately NOT used: $zoho.salesiq.reset(). It reads like the SPA
 * navigation hook but it clears cookies, ends any connected chat abruptly and
 * makes the person a brand-new visitor. On a route change that would hang up on
 * someone mid-conversation.
 */

// Calls made before the widget is ready get queued. Capped because when the
// widget is blocked, ready never fires and this would otherwise grow with every
// navigation for the whole session.
const MAX_QUEUE = 20

const salesiq = () => (typeof window !== 'undefined' ? window.$zoho?.salesiq : undefined)

function whenReady(fn) {
  const siq = salesiq()
  if (!siq) return // script never got as far as index.html's stub

  if (window.__salesiqReady) {
    try { fn() } catch { /* ignore */ }
    return
  }

  const queue = (window.__salesiqQueue = window.__salesiqQueue || [])
  if (queue.length < MAX_QUEUE) queue.push(fn)
}

/**
 * Tell SalesIQ who it is talking to, so an operator opening the chat sees a
 * named person with their score and tool rather than "Visitor 42".
 *
 * Everything is optional — pass what you have.
 *
 * @param {object}  visitor
 * @param {string} [visitor.name]   Full name; split into first/last for the API
 * @param {string} [visitor.email]
 * @param {string} [visitor.phone]
 * @param {object} [visitor.info]   Extra key/value pairs shown to the operator
 */
export function identifyVisitor({ name, email, phone, info } = {}) {
  whenReady(() => {
    const v = salesiq()?.visitor
    if (!v) return

    if (name) {
      // The current API takes an object, not a string. Anything after the first
      // space is the surname — crude, but it is a single free-text field and
      // guessing harder would be worse.
      const [firstname, ...rest] = String(name).trim().split(/\s+/)
      v.name({ firstname, lastname: rest.join(' ') })
    }
    if (email) v.email(String(email))
    if (phone) v.contactnumber(String(phone))

    const clean = Object.fromEntries(
      Object.entries(info || {}).filter(([, val]) => val !== null && val !== undefined && val !== ''),
    )
    if (Object.keys(clean).length) v.info(clean)
  })
}

/**
 * Keep the operator's view of the current page in step with the router.
 *
 * SalesIQ reads the page when the widget loads. This is a single-page app, so
 * on every navigation after the first its idea of where the visitor is goes
 * stale — an operator would see the landing page while the person is three
 * pages deep. There is no documented API for "the page changed", so the path
 * goes in as a visitor field, which is refreshed on every call.
 */
export function trackSalesIQPage(path) {
  if (!path) return
  whenReady(() => {
    salesiq()?.visitor?.info({ 'Current page': path })
  })
}
