/*
 * Date and urgency formatting, shared by the Clients and Renewals views.
 *
 * Both screens are about the same question — how long until this lapses — and
 * two copies of the banding would drift into two different definitions of
 * "urgent" on two screens showing the same policy.
 */

/** "26 Feb 2027" — unambiguous in a way that 02/26/27 is not. */
export function formatDate(iso) {
  if (!iso) return null
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return String(iso)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${String(d).padStart(2, '0')} ${months[m - 1]} ${y}`
}

/*
 * Compared as calendar dates rather than timestamps, so a policy does not
 * appear to lapse early for anyone reading the portal from another timezone.
 */
export function daysUntil(iso) {
  if (!iso) return null
  const today = new Date().toISOString().slice(0, 10)
  const ms = Date.parse(`${String(iso).slice(0, 10)}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)
  return Math.round(ms / 86400000)
}

/*
 * Four bands, not a gradient. The column is scanned, not read: an advisor needs
 * "gone", "this month", "this quarter", "fine" at a glance, and a continuous
 * scale makes every row look mildly urgent.
 */
export function expiryTone(days) {
  if (days === null || days === undefined) return { color: 'var(--text-light)', weight: 400, bg: 'transparent' }
  if (days < 0) return { color: '#B42318', weight: 700, bg: '#FEF2F2' }
  if (days <= 30) return { color: '#B54708', weight: 700, bg: '#FFFAEB' }
  if (days <= 90) return { color: 'var(--gold-dark)', weight: 600, bg: 'transparent' }
  return { color: 'var(--text-mid)', weight: 500, bg: 'transparent' }
}

export function relativeLabel(days) {
  if (days === null || days === undefined) return null
  if (days < 0) return `${Math.abs(days)}d ago`
  if (days === 0) return 'today'
  return `${days}d`
}

/** "12 min ago" — for sync freshness, where precision past the unit is noise. */
export function ago(iso) {
  if (!iso) return 'never'
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`
  return `${Math.round(hrs / 24)} d ago`
}
