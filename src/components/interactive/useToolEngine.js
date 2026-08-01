import { useMemo, useState } from 'react'

/*
 * The scoring engine behind the on-page checks.
 *
 * Content lives in the page data files, so this file holds only the rules:
 * how an answer converts to credit, how gaps are ranked, and what the visitor
 * is told about their result. Keeping it declarative means copy can be edited
 * by hand without anyone touching logic.
 */

// A missing high-severity control should cost more than a missing low one.
const SEVERITY_WEIGHT = { high: 3, medium: 2, low: 1 }

// "Not sure" is not the same as "no" — the cover may well be there. But an
// owner who cannot answer has an unverified exposure, so it scores partial.
const UNSURE_CREDIT = 0.3

export const ANSWERS = { YES: 'yes', NO: 'no', UNSURE: 'unsure' }

/*
 * Accepts both the original shape (a plain string per item) and the richer one:
 *
 *   'My cargo is insured warehouse-to-warehouse'
 *   { statement, gapTitle, consequence, severity }
 *
 * so all 35 existing gapcheck blocks keep working while content is deepened
 * page by page.
 */
export function normaliseItems(items = []) {
  return items.map((item) =>
    typeof item === 'string'
      ? { statement: item, gapTitle: item, consequence: null, severity: 'medium' }
      : {
          statement: item.statement,
          gapTitle: item.gapTitle || item.statement,
          consequence: item.consequence || null,
          severity: item.severity || 'medium',
        },
  )
}

// Mirrors the thresholds used by the diagnostic tools' score ring.
export function scoreBand(score) {
  if (score < 40) return { label: 'Significant exposure', color: '#EF4444' }
  if (score < 60) return { label: 'Moderate exposure', color: '#F59E0B' }
  if (score < 75) return { label: 'Reasonably covered', color: 'var(--teal)' }
  return { label: 'Well covered', color: '#10B981' }
}

function summarise(questions, answers) {
  let total = 0
  let earned = 0
  const findings = []

  questions.forEach((q, i) => {
    const weight = SEVERITY_WEIGHT[q.severity] ?? SEVERITY_WEIGHT.medium
    total += weight

    const answer = answers[i]
    if (answer === ANSWERS.YES) {
      earned += weight
      return
    }
    if (answer === ANSWERS.UNSURE) earned += weight * UNSURE_CREDIT
    findings.push({ ...q, answer, weight })
  })

  // Worst first, and a confirmed "no" outranks an "unsure" of the same weight.
  findings.sort((a, b) => b.weight - a.weight || (a.answer === ANSWERS.NO ? -1 : 1))

  const score = total === 0 ? 100 : Math.round((earned / total) * 100)
  return { score, findings, band: scoreBand(score) }
}

export default function useToolEngine(items) {
  const questions = useMemo(() => normaliseItems(items), [items])
  const [answers, setAnswers] = useState({})
  const [index, setIndex] = useState(0)

  const answer = (value) => setAnswers((prev) => ({ ...prev, [index]: value }))
  const current = questions[index]
  const currentAnswer = answers[index]

  const result = useMemo(() => summarise(questions, answers), [questions, answers])
  const answeredAll = questions.every((_, i) => answers[i] !== undefined)

  const reset = () => { setAnswers({}); setIndex(0) }

  return {
    questions,
    index,
    setIndex,
    current,
    currentAnswer,
    answer,
    answers,
    answeredAll,
    isLast: index === questions.length - 1,
    next: () => setIndex((i) => Math.min(i + 1, questions.length - 1)),
    back: () => setIndex((i) => Math.max(i - 1, 0)),
    reset,
    result,
  }
}
