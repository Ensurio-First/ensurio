import logo from '../assets/logo.png'

const styles = {
  footer: { background: '#080F2B', padding: '3rem 2rem 1.5rem' },
  inner: { maxWidth: '1200px', margin: '0 auto' },
  top: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' },
  logo: { fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--white)', marginBottom: '0.75rem' },
  logoSpan: { color: 'var(--teal)' },
  tagline: { fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: '1rem' },
  contact: { fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.9 },
  colTitle: { fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '0.875rem' },
  link: { display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '6px', transition: 'color 0.2s' },
  bottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  legal: { fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 },
  legalLink: { color: 'rgba(255,255,255,0.5)', textDecoration: 'none' },
}

const LINKS = {
  Services: ['Risk Management', 'Management Consultancy', 'IOP Programme', 'Succession Planning'],
  Company: ['About Us', 'Our Team', 'Blog', 'Contact Us'],
}

export default function Footer() {
  return (
    <footer style={styles.footer} id="contact">
      <div style={styles.inner}>
        <div style={styles.top} className="footer-top">
          <div>
            <img src={logo} alt="Ensurio First" style={{ height: '80px', width: 'auto', marginBottom: '0.75rem', display: 'block', filter: 'brightness(0) invert(1)' }} />
            <p style={styles.tagline}>
              Ensurio First Risk Management Consultancies —<br />
              your 360-degree shield for corporate protection<br />
              and strategic growth.
            </p>
            <div style={styles.contact}>
              <div>
                📧{' '}
                <a href="mailto:consult@insurefirst.ae" style={{ color: 'inherit', textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.target.style.color = 'var(--teal)')}
                  onMouseLeave={(e) => (e.target.style.color = 'inherit')}
                >
                  consult@insurefirst.ae
                </a>
              </div>
              <div>
                💬{' '}
                <a
                  href="https://wa.me/971509765976?text=Hello!%20I%20found%20Ensurio%20First%20online%20and%20would%20like%20to%20learn%20more."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.target.style.color = '#25D366')}
                  onMouseLeave={(e) => (e.target.style.color = 'inherit')}
                >
                  +971 50 976 5976 (WhatsApp)
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                DMCC Business Centre, Dubai, UAE
              </div>
            </div>
          </div>

          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <div style={styles.colTitle}>{group}</div>
              {links.map((l) => (
                <a
                  key={l}
                  href="#"
                  style={styles.link}
                  onMouseEnter={(e) => (e.target.style.color = 'var(--teal)')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.5)')}
                >
                  {l}
                </a>
              ))}
            </div>
          ))}

          <div>
            <div style={styles.colTitle}>Legal</div>
            <a href="#" style={styles.link} onMouseEnter={(e) => (e.target.style.color = 'var(--teal)')} onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.5)')}>Privacy Policy</a>
            <a href="#" style={styles.link} onMouseEnter={(e) => (e.target.style.color = 'var(--teal)')} onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.5)')}>Terms of Use</a>
            <a href="#" style={styles.link} onMouseEnter={(e) => (e.target.style.color = 'var(--teal)')} onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.5)')}>Cookie Policy</a>
          </div>
        </div>

        <div style={styles.bottom}>
          <p style={styles.legal}>
            <a href="https://www.insurefirst.ae" style={styles.legalLink}>www.insurefirst.ae</a> is the official digital platform of Ensurio First Risk Management Consultancies (formerly known as Insure First Consultancy). All rights reserved. © {new Date().getFullYear()}
          </p>
          <p style={{ ...styles.legal, textAlign: 'right' }}>
            Licensed & Regulated · Dubai, UAE
          </p>
        </div>
      </div>
    </footer>
  )
}
