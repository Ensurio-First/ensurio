import { useEffect, useMemo, useState } from 'react'
import { Search, RefreshCw, X, FileText, Info, AlertTriangle, ChevronRight, Archive } from 'lucide-react'
import { invokeFn } from './lib/supabase'

/*
 * Clients and their policies, read live from Zoho CRM.
 *
 * The screen is built around renewals rather than around records, because that
 * is the job: an advisor opening this tab wants to know who lapses next, not to
 * browse a CRM they could already open in another window. So the list carries a
 * next-expiry column banded by urgency, and each policy card leads with the
 * dates.
 *
 * Cover is split across five modules in this CRM and they are not equivalent —
 * three hold the live book, two hold an endorsement ledger and a pre-2023
 * archive. The live ones are shown first and the other two sit behind a
 * collapsed "Historical" heading: still reachable, never competing with current
 * cover for attention. The policy COUNT deliberately spans all five, so the
 * number never disagrees with what Zoho itself reports.
 */

/** "26 Feb 2027" — unambiguous in a way that 02/26/27 is not. */
function formatDate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${String(d).padStart(2, '0')} ${months[m - 1]} ${y}`
}

/* Whole days between today and an ISO date, negative once it is past. Compared
 * as calendar dates rather than timestamps so a policy does not appear to lapse
 * early for anyone reading the portal from a different timezone. */
function daysUntil(iso) {
  if (!iso) return null
  const today = new Date().toISOString().slice(0, 10)
  const ms = Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)
  return Math.round(ms / 86400000)
}

/*
 * Four bands, not a gradient. An advisor scanning the column needs to sort
 * rows into "gone", "this month", "this quarter" and "fine" at a glance, and a
 * continuous scale makes every row look mildly urgent.
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

export default function ClientsView() {
  const [rows, setRows] = useState([])
  const [clientModule, setClientModule] = useState(null)
  const [q, setQ] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortByExpiry, setSortByExpiry] = useState(false)

  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  const [counts, setCounts] = useState(null)
  const [countsPartial, setCountsPartial] = useState(false)

  const load = async (query, pageNum) => {
    setLoading(true); setError(''); setCounts(null); setCountsPartial(false)
    try {
      const res = await invokeFn('zoho-clients', { action: 'list', query, page: pageNum })
      const list = res.rows ?? []
      setRows(list)
      setHasMore(Boolean(res.hasMore))
      setClientModule(res.clientModule ?? null)

      /*
       * Counts and renewal dates come after the table is already on screen.
       * They are eight aggregate queries against Zoho, and making the list wait
       * on them would trade a fast page for a tidier one. A failure here leaves
       * the numbers blank rather than emptying the client list.
       */
      if (list.length) {
        invokeFn('zoho-clients', { action: 'counts', ids: list.map((r) => r.id) })
          .then((c) => { setCounts(c.counts ?? {}); setCountsPartial(Boolean(c.partial)) })
          .catch(() => setCounts({}))
      }
    } catch (e) {
      setError(e.message || 'Could not load clients.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(submitted, page) }, [submitted, page])

  /*
   * Sorting is confined to the loaded page and says so on screen. Expiry lives
   * on the policy modules, not on the client record, so Zoho cannot order the
   * client query by it — sorting the whole book would mean reading the whole
   * book. Ordering fifty rows is honest as long as it does not pretend to be
   * "the next fifty renewals in the business".
   */
  const visible = useMemo(() => {
    if (!sortByExpiry || !counts) return rows
    return [...rows].sort((a, b) => {
      const x = counts[a.id]?.nextExpiry
      const y = counts[b.id]?.nextExpiry
      if (x && y) return x.localeCompare(y)
      return x ? -1 : y ? 1 : 0
    })
  }, [rows, counts, sortByExpiry])

  const openClient = async (row) => {
    setSelected(row); setDetail(null); setDetailError(''); setDetailLoading(true)
    try {
      const res = await invokeFn('zoho-clients', { action: 'detail', id: row.id })
      if (!res.found) setDetailError('That client could not be found in Zoho.')
      else setDetail(res)
    } catch (e) {
      setDetailError(e.message || 'Could not load this client.')
    } finally {
      setDetailLoading(false)
    }
  }

  // Search is submitted rather than live: every keystroke would be a Zoho API
  // call, and the credit budget is per-org and shared with everything else.
  const submitSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSubmitted(q.trim())
  }

  const ctrl = { height: '38px', padding: '0 12px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-mid)', background: 'var(--white)', border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }

  return (
    <>
      <form onSubmit={submitSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
          <Search size={15} color="var(--text-light)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
          <input className="portal-input" type="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email or phone — then press Enter" aria-label="Search clients"
            style={{ width: '100%', height: '38px', padding: '0 12px 0 34px', boxSizing: 'border-box', fontFamily: 'var(--font-body)', fontSize: '13px', background: 'var(--white)', border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-sm)', outline: 'none' }} />
        </div>
        <button type="submit" style={{ ...ctrl, fontWeight: 700 }}>Search</button>
        {submitted && (
          <button type="button" onClick={() => { setQ(''); setSubmitted(''); setPage(1) }} style={{ ...ctrl, fontWeight: 600 }}>
            Clear
          </button>
        )}
        <button type="button" onClick={() => load(submitted, page)} disabled={loading}
          style={{ ...ctrl, display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <RefreshCw size={14} style={loading ? { animation: 'portal-spin 0.7s linear infinite' } : undefined} /> Refresh
        </button>
        {clientModule && (
          <span style={{ fontSize: '11.5px', color: 'var(--text-light)' }}>
            from CRM <strong style={{ color: 'var(--text-muted)' }}>{clientModule}</strong>
          </span>
        )}
        {/* A count that silently omits a module would be read as the truth. */}
        {countsPartial && (
          <span title="At least one policy module could not be counted — totals may be understated."
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: 'var(--gold-dark)' }}>
            <AlertTriangle size={13} /> counts incomplete
          </span>
        )}
      </form>

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
                  <th style={{ textAlign: 'right' }}>
                    <button type="button" onClick={() => setSortByExpiry((s) => !s)}
                      title={sortByExpiry ? 'Showing this page soonest-first — click to restore CRM order' : 'Sort this page by soonest renewal'}
                      style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: sortByExpiry ? 'var(--navy)' : 'inherit', cursor: 'pointer' }}>
                      Next expiry{sortByExpiry ? ' ↑' : ''}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id} onClick={() => openClient(r)} aria-selected={selected?.id === r.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{r.name}</td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-mid)' }}>{r.email || '—'}</td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-mid)' }}>{r.phone || '—'}</td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{r.city || '—'}</td>
                    <td style={{ textAlign: 'right' }}><PolicyCount entry={counts?.[r.id]} pending={counts === null} /></td>
                    <td style={{ textAlign: 'right' }}><NextExpiry entry={counts?.[r.id]} pending={counts === null} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && <p style={{ padding: '2.5rem 1rem', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>Loading from Zoho…</p>}
          {!loading && !error && rows.length === 0 && (
            <p style={{ padding: '2.5rem 1rem', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
              {submitted ? `No clients matching “${submitted}”.` : 'No clients returned from Zoho.'}
            </p>
          )}

          {sortByExpiry && rows.length > 0 && (
            <p style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: '11.5px', color: 'var(--text-light)' }}>
              Sorted within this page only — renewal dates live on the policy records, so Zoho cannot order the whole book by them.
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
            detail={detail}
            loading={detailLoading}
            error={detailError}
            onClose={() => { setSelected(null); setDetail(null); setDetailError('') }}
          />
        )}
      </div>
    </>
  )
}

/*
 * Three states, not two. A count still loading must not render as 0 — an
 * advisor reading "0 policies" against a client who has four would believe it.
 * Pending shows a dash placeholder; a genuine zero shows a muted 0.
 */
function PolicyCount({ entry, pending }) {
  if (pending) return <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>·</span>
  if (!entry) return <span style={{ color: 'var(--text-light)', fontSize: '12.5px' }}>—</span>

  const breakdown = Object.entries(entry.byModule).map(([label, n]) => `${label}: ${n}`).join('\n')

  return (
    <span title={breakdown || undefined}
      style={{
        fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '13px',
        color: entry.total ? 'var(--navy)' : 'var(--text-light)',
        borderBottom: breakdown ? '1px dotted var(--border-dark)' : 'none', cursor: breakdown ? 'help' : 'inherit',
      }}>
      {entry.total}
    </span>
  )
}

/*
 * The soonest expiry still ahead of today, across the live modules.
 *
 * A client with policies but no future expiry is meaningfully different from
 * one with no policies at all — the first has lapsed or holds only endorsement
 * rows, the second is new. They read differently here rather than both showing
 * a dash.
 */
function NextExpiry({ entry, pending }) {
  if (pending) return <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>·</span>
  if (!entry) return <span style={{ color: 'var(--text-light)', fontSize: '12.5px' }}>—</span>

  if (!entry.nextExpiry) {
    return (
      <span title={entry.total ? 'No policy with an expiry date in the future.' : undefined}
        style={{ fontSize: '12px', color: 'var(--text-light)' }}>
        {entry.total ? 'none current' : '—'}
      </span>
    )
  }

  const days = daysUntil(entry.nextExpiry)
  const tone = expiryTone(days)

  return (
    <span title={entry.nextExpiryModule ? `Earliest future expiry — ${entry.nextExpiryModule}` : undefined}
      style={{ display: 'inline-flex', alignItems: 'baseline', gap: '6px', padding: tone.bg === 'transparent' ? 0 : '2px 6px', borderRadius: 'var(--radius-sm)', background: tone.bg }}>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '12.5px', fontWeight: tone.weight, color: tone.color }}>
        {formatDate(entry.nextExpiry)}
      </span>
      <span style={{ fontSize: '11px', color: tone.color, opacity: 0.75 }}>{relativeLabel(days)}</span>
    </span>
  )
}

function ClientPanel({ row, detail, loading, error, onClose }) {
  const [showHistory, setShowHistory] = useState(false)
  const historical = detail?.historicalGroups ?? []
  const historicalCount = historical.reduce((n, g) => n + g.policies.length, 0)

  return (
    <aside className="portal-detail"
      style={{ width: '440px', flexShrink: 0, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '18px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', position: 'sticky', top: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)' }}>
          {detail?.client?.name || row.name}
        </h2>
        <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
          <X size={18} />
        </button>
      </div>

      {loading && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading from Zoho…</p>}
      {error && <p role="alert" style={{ fontSize: '13px', color: 'var(--danger)' }}>{error}</p>}

      {detail && (
        <>
          {/* The three numbers an advisor opens a client for, before any detail. */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <Stat label="Active" value={detail.activePolicies ?? 0} accent />
            <Stat label="On record" value={detail.totalPolicies ?? 0} />
            <Stat label="Next renewal"
              value={detail.nextExpiry ? formatDate(detail.nextExpiry) : '—'}
              sub={detail.nextExpiry ? relativeLabel(daysUntil(detail.nextExpiry)) : null}
              tone={detail.nextExpiry ? expiryTone(daysUntil(detail.nextExpiry)) : null} wide />
          </div>

          <FieldTable fields={detail.client.fields} />

          <div style={{ marginTop: '18px' }}>
            <SectionHeading icon={FileText} label="Current cover" count={detail.activePolicies} />

            {detail.policyGroups?.length === 0 && (
              <p style={{ display: 'flex', gap: '7px', padding: '10px 12px', background: 'var(--light-bg)', borderRadius: 'var(--radius-sm)', fontSize: '12px', lineHeight: 1.55, color: 'var(--text-mid)' }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                No current-book policies on this client.
                {historicalCount > 0 && ' There are historical records below.'}
              </p>
            )}

            {detail.policyGroups?.map((g) => <PolicyGroup key={g.module} group={g} />)}
          </div>

          {/* Endorsement rows and the pre-2023 archive. Reachable, but never
              competing with live cover for the eye. */}
          {historical.length > 0 && (
            <div style={{ marginTop: '18px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
              <button type="button" onClick={() => setShowHistory((s) => !s)}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <ChevronRight size={13} style={{ transform: showHistory ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                <Archive size={13} />
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Historical
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>· {historicalCount}</span>
              </button>

              {showHistory && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ fontSize: '11.5px', lineHeight: 1.5, color: 'var(--text-light)', marginBottom: '10px' }}>
                    Endorsement entries and the pre-2023 book. Mostly without expiry dates, and not counted as current cover.
                  </p>
                  {historical.map((g) => <PolicyGroup key={g.module} group={g} muted />)}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </aside>
  )
}

function Stat({ label, value, sub, accent, tone, wide }) {
  return (
    <div style={{ flex: wide ? '1.4' : '1', padding: '9px 11px', background: 'var(--light-bg)', borderRadius: 'var(--radius-sm)', minWidth: 0 }}>
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '3px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
        <span style={{ fontSize: wide ? '13px' : '17px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: tone?.color ?? (accent ? 'var(--navy)' : 'var(--text-dark)') }}>
          {value}
        </span>
        {sub && <span style={{ fontSize: '11px', color: tone?.color ?? 'var(--text-light)', opacity: 0.8 }}>{sub}</span>}
      </div>
    </div>
  )
}

function SectionHeading({ icon: Icon, label, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
      <Icon size={13} color="var(--text-muted)" />
      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {label}
      </span>
      {count !== undefined && <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>· {count}</span>}
    </div>
  )
}

/* Grouped by module — cover is split across Medical and Life, Motor, General
   Insurance and so on, and which one a policy sits in is information itself. */
function PolicyGroup({ group, muted }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: muted ? 'var(--text-muted)' : 'var(--navy)' }}>{group.label}</span>
        {group.policies.length > 0 && (
          <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{group.policies.length}</span>
        )}
      </div>

      {group.note && (
        <p style={{ display: 'flex', gap: '7px', padding: '8px 10px', background: 'var(--gold-soft)', borderRadius: 'var(--radius-sm)', fontSize: '11.5px', lineHeight: 1.5, color: 'var(--text-mid)' }}>
          <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '1px' }} /> {group.note}
        </p>
      )}

      {group.policies.map((p) => <PolicyCard key={p.id} policy={p} muted={muted} />)}
    </div>
  )
}

/*
 * One policy. Dates lead, because the term is what an advisor checks first and
 * a card that buried it under twenty alphabetical fields was the old problem.
 * Everything the metadata could not name still renders underneath, so a field
 * this org uses in a way I did not anticipate is visible rather than dropped.
 */
function PolicyCard({ policy, muted }) {
  const [open, setOpen] = useState(false)
  const days = daysUntil(policy.expiresOn)
  const tone = expiryTone(days)
  const lapsed = days !== null && days < 0

  return (
    <div style={{
      marginBottom: '8px', border: '1px solid var(--border)', borderLeft: `3px solid ${muted ? 'var(--border-dark)' : tone.color}`,
      borderRadius: 'var(--radius-sm)', padding: '10px 12px', opacity: muted ? 0.85 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-dark)', wordBreak: 'break-all' }}>
          {policy.number || 'No policy number'}
        </span>
        {policy.status && (
          <span style={{ fontSize: '10.5px', fontWeight: 600, padding: '1px 6px', borderRadius: '99px', background: 'var(--light-bg)', color: 'var(--text-muted)' }}>
            {policy.status}
          </span>
        )}
      </div>

      {(policy.type || policy.insurer) && (
        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {[policy.type, policy.insurer].filter(Boolean).join(' · ')}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '7px', fontSize: '12px', fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ color: 'var(--text-muted)' }}>{formatDate(policy.issuedOn) || '—'}</span>
        <span style={{ color: 'var(--text-light)' }}>→</span>
        <span style={{ color: tone.color, fontWeight: tone.weight }}>{formatDate(policy.expiresOn) || 'no expiry'}</span>
        {days !== null && (
          <span style={{ fontSize: '11px', color: tone.color, opacity: 0.75 }}>
            {lapsed ? `lapsed ${relativeLabel(days)}` : relativeLabel(days)}
          </span>
        )}
      </div>

      {policy.premium && (
        <div style={{ fontSize: '11.5px', color: 'var(--text-mid)', marginTop: '4px' }}>
          Premium <strong style={{ color: 'var(--text-dark)' }}>{policy.premium}</strong>
        </div>
      )}

      {policy.fields?.length > 0 && (
        <>
          <button type="button" onClick={() => setOpen((o) => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '7px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '11px', color: 'var(--text-light)' }}>
            <ChevronRight size={11} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
            {open ? 'Fewer details' : `${policy.fields.length} more field${policy.fields.length === 1 ? '' : 's'}`}
          </button>
          {open && <div style={{ marginTop: '6px' }}><FieldTable fields={policy.fields} dense /></div>}
        </>
      )}
    </div>
  )
}

function FieldTable({ fields, dense }) {
  if (!fields?.length) return null
  return (
    <div>
      {fields.map((f) => (
        <div key={f.key} style={{ display: 'grid', gridTemplateColumns: '138px 1fr', gap: '8px', padding: dense ? '3px 0' : '6px 0', borderTop: dense ? 'none' : '1px solid var(--border)', fontSize: '12.5px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'capitalize' }}>{f.key}</span>
          <span style={{ color: 'var(--text-dark)', minWidth: 0, wordBreak: 'break-word' }}>{f.value}</span>
        </div>
      ))}
    </div>
  )
}
