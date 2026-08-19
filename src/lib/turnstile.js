/*
 * Cloudflare Turnstile, loaded on demand and rendered at submit time.
 *
 * Every lead submission asks this module for a token, which the submit-lead
 * edge function verifies server-side. The widget is created invisibly per
 * request ('interaction-only' shows UI only if Cloudflare decides it must
 * challenge), so no form needs to render or manage a widget of its own.
 *
 * This module never blocks a submission: no site key, a blocked script, or a
 * Cloudflare outage all resolve to null and the form submits without a token.
 * The edge function quarantines tokenless leads rather than dropping them, so
 * the worst case for a real visitor is a manual review, never a lost enquiry.
 */

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITEKEY

let scriptPromise = null

function loadScript() {
  if (typeof window !== 'undefined' && window.turnstile) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      s.async = true
      s.onload = resolve
      // Reset so a transient network failure retries on the next submission.
      s.onerror = () => { scriptPromise = null; s.remove(); reject(new Error('turnstile-script')) }
      document.head.appendChild(s)
    })
  }
  return scriptPromise
}

/** @returns {Promise<string|null>} a Turnstile token, or null if unavailable */
export async function getTurnstileToken(action = 'submit-lead') {
  if (!SITE_KEY) return null
  try {
    await loadScript()
  } catch {
    return null
  }

  return new Promise((resolve) => {
    // Bottom corner, above everything: invisible normally, but if Cloudflare
    // escalates to an interactive check the visitor must be able to see it.
    const host = document.createElement('div')
    host.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:2147483647;'
    document.body.appendChild(host)

    let widgetId = null
    let settled = false
    const done = (token) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try { if (widgetId !== null) window.turnstile.remove(widgetId) } catch { /* already gone */ }
      host.remove()
      resolve(token)
    }
    // If Cloudflare never answers, submit without a token rather than hanging
    // the form on a spinner.
    const timer = setTimeout(() => done(null), 12000)

    try {
      widgetId = window.turnstile.render(host, {
        sitekey: SITE_KEY,
        action,
        appearance: 'interaction-only',
        callback: (token) => done(token),
        'error-callback': () => done(null),
        'unsupported-callback': () => done(null),
      })
      if (widgetId === null || widgetId === undefined) done(null)
    } catch {
      done(null)
    }
  })
}
