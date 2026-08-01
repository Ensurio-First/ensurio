/*
 * Every content page renders at most one interactive tool, anchored with this
 * id. Hero CTAs and the closing band both point at it rather than sending the
 * visitor to /contact to start over.
 */
export const CHECK_ANCHOR_ID = 'page-check'

/*
 * Block types that render a tool. Kept in one place because three separate
 * things depend on the answer: whether the hero CTA points at the tool, whether
 * the closing band shows a form, and what the CTA should say.
 */
export const TOOL_BLOCK_TYPES = [
  'gapcheck', 'tcor', 'triage', 'protectiongap', 'riskregister',
  'claimstage', 'evidencepack', 'offercheck', 'statuslookup',
]

const CTA_LABEL = {
  gapcheck: 'Check my cover — 2 min',
  tcor: 'Calculate my cost of risk',
  triage: 'Check where my claim stands',
  protectiongap: 'Calculate my protection gap',
  riskregister: 'Build my risk register',
  claimstage: 'Get help with my claim',
  evidencepack: 'Build my evidence pack',
  offercheck: 'Check my settlement offer',
  statuslookup: 'Look up my reference',
}

/*
 * A page may carry a second tool serving a later moment — an evidence pack that
 * only matters once you are already claiming, say. It must not take the anchor
 * or the hero CTA off the primary tool, so mark it `secondary: true` in the data
 * and it is skipped here.
 */
const toolBlock = (body) =>
  body?.find((b) => TOOL_BLOCK_TYPES.includes(b.type) && !b.secondary)

export const hasToolBlock = (body) => Boolean(toolBlock(body))

// The CTA names what the visitor gets, so it has to follow the tool on the page.
export const toolCtaLabel = (body) => CTA_LABEL[toolBlock(body)?.type] ?? 'Start the check'

export default function scrollToCheck() {
  const el = typeof document !== 'undefined' && document.getElementById(CHECK_ANCHOR_ID)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
