import { useEffect, useState } from 'react'
import { Search, RefreshCw, X, FileText, Info, AlertTriangle, ChevronRight, Archive, Database, Paperclip } from 'lucide-react'
import { fetchClients, fetchClientPolicies, fetchLastSync, runSync } from './lib/supabase'

/*
 * Clients and their policies, read from the local CRM mirror.
 *
 * This used to call Zoho on every render — one list call plus eight aggregates,
 * two to five seconds, repeated every time someone switched tabs — against an
 * API that meters credits per org and caps access-token mints per ten minutes.
 * A scheduled sync now does that once and this reads Postgres.
 *
 * The screen is built around renewals rather than records, because that is the
 * job: who lapses next, not a second window onto a CRM you already have. Which
 * is also what the mirror finally makes possible — expiry lives on the policy
 * modules, so Zoho cannot order a CLIENT query by it and the live version could
 * only sort the fifty rows already on screen. This sorts the whole book.
 */

/** "26 Feb 2027" — unambiguous in a way that 02/26/27 is not. */
function formatDate(iso) {
  if (!iso) return null
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return String(iso)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${String(d).padStart(2, '0')} ${months[m - 1]} ${y}`
}

/* Compared as calendar dates rather than timestamps, so a policy does not
 * appear to lapse early for anyone reading the portal from another timezone. */
function daysUntil(iso) {
  if (!iso) return null
  const today = new Date().toISOString().slice(0, 10)
  const ms = Date.parse(`${String(iso).slice(0, 10)}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)
  return Math.round(ms / 86400000)
}

/*
 * Four bands, not a gradient. The column is scanned, not read: an advisor needs
 * "gone", "this month", "this quarter", "fine" at a glance, and a continuous
 * scale makes every row look mildly urgent.
 */
function expiryTone(days) {
  if (days === null) return { color: 'var(--text-light)', weight: 400, bg: 'transparent' }
  if (days < 0) return { color: '#B42318', weight: 700, bg: '#FEF2F2' }
  if (days <= 30) return { color: '#B54708', weight: 700, bg: '#FFFAEB' }
  if (days <= 90) return { color: 'var(--gold-dark)', weight: 600, bg: 'transparent' }
  return { color: 'var(--text-mid)', weight: 500, bg: 'transparent' }
}

function relativeLabel(days) {
  if (days === null) return null
  if (days < 0) return `${Math.abs(days)}d ago`
  if (days === 0) return 'today'
  return `${days}d`
}

