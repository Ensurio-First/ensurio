import { createClient } from '@supabase/supabase-js'

// Credentials come from Vite env vars (safe to expose the anon key in the
// frontend — Row Level Security protects the data). Set these in a .env.local
// file locally and in the Vercel project's Environment Variables:
//   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
//   VITE_SUPABASE_ANON_KEY=<anon public key>
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null
export const isSupabaseConfigured = Boolean(supabase)

/**
 * Insert a lead into the `leads` table. Throws 'not-configured' if the
 * Supabase env vars are not set yet (so the UI can fall back gracefully).
 */
export async function submitLead(lead) {
  if (!supabase) throw new Error('not-configured')
  const { error } = await supabase.from('leads').insert([
    {
      name: lead.name || null,
      email: lead.email || null,
      phone: lead.phone || null,
      message: lead.message || null,
      service: lead.service || null,
      source: lead.source || 'website',
      page: typeof window !== 'undefined' ? window.location.pathname : null,
    },
  ])
  if (error) throw error
}
