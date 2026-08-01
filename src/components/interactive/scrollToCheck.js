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
export const TOOL_BLOCK_TYPES = ['gapcheck', 'tcor', 'triage', 'protectiongap', 'riskregister']

const CTA_LABEL = {
  gapcheck: 'Check my cover — 2 min',
  tcor: 'Calculate my cost of risk',
  triage: 'Check where my claim stands',
  protectiongap: 'Calculate my protection gap',
  riskregister: 'Build my risk register',
}

const toolBlock = (body) => body?.find((b) => TOOL_BLOCK_TYPES.includes(b.type))

export const hasToolBlock = (body) => Boolean(toolBlock(body))

// The CTA names what the visitor gets, so it has to follow the tool on the page.
export const toolCtaLabel = (body) => CTA_LABEL[toolBlock(body)?.type] ?? 'Start the check'

export default function scrollToCheck() {
  const el = typeof document !== 'undefined' && document.getElementById(CHECK_ANCHOR_ID)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