function ago(iso) {
  if (!iso) return 'never'
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`
  return `${Math.round(hrs / 24)} d ago`
}

export default function ClientsView() {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [sort, setSort] = useState('expiry')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selected, setSelected] = useState(null)
  const [policies, setPolicies] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  const [lastSync, setLastSync] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncNote, setSyncNote] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetchClients({ query: submitted, page, sort })
      setRows(res.rows); setTotal(res.total); setHasMore(res.hasMore)
    } catch (e) {
      setError(e.message || 'Could not read the client mirror.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [submitted, page, sort])
  useEffect(() => { fetchLastSync().then(setLastSync).catch(() => {}) }, [])

  const openClient = async (row) => {
    setSelected(row); setPolicies(null); setDetailError(''); setDetailLoading(true)
    try {
      setPolicies(await fetchClientPolicies(row.id))
    } catch (e) {
      setDetailError(e.message || 'Could not load this client.')
    } finally {
      setDetailLoading(false)
    }
  }

  const doSync = async () => {
    setSyncing(true); setSyncNote('')
    try {
      const res = await runSync('incremental')
      setSyncNote(`${res.clients} client${res.clients === 1 ? '' : 's'} and ${res.policies} polic${res.policies === 1 ? 'y' : 'ies'} updated.`)
      setLastSync(await fetchLastSync())
      await load()
      if (selected) await openClient(selected)
    } catch (e) {
      setSyncNote(e.message || 'Sync failed.')
    } finally {
      setSyncing(false)
    }
  }

  const submitSearch = (e) => { e.preventDefault(); setPage(1); setSubmitted(q.trim()) }

  const ctrl = { height: '38px', padding: '0 12px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-mid)', background: 'var(--white)', border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }

  return (
    <>
      <form onSubmit={submitSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
          <Search size={15} color="var(--text-light)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
          <input className="portal-input" type="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email or phone" aria-label="Search clients"
            style={{ width: '100%', height: '38px', padding: '0 12px 0 34px', boxSizing: 'border-box', fontFamily: 'var(--font-body)', fontSize: '13px', background: 'var(--white)', border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-sm)', outline: 'none' }} />
        </div>
        <button type="submit" style={{ ...ctrl, fontWeight: 700 }}>Search</button>
        {submitted && (
          <button type="button" onClick={() => { setQ(''); setSubmitted(''); setPage(1) }} style={{ ...ctrl, fontWeight: 600 }}>Clear</button>
        )}

        <select value={sort} onChange={(e) => { setPage(1); setSort(e.target.value) }} aria-label="Sort by"
          style={{ ...ctrl, fontWeight: 600 }}>
          <option value="expiry">Soonest renewal</option>
          <option value="name">Name</option>
          <option value="recent">Recently synced</option>
        </select>

        {total > 0 && (
          <span style={{ fontSize: '11.5px', color: 'var(--text-light)' }}>
            {total.toLocaleString()} client{total === 1 ? '' : 's'}
          </span>
        )}
      </form>

      {/* A mirror with no visible freshness is a screen that quietly goes stale,
          and "no policies" and "nothing has synced since Tuesday" look identical. */}
      <SyncBar last={lastSync} syncing={syncing} note={syncNote} onSync={doSync} ctrl={ctrl} />

      {error && (
        <p role="alert" style={{ display: 'flex', gap: '8px', padding: '14px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '13.5px', marginBottom: '1rem' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Client</th><th>Email</th><th>Phone</th><th>City</th>
                  <th style={{ textAlign: 'right' }}>Policies</th>
                  <th style={{ textAlign: 'right' }}>Next expiry</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} onClick={() => openClient(r)} aria-selected={selected?.id === r.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{r.name}</td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-mid)' }}>{r.email || '—'}</td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-mid)' }}>{r.phone || '—'}</td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{r.city || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span title={`${r.live_policy_count} on the current book, ${r.policy_count - r.live_policy_count} historical`}
                        style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '13px', color: r.policy_count ? 'var(--navy)' : 'var(--text-light)', borderBottom: '1px dotted var(--border-dark)', cursor: 'help' }}>
                        {r.policy_count}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}><NextExpiry row={r} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && <p style={{ padding: '2.5rem 1rem', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>Loading…</p>}
          {!loading && !error && rows.length === 0 && (
            <p style={{ padding: '2.5rem 1rem', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
              {submitted
                ? `No clients matching “${submitted}”.`
                : lastSync
                  ? 'No clients in the mirror.'
                  : 'Nothing has been synced from Zoho yet — press Sync now.'}
            </p>
          )}

          {(page > 1 || hasMore) && !loading && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} style={{ ...ctrl, opacity: page <= 1 ? 0.4 : 1 }}>← Previous</button>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Page {page}</span>
              <button disabled={!hasMore} onClick={() => setPage((p) => p + 1)} style={{ ...ctrl, opacity: hasMore ? 1 : 0.4 }}>Next →</button>
            </div>
          )}
        </div>

        {selected && (
          <ClientPanel
            row={selected}
            policies={policies}
            loading={detailLoading}
            error={detailError}
            onClose={() => { setSelected(null); setPolicies(null); setDetailError('') }}
          />
        )}
      </div>
    </>
  )
}

function SyncBar({ last, syncing, note, onSync, ctrl }) {
  const stale = last?.started_at && Date.now() - Date.parse(last.started_at) > 26 * 3600 * 1000
  const failed = last && last.ok === false

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
      padding: '8px 12px', marginBottom: '1rem',
      background: failed ? '#FEF2F2' : stale ? 'var(--gold-soft)' : 'var(--light-bg)',
      border: `1px solid ${failed ? '#FECACA' : 'var(--border)'}`,
      borderRadius: 'var(--radius-sm)', fontSize: '12px',
    }}>
      <Database size={13} color="var(--text-muted)" />
      <span style={{ color: 'var(--text-mid)' }}>
        {!last
          ? 'Never synced from Zoho.'
          : failed
            ? <>Last sync <strong>failed</strong> {ago(last.started_at)} — {last.error}</>
            : <>Synced from Zoho <strong>{ago(last.started_at)}</strong>{last.policies_seen ? ` · ${last.policies_seen} policies updated` : ''}</>}
      </span>

      <button type="button" onClick={onSync} disabled={syncing}
        style={{ ...ctrl, height: '30px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <RefreshCw size={12} style={syncing ? { animation: 'portal-spin 0.7s linear infinite' } : undefined} />
        {syncing ? 'Syncing…' : 'Sync now'}
      </button>

      {syncing && <span style={{ color: 'var(--text-light)' }}>This pages the CRM — it can take a minute.</span>}
      {note && !syncing && <span style={{ color: 'var(--text-muted)' }}>{note}</span>}
    </div>
  )
}

/*
 * A client with policies but no future expiry is meaningfully different from
 * one with no policies at all — the first has lapsed or holds only endorsement
 * rows, the second is new. They read differently rather than both showing a dash.
 */
function NextExpiry({ row }) {
  if (!row.next_expiry) {
    return (
      <span title={row.policy_count ? 'No policy with an expiry date in the future.' : undefined}
        style={{ fontSize: '12px', color: 'var(--text-light)' }}>
        {row.policy_count ? 'none current' : '—'}
      </span>
    )
  }
  const days = daysUntil(row.next_expiry)
  const tone = expiryTone(days)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '6px', padding: tone.bg === 'transparent' ? 0 : '2px 6px', borderRadius: 'var(--radius-sm)', background: tone.bg }}>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '12.5px', fontWeight: tone.weight, color: tone.color }}>
        {formatDate(row.next_expiry)}
      </span>
      <span style={{ fontSize: '11px', color: tone.color, opacity: 0.75 }}>{relativeLabel(days)}</span>
    </span>
  )
}

function ClientPanel({ row, policies, loading, error, onClose }) {
  const [showHistory, setShowHistory] = useState(false)

  const live = (policies ?? []).filter((p) => !p.legacy)
  const historical = (policies ?? []).filter((p) => p.legacy)
  const today = new Date().toISOString().slice(0, 10)
  const active = live.filter((p) => p.expires_on && p.expires_on >= today)
  const nextExpiry = active.map((p) => p.expires_on).sort()[0] ?? null

  const groupBy = (list) => {
    const out = new Map()
    for (const p of list) {
      if (!out.has(p.module_label)) out.set(p.module_label, [])
      out.get(p.module_label).push(p)
    }
    return [...out.entries()]
  }

  return (
    <aside className="portal-detail"
      style={{ width: '440px', flexShrink: 0, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '18px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', position: 'sticky', top: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)' }}>{row.name}</h2>
        <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
          <X size={18} />
        </button>
      </div>

      {loading && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading…</p>}
      {error && <p role="alert" style={{ fontSize: '13px', color: 'var(--danger)' }}>{error}</p>}

      {policies && (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <Stat label="Active" value={active.length} accent />
            <Stat label="On record" value={policies.length} />
            <Stat label="Next renewal" wide
              value={nextExpiry ? formatDate(nextExpiry) : '—'}
              sub={nextExpiry ? relativeLabel(daysUntil(nextExpiry)) : null}
              tone={nextExpiry ? expiryTone(daysUntil(nextExpiry)) : null} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '6px 10px', fontSize: '12.5px', marginBottom: '18px' }}>
            <Detail label="Email" value={row.email} />
            <Detail label="Phone" value={row.phone} />
            <Detail label="City" value={row.city} />
          </div>

          <SectionHeading icon={FileText} label="Current cover" count={live.length} />
          {live.length === 0 && (
            <p style={{ display: 'flex', gap: '7px', padding: '10px 12px', background: 'var(--light-bg)', borderRadius: 'var(--radius-sm)', fontSize: '12px', lineHeight: 1.55, color: 'var(--text-mid)' }}>
              <Info size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
              No current-book policies on this client.{historical.length > 0 && ' There are historical records below.'}
            </p>
          )}
          {groupBy(live).map(([label, list]) => <PolicyGroup key={label} label={label} list={list} />)}

          {/* Endorsement rows and the pre-2023 archive. Reachable, but never
              competing with live cover for the eye. */}
          {historical.length > 0 && (
            <div style={{ marginTop: '18px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
              <button type="button" onClick={() => setShowHistory((s) => !s)}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <ChevronRight size={13} style={{ transform: showHistory ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                <Archive size={13} />
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Historical</span>
                <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>· {historical.length}</span>
              </button>
              {showHistory && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ fontSize: '11.5px', lineHeight: 1.5, color: 'var(--text-light)', marginBottom: '10px' }}>
                    Endorsement entries and the pre-2023 book. Mostly without expiry dates, and not counted as current cover.
                  </p>
                  {groupBy(historical).map(([label, list]) => <PolicyGroup key={label} label={label} list={list} muted />)}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </aside>
  )
}

function Detail({ label, value }) {
  return (
    <>
      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
      <span style={{ color: 'var(--text-dark)', wordBreak: 'break-word' }}>{value || '—'}</span>
    </>
  )
}

function Stat({ label, value, sub, accent, tone, wide }) {
  return (
    <div style={{ flex: wide ? '1.4' : '1', padding: '9px 11px', background: 'var(--light-bg)', borderRadius: 'var(--radius-sm)', minWidth: 0 }}>
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '3px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
        <span style={{ fontSize: wide ? '13px' : '17px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: tone?.color ?? (accent ? 'var(--navy)' : 'var(--text-dark)') }}>{value}</span>
        {sub && <span style={{ fontSize: '11px', color: tone?.color ?? 'var(--text-light)', opacity: 0.8 }}>{sub}</span>}
      </div>
    </div>
  )
}

function SectionHeading({ icon: Icon, label, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
      <Icon size={13} color="var(--text-muted)" />
      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</span>
      {count !== undefined && <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>· {count}</span>}
    </div>
  )
}

/* Grouped by module — cover is split across Medical and Life, Motor, General
   Insurance and so on, and which one a policy sits in is information itself. */
function PolicyGroup({ label, list, muted }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: muted ? 'var(--text-muted)' : 'var(--navy)' }}>{label}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{list.length}</span>
      </div>
      {list.map((p) => <PolicyCard key={p.id} policy={p} muted={muted} />)}
    </div>
  )
}

/* Fields already shown as named columns, so the expandable list never repeats
 * a value that is already on the card. */
const PROMOTED = new Set(['id', 'Name', 'Modified_Time', 'Created_Time', 'Last_Activity_Time',
  'Created_By', 'Modified_By', 'Owner', 'Tag', 'Record_Image', 'Locked__s', 'Record_Status__s',
  'Currency', 'Exchange_Rate', 'Layout', 'Unsubscribed_Mode', 'Unsubscribed_Time'])

/*
 * Zoho returns a file-upload field as an array of attachment records, each
 * carrying ids, sizes, owner and timestamps. Stringifying that put a screenful
 * of internal identifiers on screen where "Policy(5).pdf · 484 KB" belongs —
 * the filename is the only part an advisor was ever going to read.
 */
function asFiles(v) {
  if (!Array.isArray(v) || v.length === 0) return null
  const files = v.filter((f) => f && typeof f === 'object' && f.File_Name__s)
  if (files.length !== v.length) return null
  return files.map((f) => ({
    id: String(f.id ?? f.File_Id__s ?? f.File_Name__s),
    name: String(f.File_Name__s),
    size: Number(f.Size__s) || null,
  }))
}

function humanSize(bytes) {
  if (!bytes) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function extraFields(policy) {
  const raw = policy.raw ?? {}
  return Object.entries(raw)
    .filter(([k, v]) => !PROMOTED.has(k) && !k.startsWith('$') && v !== null && v !== '' && v !== undefined)
    .map(([k, v]) => {
      const files = asFiles(v)
      if (files) return { key: k.replace(/_/g, ' '), files }

      // A lookup collapses to its name; anything else object-shaped is a field
      // this code does not understand yet, and a JSON dump of it is noise
      // rather than information.
      const value = typeof v === 'object' && v !== null
        ? ('name' in v ? String(v.name) : Array.isArray(v) ? `${v.length} item(s)` : '')
        : String(v)
      return { key: k.replace(/_/g, ' '), value }
    })
    .filter((f) => f.files || (f.value !== '' && f.value !== undefined))
    .sort((a, b) => a.key.localeCompare(b.key))
}

/*
 * Dates lead, because the term is what an advisor checks first and a card that
 * buried it under twenty alphabetical fields was the old problem. Everything
 * the sync could not name still renders underneath.
 */
function PolicyCard({ policy, muted }) {
  const [open, setOpen] = useState(false)
  const days = daysUntil(policy.expires_on)
  const tone = expiryTone(days)
  const extras = open ? extraFields(policy) : []

  return (
    <div style={{
      marginBottom: '8px', border: '1px solid var(--border)',
      borderLeft: `3px solid ${muted ? 'var(--border-dark)' : tone.color}`,
      borderRadius: 'var(--radius-sm)', padding: '10px 12px', opacity: muted ? 0.85 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-dark)', wordBreak: 'break-all' }}>
          {policy.policy_number || 'No policy number'}
        </span>
        {policy.status && (
          <span style={{ fontSize: '10.5px', fontWeight: 600, padding: '1px 6px', borderRadius: '99px', background: 'var(--light-bg)', color: 'var(--text-muted)' }}>
            {policy.status}
          </span>
        )}
      </div>

      {(policy.policy_type || policy.insurer) && (
        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {[policy.policy_type, policy.insurer].filter(Boolean).join(' · ')}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '7px', fontSize: '12px', fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ color: 'var(--text-muted)' }}>{formatDate(policy.issued_on) || '—'}</span>
        <span style={{ color: 'var(--text-light)' }}>→</span>
        <span style={{ color: tone.color, fontWeight: tone.weight }}>{formatDate(policy.expires_on) || 'no expiry'}</span>
        {days !== null && (
          <span style={{ fontSize: '11px', color: tone.color, opacity: 0.75 }}>
            {days < 0 ? `lapsed ${relativeLabel(days)}` : relativeLabel(days)}
          </span>
        )}
      </div>

      {policy.premium && (
        <div style={{ fontSize: '11.5px', color: 'var(--text-mid)', marginTop: '4px' }}>
          Premium <strong style={{ color: 'var(--text-dark)' }}>{policy.premium}</strong>
        </div>
      )}

      <button type="button" onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '7px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '11px', color: 'var(--text-light)' }}>
        <ChevronRight size={11} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
        {open ? 'Fewer details' : 'All fields'}
      </button>
      {open && extras.length > 0 && (
        <div style={{ marginTop: '6px' }}>
          {extras.map((f) => (
            <div key={f.key} style={{ display: 'grid', gridTemplateColumns: '138px 1fr', gap: '8px', padding: '3px 0', fontSize: '12.5px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'capitalize' }}>{f.key}</span>
              {f.files
                ? (
                  <span style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', minWidth: 0 }}>
                    {f.files.map((file) => (
                      /* Not a link yet: Zoho attachments need an authenticated
                         download, so a bare href would 401. Name and size are
                         enough to know the document exists and which it is. */
                      <span key={file.id} title={file.name}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', maxWidth: '100%', padding: '2px 7px', background: 'var(--light-bg)', border: '1px solid var(--border)', borderRadius: '99px', fontSize: '11.5px', color: 'var(--text-dark)' }}>
                        <Paperclip size={11} style={{ flexShrink: 0, color: 'var(--text-light)' }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                        {humanSize(file.size) && (
                          <span style={{ flexShrink: 0, color: 'var(--text-light)' }}>{humanSize(file.size)}</span>
                        )}
                      </span>
                    ))}
                  </span>
                )
                : <span style={{ color: 'var(--text-dark)', minWidth: 0, wordBreak: 'break-word' }}>{f.value}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
