import { ShieldCheck, LogOut } from 'lucide-react'
import { supabase } from './lib/supabase'

/*
 * The portal chrome: brand, tabs, who is signed in, sign out.
 *
 * Lifted out of LeadsView when the Clients tab arrived — two views rendering
 * their own copy of the header is how they drift apart.
 */

const TABS = [
  { id: 'leads', label: 'Leads' },
  { id: 'clients', label: 'Clients' },
]

export default function Shell({ email, tab, onTab, children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--light-bg)' }}>
      <header style={{ background: 'var(--navy)', padding: '0 1.25rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <ShieldCheck size={18} color="var(--teal)" />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14.5px', fontWeight: 800, color: '#fff' }}>Insure First</span>
            </div>

            <nav style={{ display: 'flex', gap: '2px' }}>
              {TABS.map((t) => {
                const on = tab === t.id
                return (
                  <button key={t.id} onClick={() => onTab(t.id)} aria-current={on ? 'page' : undefined}
                    style={{
                      padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                      fontSize: '13px', fontWeight: 700,
                      background: on ? 'rgba(255,255,255,0.14)' : 'transparent',
                      color: on ? '#fff' : 'rgba(255,255,255,0.6)',
                    }}>
                    {t.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
            <button onClick={() => supabase.auth.signOut()} title="Sign out"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>
        {children}
      </main>
    </div>
  )
}
