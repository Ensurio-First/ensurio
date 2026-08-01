/*
 * Shared visual tokens for the on-page tools.
 *
 * Kept as a style factory rather than a wrapper component: the tools differ a
 * lot in layout (a wizard, a slider panel, a triage tree, a matrix) but must
 * read as one family. Sharing the chrome and letting each own its body gives
 * consistency without forcing everything through the same markup.
 */
export default function toolStyles(isMobile) {
  return {
    shell: {
      border: '1px solid var(--border)',
      borderTop: '4px solid var(--teal)',
      background: 'var(--white)',
      boxShadow: 'var(--shadow-md)',
      margin: '1.25rem 0 2rem',
    },
    pad: { padding: isMobile ? '1.25rem' : '1.75rem 2rem' },
    headerBand: {
      padding: isMobile ? '1.25rem' : '1.75rem 2rem',
      background: 'var(--light-bg)',
      borderBottom: '1px solid var(--border)',
    },
    badge: {
      fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
      color: 'var(--teal-dark)', background: 'var(--teal-pale)', padding: '3px 9px',
    },
    heading: {
      fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--navy)',
      fontSize: isMobile ? '1.2rem' : '1.4rem', letterSpacing: '-0.02em',
      margin: '0.75rem 0 0.35rem',
    },
    muted: {
      fontFamily: 'var(--font-body)', fontSize: '13.5px',
      color: 'var(--text-muted)', lineHeight: 1.6,
    },
    label: {
      display: 'block', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-mid)',
    },
    eyebrow: {
      fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)',
    },
    primaryBtn: {
      display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px',
      background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer',
      fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700,
    },
    divider: { borderTop: '1px solid var(--border)', marginTop: '1.5rem', paddingTop: '1.5rem' },
  }
}

// AED figures read better without decimals and with thousands separators.
export const fmtAED = (n) =>
  `AED ${Math.round(n).toLocaleString('en-US')}`
