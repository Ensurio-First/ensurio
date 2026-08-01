import { useEffect, useState } from 'react'
import { supabase, isConfigured, isStaff } from './lib/supabase'
import SignIn from './SignIn'
import LeadsView from './LeadsView'

/*
 * Session gate.
 *
 * Three states rather than the obvious two. "Signed in" and "staff" are
 * different things: anyone can create an account against this Supabase project,
 * but only an allowlisted address passes is_portal_staff(). Collapsing the two
 * would land a stranger on an empty leads table that reads as "no leads yet".
 */
export default function App() {
  const [session, setSession] = useState(null)
  const [staff, setStaff] = useState(null) // null = not yet checked
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!supabase) { setReady(true); return }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setStaff(null) // re-check on every sign-in; the allowlist can change
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Authorisation check, once there is a session to check.
  useEffect(() => {
    let cancelled = false
    if (!session) { setStaff(null); return }
    isStaff().then((ok) => { if (!cancelled) setStaff(ok) })
    return () => { cancelled = true }
  }, [session])

  if (!isConfigured) {
    return (
      <Centered>
        <Notice
          title="Not configured"
          body="VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are unset for this build. Add them to the portal's Vercel project (or .env.local) and redeploy."
        />
      </Centered>
    )
  }

  if (!ready) return <Centered><Spinner /></Centered>
  if (!session) return <SignIn />
  if (staff === null) return <Centered><Spinner label="Checking access…" /></Centered>

  if (staff === false) {
    return (
      <Centered>
        <Notice
          title="No access"
          body={`${session.user.email} is signed in but is not on the portal staff list. Ask an admin to add the address, then sign in again.`}
          action={{ label: 'Sign out', onClick: () => supabase.auth.signOut() }}
        />
      </Centered>
    )
  }

  return <LeadsView session={session} />
}

/* ── Shared shells ───────────────────────────────────────────────────── */

function Centered({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '1.5rem', background: 'var(--light-bg)' }}>
      {children}
    </div>
  )
}

function Spinner({ label }) {
  return (
    <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-muted)' }}>
      <div style={{ width: '26px', height: '26px', margin: '0 auto 12px', border: '2.5px solid var(--border-dark)', borderTopColor: 'var(--teal)', borderRadius: '50%', animation: 'portal-spin 0.7s linear infinite' }} />
      <style>{'@keyframes portal-spin{to{transform:rotate(360deg)}}'}</style>
      {label || 'Loading…'}
    </div>
  )
}

function Notice({ title, body, action }) {
  return (
    <div style={{ maxWidth: '440px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.6rem' }}>{title}</h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.65, color: 'var(--text-mid)' }}>{body}</p>
      {action && (
        <button onClick={action.onClick}
          style={{ marginTop: '1.25rem', padding: '10px 20px', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer' }}>
          {action.label}
        </button>
      )}
    </div>
  )
}
