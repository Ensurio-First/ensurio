import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

/*
 * Tracks how far the visitor has got with the page's interactive check, so the
 * rest of the page can stop competing with it.
 *
 *   idle      — hasn't touched the check; the closing CTA band shows its form
 *   started   — mid-check; the band turns into "finish your check" instead
 *   submitted — done; the band becomes reassurance, with no second form
 *
 * Deliberately per-page: the state resets on navigation, because a check
 * completed on the cargo page says nothing about the fleet page.
 */

const LeadJourneyContext = createContext({
  state: 'idle',
  startCheck: () => {},
  completeCheck: () => {},
})

export function LeadJourneyProvider({ children }) {
  const [state, setState] = useState('idle')
  const { pathname } = useLocation()

  useEffect(() => { setState('idle') }, [pathname])

  const value = useMemo(() => ({
    state,
    // Never walk backwards: a finished check stays finished.
    startCheck: () => setState((s) => (s === 'submitted' ? s : 'started')),
    completeCheck: () => setState('submitted'),
  }), [state])

  return <LeadJourneyContext.Provider value={value}>{children}</LeadJourneyContext.Provider>
}

export function useLeadJourney() {
  return useContext(LeadJourneyContext)
}
