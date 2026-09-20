import { useState, useEffect } from 'react'
export function useIsMobile(breakpoint = 768) {
  // Guarded for the prerender build, which renders these components in Node.
  // Defaults to the desktop layout there, matching useWindowWidth's 1200 default.
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < breakpoint)
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', h, { passive: true })
    return () => window.removeEventListener('resize', h)
  }, [breakpoint])
  return mobile
}
