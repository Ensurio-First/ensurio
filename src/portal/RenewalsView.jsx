import { useEffect, useState } from 'react'
import { Search, AlertTriangle, Mail, Info, CalendarClock, Layers, X } from 'lucide-react'
import {
  fetchRenewals, fetchRenewalStats, fetchRenewalLines, fetchNoticePlan,
  fetchRenewalBreakdown, RENEWAL_BUCKETS, RENEWAL_DIMENSIONS,
} from './lib/supabase'
import { formatDate, expiryTone, relativeLabel } from './lib/format'

/*
 * The renewal book: what lapses when, and who would be told.
 *
 * The Clients tab answers "what does this client hold". This one answers the
 * question the business actually runs on — what is coming up — which was
 * unanswerable while the portal read Zoho live, because expiry lives on the
 * policy modules and no client query could be ordered by it.
 *
 * Nothing here sends anything. The notice plan below is a statement of what a
 * reminder rule WOULD do against today's data, deliberately built and shipped
 * before any sending exists: the numbers are how you find out whether the rules
 * are right, and whether the data underneath them is, while the cost of being
 * wrong is still zero.
 */
export default function RenewalsView() {
  const [bucket, setBucket] = useState('90')
  const [line, setLine] = useState('')
  const [type, setType] = useState('')
  const [insurer, setInsurer] = useState('')
  const [dimension, setDimension] = useState('type')
  const [q, setQ] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [page, setPage] = useState(1)

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [stats, setStats] = useState(null)
  const [lines, setLines] = useState([])
  const [plan, setPlan] = useState(null)
  const [breakdown, setBreakdown] = useState(null)

  useEffect(() => {
    fetchRenewalStats().then(setStats).catch(() => setStats(null))
    fetchRenewalLines().then(setLines).catch(() => setLines([]))
    fetchNoticePlan().then(setPlan).catch(() => setPlan(null))
  }, [])

  // The breakdown describes the window, so it follows the window — and the
  // dimension, which is the whole point of it.
  useEffect(() => {
    let cancelled = false
    setBreakdown(null)
    fetchRenewalBreakdown(bucket, dimension)
      .then((b) => { if (!cancelled) setBreakdown(b) })
      .catch(() => { if (!cancelled) setBreakdown([]) })
    return () => { cancelled = true }
  }, [bucket, dimension])

  /* Selecting a slice replaces the previous one rather than stacking: three
   * simultaneous classifications is a query nobody meant to ask. */
  const pickSlice = (dim, label) => {
    setPage(1)
    setLine(dim === 'line' ? label : '')
    setType(dim === 'type' ? label : '')
    setInsurer(dim === 'insurer' ? label : '')
  }

  const clearSlice = () => { setPage(1); setLine(''); setType(''); setInsurer('') }
  const activeSlice = type || insurer || line

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError('')
    fetchRenewals({ bucket, line, type, insurer, query: submitted, page })
      .then((res) => {
        if (cancelled) return
        setRows(res.rows); setTotal(res.total); setHasMore(res.hasMore)
      })
      .catch((e) => { if (!cancelled) { setError(e.message || 'Could not load renewals.'); setRows([]) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [bucket, line, type, insurer, submitted, page])

  const ctrl = { height: '38px', padding: '0 12px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-mid)', background: 'var(--white)', border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }

  return (
    <>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {RENEWAL_BUCKETS.map((b) => (
          <BucketTile key={b.id} bucket={b} stat={stats?.[b.id]} on={bucket === b.id}
            onClick={() => { setBucket(b.id); setPage(1) }} />
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSubmitted(q.trim()) }}
        style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '360px' }}>
          <Search size={15} color="var(--text-light)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
          <input className="portal-input" type="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Client, policy number, insurer or contact" aria-label="Search renewals"
            style={{ width: '100%', height: '38px', padding: '0 12px 0 34px', boxSizing: 'border-box', fontFamily: 'var(--font-body)', fontSize: '13px', background: 'var(--white)', border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-sm)', outline: 'none' }} />
        </div>
        <button type="submit" style={{ ...ctrl, fontWeight: 700 }}>Search</button>
        {submitted && <button type="button" onClick={() => { setQ(''); setSubmitted(''); setPage(1) }} style={{ ...ctrl, fontWeight: 600 }}>Clear</button>}

        <select value={line} onChange={(e) => { pickSlice('line', e.target.value) }} aria-label="Line of business" style={{ ...ctrl, fontWeight: 600 }}>
          <option value="">All lines</option>
          {lines.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        {activeSlice && (
          <button type="button" onClick={clearSlice}
            style={{ ...ctrl, display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, borderColor: 'var(--navy)', color: 'var(--navy)' }}>
            {activeSlice} <X size={13} />
          </button>
        )}

        <span style={{ fontSize: '11.5px', color: 'var(--text-light)' }}>
          {total.toLocaleString()} polic{total === 1 ? 'y' : 'ies'}
        </span>
      </form>

      <Breakdown
        groups={breakdown}
        dimension={dimension}
        onDimension={setDimension}
        active={activeSlice}
        onPick={(label) => pickSlice(dimension, label)}
      />

      <NoticePlan plan={plan} stats={stats} />

      {error && (
        <p role="alert" style={{ display: 'flex', gap: '8px', padding: '14px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '13.5px', marginBottom: '1rem' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> {error}
        </p>
      )}

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="portal-table">
            <thead>
              <tr>
                <th>Expires</th><th>Client</th><th>Policy</th><th>Line</th>
                <th>Insurer</th><th style={{ textAlign: 'right' }}>Premium</th><th>Renewal contact</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const tone = expiryTone(r.days_to_expiry)
                return (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: tone.weight, color: tone.color, fontSize: '12.5px' }}>
                        {formatDate(r.expires_on)}
                      </span>
                      <span style={{ marginLeft: '6px', fontSize: '11px', color: tone.color, opacity: 0.75 }}>
                        {relativeLabel(r.days_to_expiry)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{r.client_name}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-mid)', wordBreak: 'break-all' }}>{r.policy_number || '—'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {r.policy_type || r.module_label}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.insurer || '—'}</td>
                    <td style={{ textAlign: 'right', fontSize: '12.5px', fontVariantNumeric: 'tabular-nums', color: 'var(--text-mid)' }}>
                      {r.premium || '—'}
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {r.renewal_email
                        ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: r.renewal_email_valid ? 'var(--text-mid)' : '#B54708' }}>
                            <Mail size={11} style={{ flexShrink: 0, opacity: 0.7 }} />
                            <span style={{ wordBreak: 'break-all' }}>{r.renewal_email}</span>
                            {/* Renewal_Receiver is free text, so some entries are
                                names or notes. Flagged rather than hidden — these
                                are the ones a reminder could never reach. */}
                            {!r.renewal_email_valid && <span title="Not a valid email address">⚠</span>}
                          </span>
                        )
                        : <span style={{ color: '#B42318' }}>no contact</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {loading && <p style={{ padding: '2.5rem 1rem', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>Loading…</p>}
        {!loading && !error && rows.length === 0 && (
          <p style={{ padding: '2.5rem 1rem', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Nothing in this window.
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
    </>
  )
}

function BucketTile({ bucket, stat, on, onClick }) {
  const accent = bucket.tone === 'bad' ? '#B42318'
    : bucket.tone === 'urgent' ? '#B54708'
      : bucket.tone === 'soon' ? 'var(--gold-dark)' : 'var(--navy)'

  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      style={{
        flex: '1 1 140px', textAlign: 'left', cursor: 'pointer',
        padding: '11px 13px', borderRadius: 'var(--radius-sm)',
        background: on ? 'var(--white)' : 'var(--light-bg)',
        border: `1px solid ${on ? accent : 'var(--border)'}`,
        boxShadow: on ? 'var(--shadow-sm)' : 'none',
      }}>
      <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '4px' }}>
        {bucket.label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ fontSize: '19px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: accent }}>
          {stat ? stat.total.toLocaleString() : '·'}
        </span>
        {/* Contactable is the number that matters once reminders exist; showing
            it now is how a gap in the data becomes visible before it matters. */}
        {stat && stat.total > 0 && (
          <span style={{ fontSize: '11px', color: stat.contactable === stat.total ? 'var(--text-light)' : '#B54708' }}>
            {stat.contactable === stat.total ? 'all reachable' : `${stat.contactable} reachable`}
          </span>
        )}
      </div>
    </button>
  )
}

/*
 * How the window breaks down — by line, product or insurer.
 *
 * Three dimensions rather than one because they answer different questions:
 * which part of the book is renewing, which products need which expertise, and
 * how much sits with a single carrier. That last one is the concentration
 * question, and it is invisible in a list sorted by date.
 *
 * Bars are proportions of the largest row rather than of the total, because at
 * twenty-plus categories a share-of-total bar is a row of slivers.
 */
function Breakdown({ groups, dimension, onDimension, active, onPick }) {
  const [open, setOpen] = useState(true)
  const max = Math.max(1, ...(groups ?? []).flatMap((g) => g.items.map((i) => i.total)))

  return (
    <div style={{ marginBottom: '1rem', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '11px 14px' }}>
        <button type="button" onClick={() => setOpen((o) => !o)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <Layers size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Breakdown
          </span>
        </button>

        <div style={{ display: 'flex', gap: '2px', background: 'var(--light-bg)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
          {RENEWAL_DIMENSIONS.map((d) => (
            <button key={d.id} type="button" onClick={() => onDimension(d.id)} aria-pressed={dimension === d.id}
              style={{
                padding: '5px 11px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                fontSize: '12px', fontWeight: 700,
                background: dimension === d.id ? 'var(--white)' : 'transparent',
                color: dimension === d.id ? 'var(--navy)' : 'var(--text-muted)',
                boxShadow: dimension === d.id ? 'var(--shadow-sm)' : 'none',
              }}>
              {d.label}
            </button>
          ))}
        </div>

        <span style={{ marginLeft: 'auto', fontSize: '11.5px', color: 'var(--text-light)' }}>
          {open ? 'hide' : 'show'}
        </span>
      </div>

      {open && (
        <div style={{ padding: '0 14px 14px' }}>
          {!groups && <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Counting…</p>}
          {groups?.length === 0 && <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Nothing in this window.</p>}

          {groups?.map((g) => (
            <div key={g.label ?? 'all'} style={{ marginBottom: '10px' }}>
              {/* Only the type breakdown nests, so the heading is conditional
                  rather than a group of one called "All". */}
              {g.label && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', marginBottom: '5px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--navy)' }}>{g.label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{g.total}</span>
                </div>
              )}

              {g.items.map((item) => {
                const on = active === item.label
                return (
                  <button key={item.label} type="button" onClick={() => onPick(item.label)} aria-pressed={on}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 90px 46px', alignItems: 'center', gap: '10px',
                      width: '100%', padding: '4px 7px', marginBottom: '2px', textAlign: 'left', cursor: 'pointer',
                      background: on ? 'var(--light-bg)' : 'transparent',
                      border: `1px solid ${on ? 'var(--border-dark)' : 'transparent'}`,
                      borderRadius: 'var(--radius-sm)', fontSize: '12.5px',
                    }}>
                    <span style={{ color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                    <span style={{ height: '6px', background: 'var(--light-bg)', borderRadius: '99px', overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: `${Math.max(4, (item.total / max) * 100)}%`, background: 'var(--teal)', borderRadius: '99px' }} />
                    </span>
                    <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: 'var(--text-mid)' }}>
                      {item.total}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/*
 * What reminder rules would do, stated plainly and doing nothing.
 *
 * `In window` is everything currently inside the period — what a rule switched
 * on today would have to catch up on. `Would send today` is the count landing
 * exactly on the offset, which is what a daily job actually sends once running.
 * The two differ by weeks of backlog, and confusing them is how a first run
 * emails six hundred people at once.
 */
function NoticePlan({ plan, stats }) {
  const [open, setOpen] = useState(true)
  const lapsed = stats?.expired?.total ?? 0

  return (
    <div style={{ marginBottom: '1rem', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <CalendarClock size={14} color="var(--text-muted)" />
        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Reminder plan
        </span>
        <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: 'var(--light-bg)', color: 'var(--text-muted)' }}>
          nothing is sent
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '11.5px', color: 'var(--text-light)' }}>{open ? 'hide' : 'show'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 14px 14px' }}>
          <p style={{ display: 'flex', gap: '7px', fontSize: '12px', lineHeight: 1.6, color: 'var(--text-mid)', marginBottom: '12px' }}>
            <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
            No email is configured and nothing is scheduled to send. These are the numbers a
            60/30/7-day rule would produce against today&rsquo;s data — here so the rules and the
            data can be checked while being wrong still costs nothing.
          </p>

          <table className="portal-table" style={{ marginBottom: '10px' }}>
            <thead>
              <tr>
                <th>Rule</th>
                <th style={{ textAlign: 'right' }}>In window</th>
                <th style={{ textAlign: 'right' }}>Would send today</th>
              </tr>
            </thead>
            <tbody>
              {(plan ?? []).map((p) => (
                <tr key={p.days}>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-dark)' }}>{p.days} days before expiry</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: '12.5px', color: 'var(--text-mid)' }}>{p.inWindow}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: '13px', fontWeight: 700, color: p.dueToday ? 'var(--navy)' : 'var(--text-light)' }}>{p.dueToday}</td>
                </tr>
              ))}
              {!plan && <tr><td colSpan={3} style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Calculating…</td></tr>}
            </tbody>
          </table>

          {lapsed > 0 && (
            <p style={{ display: 'flex', gap: '7px', padding: '9px 11px', background: 'var(--gold-soft)', borderRadius: 'var(--radius-sm)', fontSize: '11.5px', lineHeight: 1.55, color: 'var(--text-mid)' }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>
                <strong>{lapsed.toLocaleString()}</strong> policies are already past their expiry date and
                would fall outside every rule. Some are genuinely lapsed; a large block share one
                date, which looks like bulk entry rather than real terms. Worth resolving in Zoho
                before any reminder is switched on — automation makes a data problem louder, not smaller.
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
