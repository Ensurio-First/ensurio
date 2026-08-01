import { useEffect, useState } from 'react'
import { Search, RefreshCw, X, FileText, Info, AlertTriangle } from 'lucide-react'
import { invokeFn } from './lib/supabase'

/*
 * Clients and their policies, read live from Zoho CRM.
 *
 * Fields are rendered from whatever the record actually carries rather than
 * mapped to names chosen in advance — this CRM has not been introspected, and
 * inventing field names would produce a table of blanks that looks like missing
 * data rather than a wrong guess.
 *
 * Which module the policies came from is shown on screen for the same reason:
 * if the detection picked the wrong one, that should be visible, not silent.
 */
export default function ClientsView() {
  const [rows, setRows] = useState([])
  const [clientModule, setClientModule] = useState(null)
  const [q, setQ] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  const load = async (query, pageNum) => {
    setLoading(true); setError('')
    try {
      const res = await invokeFn('zoho-clients', { action: 'list', query, page: pageNum })
      setRows(res.rows ?? [])
      setHasMore(Boolean(res.hasMore))
      setClientModule(res.clientModule ?? null)
    } catch (e) {
      setError(e.message || 'Could not load clients.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(submitted, page) }, [submitted, page])

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
                <tr><th>Client</th><th>Email</th><th>Phone</th><th>City</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} onClick={() => openClient(r)} aria-selected={selected?.id === r.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{r.name}</td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-mid)' }}>{r.email || '—'}</td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-mid)' }}>{r.phone || '—'}</td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{r.city || '—'}</td>
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

function ClientPanel({ row, detail, loading, error, onClose }) {
  return (
    <aside className="portal-detail"
      style={{ width: '420px', flexShrink: 0, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '18px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', position: 'sticky', top: '16px' }}>
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
          <FieldTable fields={detail.client.fields} />

          <div style={{ marginTop: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <FileText size={13} color="var(--text-muted)" />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Policies
              </span>
              {detail.policyModule && (
                <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>· {detail.policyModule}</span>
              )}
            </div>

            {detail.policyNote && (
              <p style={{ display: 'flex', gap: '7px', padding: '10px 12px', background: 'var(--light-bg)', borderRadius: 'var(--radius-sm)', fontSize: '12px', lineHeight: 1.55, color: 'var(--text-mid)' }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: '1px' }} /> {detail.policyNote}
              </p>
            )}

            {detail.policies?.map((p, i) => (
              <div key={p.id} style={{ marginTop: i ? '10px' : 0, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                <FieldTable fields={p.fields} dense />
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
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
