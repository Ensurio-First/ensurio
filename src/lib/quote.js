// Open the global quote/consultation modal from anywhere.
// Pass { service, source } so the resulting lead is tagged with context.
export function openQuote(detail = {}) {
  window.dispatchEvent(new CustomEvent('ensurio:quote', { detail }))
}
