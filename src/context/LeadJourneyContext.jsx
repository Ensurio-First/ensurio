import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { trackToolStart } from '../lib/analytics'

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
    /*
     * Tools call this on every interaction, but the analytics event should fire
     * once — the first time someone actually engages. Firing inside the state
     * updater means we see the previous state and can tell a genuine start from
     * the twentieth slider nudge.
     */
    startCheck: (toolId) => setState((s) => {
      if (s === 'submitted') return s
      if (s === 'idle') trackToolStart(toolId)
      return 'started'
    }),
    completeCheck: () => setState('submitted'),
  }), [state])

  return <LeadJourneyContext.Provider value={value}>{children}</LeadJourneyContext.Provider>
}

export function useLeadJourney() {
  return useContext(LeadJourneyContext)
}
