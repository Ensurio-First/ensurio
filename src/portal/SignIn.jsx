import { useState } from 'react'
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react'
import { supabase } from './lib/supabase'

/*
 * Magic-link sign-in.
 *
 * No passwords: this is a small internal team, and a password is one more
 * credential to leak, reset and store. A link to a mailbox they already control
 * is both simpler and harder to phish at scale.
 *
 * The confirmation message is deliberately identical whether or not the address
 * is on the staff list. Telling a stranger "that address isn't recognised"
 * turns this form into a way to enumerate who works here.
 *
 * shouldCreateUser is left at its default (true), so a stranger's address does
 * get an auth.users row. That is the deliberate trade: authorisation lives in
 * the portal_staff allowlist, not in who holds an account, and an account
 * without an allowlist row reads zero rows from every table. Setting it false
 * would mean onboarding a colleague needs an auth user created by hand *and* an
 * allowlist row — and if an admin did only the second, the new advisor would
 * request a link, receive nothing, and report the portal as broken.
 */
export default function SignIn() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error'); setError('Enter a valid email address.'); return
    }
    setStatus('sending')
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    if (err) { setStatus('error'); setError(err.message); return }
    setStatus('sent')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '1.5rem', background: 'var(--light-bg)' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '1.5rem' }}>
          <div style={{ width: '34px', height: '34px', display: 'grid', placeItems: 'center', background: 'var(--navy)', borderRadius: 'var(--radius-sm)' }}>
            <ShieldCheck size={18} color="var(--teal)" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.2 }}>Insure First</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', color: 'var(--text-muted)' }}>Internal portal</div>
          </div>
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
          {status === 'sent' ? (
            <>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem' }}>Check your email</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.65, color: 'var(--text-mid)' }}>
                If <strong>{email}</strong> has portal access, a sign-in link is on its way. It expires in an hour.
              </p>
              <button onClick={() => { setStatus('idle'); setEmail('') }}
                style={{ marginTop: '1.25rem', background: 'none', border: 'none', padding: 0, color: 'var(--teal-dark)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                Use a different address
              </button>
            </>
          ) : (
            <form onSubmit={submit} noValidate>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.35rem' }}>Sign in</h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                We'll email you a link — no password needed.
              </p>

              <label htmlFor="portal-email" style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-mid)', marginBottom: '7px' }}>
                Work email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-light)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                <input id="portal-email" className="portal-input" type="email" autoComplete="email" autoFocus
                  value={email} onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
                  placeholder="you@insurefirst.ae"
                  style={{ width: '100%', height: '46px', padding: '0 14px 0 38px', boxSizing: 'border-box', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dark)', background: 'var(--white)', border: '1.5px solid var(--border-dark)', borderRadius: 'var(--radius-sm)', outline: 'none' }} />
              </div>

              {status === 'error' && (
                <p role="alert" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--danger)', marginTop: '10px' }}>{error}</p>
              )}

              <button type="submit" disabled={status === 'sending'}
                style={{ marginTop: '1.1rem', width: '100%', height: '46px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: 700, cursor: status === 'sending' ? 'wait' : 'pointer' }}>
                {status === 'sending' ? 'Sending…' : <>Email me a link <ArrowRight size={15} /></>}
              </button>
            </form>
          )}
        </div>

        <p style={{ marginTop: '1rem', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '11.5px', color: 'var(--text-light)' }}>
          Staff access only. Activity is tied to your address.
        </p>
      </div>
    </div>
  )
}
