import { useEffect, useMemo, useState } from 'react'
import { Search, RefreshCw, X, Mail, Phone, FileText, AlertTriangle } from 'lucide-react'
import { fetchLeads, updateLeadStatus } from './lib/supabase'

/*
 * The leads dashboard.
 *
 * Reads public.leads directly — RLS restricts it to allowlisted staff, so there
 * is no server layer to write. Zoho data will not come this way: CRM and Books
 * are rate-limited and go through a scheduled sync into their own tables later,
 * which this view will join against rather than querying live.
 */

const STATUSES = ['received', 'contacted', 'in-review', 'advising', 'closed']

// email_status values meaning the lead did not get their result. 'direct-insert'
// is the fallback path in src/lib/supabase.js, which saves the row but sends
// nothing, so those need a manual follow-up too.
const NEEDS_ATTENTION = new Set(['failed', 'direct-insert', 'team-only'])

// Status is state, not identity, so these are reserved colours and every badge
// carries its label — the colour is never the only thing distinguishing them.
const STATUS_STYLE = {
  received: { bg: '#EFF6FF', fg: '#1D4ED8' },
  contacted: { bg: 'var(--gold-soft)', fg: 'var(--gold-dark)' },
  'in-review': { bg: '#FEF3C7', fg: '#92400E' },
  advising: { bg: 'var(--teal-pale)', fg: 'var(--teal-dark)' },
  closed: { bg: '#F1F5F9', fg: 'var(--text-muted)' },
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

export default function LeadsView() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [tool, setTool] = useState('all')

  const load = async () => {
    setLoading(true); setError('')
    try {
      setLeads(await fetchLeads())
    } catch (e) {
      setError(e.message || 'Could not load leads.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const [savingStatus, setSavingStatus] = useState(false)
  const [statusError, setStatusError] = useState('')

  /*
   * Move a lead's stage. The row that comes back carries the trigger-stamped
   * who/when, so both the table and the open panel are patched from the
   * database's answer rather than from what we hoped it would be — a rejected
   * update leaves the old status on screen, which is the honest outcome.
   */
  const applyStatus = async (lead, next) => {
    if (!lead || next === lead.lead_status) return
    setSavingStatus(true)
    setStatusError('')
    try {
      const row = await updateLeadStatus(lead.id, next)
      const patch = (l) => (l.id === row.id ? { ...l, ...row } : l)
      setLeads((all) => all.map(patch))
      setSelected((s) => (s && s.id === row.id ? { ...s, ...row } : s))
    } catch (e) {
      setStatusError(e.message || 'Could not update status.')
    } finally {
      setSavingStatus(false)
    }
  }

  const tools = useMemo(
    () => [...new Set(leads.map((l) => l.tool_id).filter(Boolean))].sort(),
    [leads],
  )

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return leads.filter((l) => {
      if (status !== 'all' && l.lead_status !== status) return false
      if (tool !== 'all' && l.tool_id !== tool) return false
      if (!needle) return true
      return [l.name, l.email, l.phone, l.service, l.reference, l.source]
        .some((v) => v && String(v).toLowerCase().includes(needle))
    })
  }, [leads, q, status, tool])

  // Counts describe what is on screen, so they move with the filters rather
  // than quietly reporting the whole table.
  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const scored = filtered.filter((l) => typeof l.score === 'number')
    return {
      total: filtered.length,
      week: filtered.filter((l) => new Date(l.created_at).getTime() >= weekAgo).length,
      untouched: filtered.filter((l) => l.lead_status === 'received').length,
      avgScore: scored.length
        ? Math.round(scored.reduce((s, l) => s + l.score, 0) / scored.length)
        : null,
    }
  }, [filtered])

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '1.25rem' }}>
        <StatTile label="Leads shown" value={stats.total} />
        <StatTile label="Last 7 days" value={stats.week} />
        <StatTile label="Awaiting contact" value={stats.untouched} />
        <StatTile label="Average score" value={stats.avgScore ?? '—'} />
      </div>

      <Filters
        q={q} setQ={setQ}
        status={status} setStatus={setStatus}
        tool={tool} setTool={setTool}
        tools={tools}
        onRefresh={load} loading={loading}
      />

      {error && (
        <p role="alert" style={{ padding: '14px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '13.5px', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Received</th><th>Name</th><th>Contact</th>
                    <th>Service</th><th>Tool</th><th style={{ textAlign: 'right' }}>Score</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} onClick={() => setSelected(l)} aria-selected={selected?.id === l.id}>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                        {dateFmt.format(new Date(l.created_at))}
                        <div style={{ fontSize: '11.5px', color: 'var(--text-light)' }}>{timeFmt.format(new Date(l.created_at))}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-dark)' }}>
                          {l.name || '—'}
                          {/* A lead who never received their result is the one
                              most likely to have gone cold wondering why. */}
                          {NEEDS_ATTENTION.has(l.email_status) && (
                            <span title={`Email ${l.email_status} — they may not have received their result`}
                              style={{ display: 'inline-flex', color: 'var(--warning)' }}>
                              <AlertTriangle size={13} />
                            </span>
                          )}
                        </div>
                        {l.reference && <div style={{ fontSize: '11.5px', color: 'var(--text-light)', fontVariantNumeric: 'tabular-nums' }}>{l.reference}</div>}
                      </td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-mid)' }}>
                        <div>{l.email || '—'}</div>
                        {l.phone && <div style={{ color: 'var(--text-muted)' }}>{l.phone}</div>}
                      </td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-mid)', maxWidth: '190px' }}>{l.service || '—'}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l.tool_id || '—'}</td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                        {typeof l.score === 'number' ? l.score : '—'}
                      </td>
                      <td><StatusBadge value={l.lead_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length === 0 && (
              <p style={{ padding: '2.5rem 1rem', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                {leads.length === 0 ? 'No leads yet.' : 'No leads match these filters.'}
              </p>
            )}
            {loading && (
              <p style={{ padding: '2.5rem 1rem', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>Loading…</p>
            )}
          </div>

          {selected && (
            <DetailPanel
              lead={selected}
              onClose={() => { setSelected(null); setStatusError('') }}
              onStatus={applyStatus}
              saving={savingStatus}
              statusError={statusError}
            />
        )}
      </div>
    </>
  )
}

/* ── Pieces ──────────────────────────────────────────────────────────── */

// Label in sentence case, value in the same sans as everything else, with
// proportional figures — tabular-nums is for columns, not display numbers.
function StatTile({ label, value }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
      <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.1 }}>{value}</div>
    </div>
  )
}

