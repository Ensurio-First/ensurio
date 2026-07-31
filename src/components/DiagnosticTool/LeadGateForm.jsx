import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { submitLead } from '../../lib/supabase'

const styles = {
  gate: {
    background: 'var(--light-bg)',
    border: 'none',
    borderTop: '3px solid var(--teal)',
    borderRadius: 0,
    padding: '1.75rem',
    marginTop: '1.25rem',
  },
  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--navy)',
    marginBottom: '8px',
    lineHeight: 1.3,
  },
  desc: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: 1.65,
    marginBottom: '1.5rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginBottom: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    marginBottom: '14px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-mid)',
  },
  input: {
    padding: '12px 14px',
    border: '2px solid var(--border)',
    borderRadius: 0,
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    color: 'var(--text-dark)',
    outline: 'none',
    background: 'var(--white)',
    width: '100%',
    transition: 'border-color 0.2s',
  },
  error: {
    fontSize: '11px',
    color: 'var(--danger)',
    marginTop: '3px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '1.25rem',
    gap: '12px',
  },
  privacy: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  btn: {
    background: 'var(--teal)',
    color: 'var(--white)',
    border: 'none',
    padding: '13px 24px',
    borderRadius: 0,
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
}

export default function LeadGateForm({ reportLabel, onSubmit, tool, score, horizontal = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm()

  const submit = async (data) => {
    const label = tool ?? reportLabel ?? 'Diagnostic'
    try {
      await submitLead({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: `Diagnostic report request: ${label}${score != null ? ` — score ${score}` : ''}${data.company ? ` — Company: ${data.company}` : ''}`,
        service: label,
        source: 'diagnostic-tool',
      })
    } catch (err) {
      // Fall through on a missing config (e.g. some previews); block on real errors.
      if (err.message !== 'not-configured') {
        setError('root', { message: 'Failed to send — please try again or email us at consult@insurefirst.ae' })
        throw new Error('submit failed')
      }
    }
    onSubmit(data)
  }

  return (
    <motion.div
      style={{ ...styles.gate, padding: '1.5rem 1.75rem' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.125rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: '20px', height: '20px', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--white)', fontWeight: 800, flexShrink: 0 }}>↓</span>
            <div style={{ ...styles.title, marginBottom: 0 }}>Get Your Free {reportLabel}</div>
          </div>
          <div style={{ ...styles.desc, marginBottom: 0, fontSize: '12px' }}>
            Personalised PDF report with your full analysis, benchmarking, and recommended next steps.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0, paddingTop: '2px' }}>
          🔒 Strictly confidential
        </div>
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate>
        {horizontal ? (
          /* Horizontal layout */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', alignItems: 'start' }}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input style={{ ...styles.input, ...(errors.name ? { borderColor: 'var(--danger)' } : {}) }}
                placeholder="Your name"
                onFocus={(e) => (e.target.style.borderColor = 'var(--teal)')}
                onBlur={(e) => (e.target.style.borderColor = errors.name ? 'var(--danger)' : 'var(--border)')}
                {...register('name', { required: 'Required' })} />
              {errors.name && <span style={styles.error}>{errors.name.message}</span>}
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Work Email</label>
              <input style={{ ...styles.input, ...(errors.email ? { borderColor: 'var(--danger)' } : {}) }}
                placeholder="name@company.com" type="email"
                onFocus={(e) => (e.target.style.borderColor = 'var(--teal)')}
                onBlur={(e) => (e.target.style.borderColor = errors.email ? 'var(--danger)' : 'var(--border)')}
                {...register('email', { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
              {errors.email && <span style={styles.error}>{errors.email.message}</span>}
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Company Name</label>
              <input style={{ ...styles.input, ...(errors.company ? { borderColor: 'var(--danger)' } : {}) }}
                placeholder="Your company"
                onFocus={(e) => (e.target.style.borderColor = 'var(--teal)')}
                onBlur={(e) => (e.target.style.borderColor = errors.company ? 'var(--danger)' : 'var(--border)')}
                {...register('company', { required: 'Required' })} />
              {errors.company && <span style={styles.error}>{errors.company.message}</span>}
            </div>
            <div style={styles.field}>
              <label style={{ ...styles.label, visibility: 'hidden' }}>Submit</label>
              <button type="submit" style={{ ...styles.btn, width: '100%', justifyContent: 'center', padding: '12px 16px', fontSize: '13px' }} disabled={isSubmitting}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal-dark)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--teal)')}>
                {isSubmitting ? 'Sending...' : 'Send Report →'}
              </button>
            </div>
          </div>
        ) : (
          /* Default stacked layout */
          <>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input style={{ ...styles.input, ...(errors.name ? { borderColor: 'var(--danger)' } : {}) }}
                  placeholder="Your name"
                  onFocus={(e) => (e.target.style.borderColor = 'var(--teal)')}
                  onBlur={(e) => (e.target.style.borderColor = errors.name ? 'var(--danger)' : 'rgba(255,255,255,0.15)')}
                  {...register('name', { required: 'Required' })} />
                {errors.name && <span style={styles.error}>{errors.name.message}</span>}
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Work Email</label>
                <input style={{ ...styles.input, ...(errors.email ? { borderColor: 'var(--danger)' } : {}) }}
                  placeholder="name@company.com" type="email"
                  onFocus={(e) => (e.target.style.borderColor = 'var(--teal)')}
                  onBlur={(e) => (e.target.style.borderColor = errors.email ? 'var(--danger)' : 'rgba(255,255,255,0.15)')}
                  {...register('email', { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
                {errors.email && <span style={styles.error}>{errors.email.message}</span>}
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Company Name</label>
              <input style={{ ...styles.input, ...(errors.company ? { borderColor: 'var(--danger)' } : {}) }}
                placeholder="Your company or business"
                onFocus={(e) => (e.target.style.borderColor = 'var(--teal)')}
                onBlur={(e) => (e.target.style.borderColor = errors.company ? 'var(--danger)' : 'var(--border)')}
                {...register('company', { required: 'Required' })} />
              {errors.company && <span style={styles.error}>{errors.company.message}</span>}
            </div>
          </>
        )}

        {errors.root && (
          <p style={{ ...styles.error, marginBottom: '6px', fontSize: '11px' }}>{errors.root.message}</p>
        )}

        {!horizontal && (
          <div style={styles.footer}>
            <span style={styles.privacy}>🔒 Strictly confidential. No spam.</span>
            <button type="submit" style={styles.btn} disabled={isSubmitting}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal-dark)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--teal)')}>
              {isSubmitting ? 'Sending...' : `Get My Report ↓`}
            </button>
          </div>
        )}
      </form>
    </motion.div>
  )
}
