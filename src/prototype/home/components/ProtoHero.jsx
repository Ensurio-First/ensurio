import { CheckCircle2, ArrowRight } from 'lucide-react'
import heroImg from '../../../assets/hero-handshake.jpg'
import { useIsMobile } from '../hooks/useIsMobile.js'

export default function ProtoHero() {
  const isMobile = useIsMobile()

  return (
    <section style={{ position: 'relative', width: '100%', overflow: 'hidden', minHeight: isMobile ? '500px' : '680px' }}>

      {/* Full-width background image */}
      <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <img
          src={heroImg}
          alt="Insurance consultants with clients"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }}
        />
      </div>

      {/* Content wrapper */}
      <div style={{
        position: 'relative',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '0.75rem 0.5rem' : '5rem 4rem',
        display: 'flex',
        alignItems: 'center',
        minHeight: isMobile ? '500px' : '680px',
      }}>

        {/* Content card — sharp corners, no border-radius */}
        <div style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '520px',
          background: 'var(--white)',
          boxShadow: '0 32px 80px rgba(12,31,79,0.22)',
          padding: isMobile ? '1rem' : '2.75rem',
          borderTop: '4px solid var(--teal)',
        }}>

          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: 'var(--teal-pale)', color: 'var(--teal-dark)',
            padding: '5px 12px', fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}>
            <span style={{ width: '6px', height: '6px', background: 'var(--teal)', display: 'inline-block' }} />
            Independent Insurance Consultancy · UAE
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: isMobile ? '1.75rem' : 'clamp(1.8rem, 3.5vw, 2.75rem)',
            fontWeight: 800, lineHeight: 1.12,
            color: 'var(--navy)',
            letterSpacing: '-0.025em',
            marginBottom: '1rem',
          }}>
            Insurance Consultancy That{isMobile ? ' ' : <br />}
            <span style={{ color: 'var(--teal)' }}>Protects Your Business.</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: '15px', color: 'var(--text-muted)',
            lineHeight: 1.75, marginBottom: '2rem',
            fontFamily: 'var(--font-body)',
          }}>
            Independent advisory, risk audits, policy reviews, claims support, and legal guidance for businesses across the UAE.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '2rem' }}>
            <a
              href="#contact"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: 'var(--teal)', color: 'var(--white)',
                padding: '13px 24px', fontSize: '13.5px', fontWeight: 700,
                textDecoration: 'none', fontFamily: 'var(--font-body)',
                transition: 'background 0.2s', letterSpacing: '0.01em',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--teal-dark)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--teal)'}
            >
              Book a Consultation <ArrowRight size={15} />
            </a>
            <a
              href="#solutions"
              style={{
                display: 'inline-flex', alignItems: 'center',
                background: 'transparent', color: 'var(--navy)',
                padding: '13px 24px', fontSize: '13.5px', fontWeight: 700,
                textDecoration: 'none', fontFamily: 'var(--font-body)',
                border: '2px solid var(--navy)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--navy)'; e.currentTarget.style.color = 'var(--white)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--navy)' }}
            >
              Request Policy Review
            </a>
          </div>

          {/* Trust chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            {['CBUAE Licensed', '25+ Years Experience', '130+ Businesses Protected'].map((chip) => (
              <div key={chip} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', fontSize: '11px', fontWeight: 600,
                background: 'var(--light-bg)', border: '1px solid var(--border)',
                color: 'var(--text-mid)', fontFamily: 'var(--font-body)',
              }}>
                <CheckCircle2 size={11} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                {chip}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
