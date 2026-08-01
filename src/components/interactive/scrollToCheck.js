/*
 * Every content page renders at most one on-page check, anchored with this id.
 * Hero CTAs and the closing band both point at it rather than sending the
 * visitor to /contact to start over.
 */
export const CHECK_ANCHOR_ID = 'page-check'

export default function scrollToCheck() {
  const el = typeof document !== 'undefined' && document.getElementById(CHECK_ANCHOR_ID)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
