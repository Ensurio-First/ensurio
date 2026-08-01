/*
 * The diagnostic tools describe their results as `{ icon, text }` insights.
 * The emailed report and the advisor alert want a structured shape instead:
 * a short bold title, an optional explanation, and a severity.
 *
 * Insight strings read as "Label — explanation" or "Label: explanation", so
 * split on the first separator; fall back to the whole string when there
 * isn't one.
 */
export default function toFinding({ icon, text }) {
  const m = text.match(/^(.{0,64}?)(?::\s|\s—\s)([\s\S]+)$/)
  return {
    title: m ? m[1] : text,
    detail: m ? m[2] : undefined,
    severity: icon === '✓' ? 'low' : 'high',
  }
}