function Filters({ q, setQ, status, setStatus, tool, setTool, tools, onRefresh, loading }) {
  const select = { height: '38px', padding: '0 10px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-mid)', background: 'var(--white)', border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
      <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '340px' }}>
        <Search size={15} color="var(--text-light)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
        <input className="portal-input" type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Name, email, phone, reference…" aria-label="Search leads"
          style={{ width: '100%', height: '38px', padding: '0 12px 0 34px', boxSizing: 'border-box', fontFamily: 'var(--font-body)', fontSize: '13px', background: 'var(--white)', border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-sm)', outline: 'none' }} />
      </div>

      <select value={status} onChange={(e) => setStatus(e.target.value)} style={select} aria-label="Filter by status">
        <option value="all">All statuses</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select value={tool} onChange={(e) => setTool(e.target.value)} style={select} aria-label="Filter by tool">
        <option value="all">All tools</option>
        {tools.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <button onClick={onRefresh} disabled={loading} title="Refresh"
        style={{ ...select, display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
        <RefreshCw size={14} style={loading ? { animation: 'portal-spin 0.7s linear infinite' } : undefined} /> Refresh
      </button>
    </div>
  )
}

function StatusBadge({ value }) {
  const s = STATUS_STYLE[value] || STATUS_STYLE.closed
  return (
    <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: '99px', background: s.bg, color: s.fg, fontSize: '11.5px', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {value || 'unknown'}
    </span>
  )
}

/*
 * Stage control. Buttons rather than a dropdown: five options that get clicked
 * dozens of times a day are worth one tap, and it matches how the public tools
 * take a choice.
 *
 * lead_status is the only column the portal can write — see the RLS migration.
 * The who/when line underneath is stamped by a database trigger, so it reports
 * what actually happened rather than what this component believes.
 */
function StatusPicker({ lead, onStatus, saving, error }) {
  const by = lead.lead_status_updated_by
  const at = lead.lead_status_updated_at

  return (
    <div style={{ padding: '10px 0', borderTop: '1px solid var(--border)' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
        Status
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {STATUSES.map((s) => {
          const on = lead.lead_status === s
          const style = STATUS_STYLE[s]
          return (
            <button key={s} type="button" disabled={saving || on}
              onClick={() => onStatus(lead, s)}
              aria-pressed={on}
              style={{
                padding: '5px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: 700,
                cursor: on ? 'default' : saving ? 'wait' : 'pointer',
                background: on ? style.bg : 'var(--white)',
                color: on ? style.fg : 'var(--text-muted)',
                border: `1px solid ${on ? style.fg : 'var(--border-dark)'}`,
                opacity: saving && !on ? 0.55 : 1,
              }}>
              {s}
            </button>
          )
        })}
      </div>

      {error && (
        <p role="alert" style={{ marginTop: '8px', fontSize: '12px', color: 'var(--danger)' }}>{error}</p>
      )}

      {by && at && (
        <p style={{ marginTop: '8px', fontSize: '11.5px', color: 'var(--text-light)' }}>
          Last changed by {by} on {dateFmt.format(new Date(at))} at {timeFmt.format(new Date(at))}
        </p>
      )}
    </div>
  )
}

function DetailPanel({ lead, onClose, onStatus, saving, statusError }) {
  const findings = lead.report?.findings
  return (
    <aside className="portal-detail"
      style={{ width: '380px', flexShrink: 0, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '18px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', position: 'sticky', top: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)' }}>{lead.name || 'Unnamed lead'}</h2>
          {lead.reference && <div style={{ fontSize: '12px', color: 'var(--text-light)', fontVariantNumeric: 'tabular-nums' }}>{lead.reference}</div>}
        </div>
        <button onClick={onClose} aria-label="Close"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '16px' }}>
        {lead.email && <LinkRow icon={<Mail size={14} />} href={`mailto:${lead.email}`} text={lead.email} />}
        {lead.phone && <LinkRow icon={<Phone size={14} />} href={`tel:${lead.phone}`} text={lead.phone} />}
      </div>

      <StatusPicker lead={lead} onStatus={onStatus} saving={saving} error={statusError} />

      <Field label="Service">{lead.service || '—'}</Field>
      <Field label="Source">{lead.source || '—'}</Field>
      <Field label="Page">{lead.page || '—'}</Field>
      <Field label="Preferred callback">{lead.preferred_time || '—'}</Field>
      <Field label="Tool">{lead.tool_id || '—'}</Field>
      {typeof lead.score === 'number' && <Field label="Score">{lead.score}</Field>}
      {/* Whether the emails actually went out — a 'failed' here is why a lead
          may not have heard from us. */}
      <Field label="Email status">{lead.email_status || '—'}</Field>

      {lead.message && (
        <Field label="Message">
          <span style={{ whiteSpace: 'pre-wrap' }}>{lead.message}</span>
        </Field>
      )}

      {lead.report?.headline && <Field label="Result">{lead.report.headline}</Field>}

      {Array.isArray(findings) && findings.length > 0 && (
        <div style={{ marginTop: '14px' }}>
          <SectionLabel><FileText size={13} /> Findings</SectionLabel>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {findings.map((f, i) => (
              <li key={i} style={{ fontSize: '12.5px', lineHeight: 1.55, color: 'var(--text-mid)', paddingLeft: '10px', borderLeft: '2px solid var(--border-dark)' }}>
                <strong style={{ color: 'var(--text-dark)' }}>{f.gapTitle || f.title || `Finding ${i + 1}`}</strong>
                {f.consequence && <div style={{ color: 'var(--text-muted)' }}>{f.consequence}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {lead.details && (
        <details style={{ marginTop: '16px' }}>
          <summary style={{ cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Raw answers</summary>
          <pre style={{ marginTop: '8px', padding: '10px', background: 'var(--light-bg)', borderRadius: 'var(--radius-sm)', fontSize: '11px', lineHeight: 1.5, overflowX: 'auto', color: 'var(--text-mid)' }}>
            {JSON.stringify(lead.details, null, 2)}
          </pre>
        </details>
      )}
    </aside>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '112px 1fr', gap: '8px', padding: '6px 0', borderTop: '1px solid var(--border)', fontSize: '12.5px' }}>
      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
      <span style={{ color: 'var(--text-dark)', minWidth: 0, wordBreak: 'break-word' }}>{children}</span>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
      {children}
    </div>
  )
}

function LinkRow({ icon, href, text }) {
  return (
    <a href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'var(--teal-dark)', textDecoration: 'none', wordBreak: 'break-all' }}>
      {icon}{text}
    </a>
  )
}
