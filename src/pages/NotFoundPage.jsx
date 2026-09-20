import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Phone } from 'lucide-react'
import ProtoNav from '../prototype/home/components/ProtoNav'
import ProtoFooter from '../prototype/home/components/ProtoFooter'
import { useIsMobile } from '../prototype/home/hooks/useIsMobile'
import '../prototype/prototype.css'

// Where to send someone who landed on a dead URL. These mirror the top-level
// sections in ProtoNav, so the page is a usable recovery point rather than a
// dead end.
const destinations = [
  { title: 'Insurance', desc: 'Every commercial, professional, and personal line we advise on.', href: '/services' },
  { title: 'Risk Management', desc: 'Benchmark your Total Cost of Risk and bring premiums down.', href: '/risk-management' },
  { title: 'Policy Review', desc: 'An independent read of the cover you already hold.', href: '/policy-review' },
  { title: 'Insights', desc: 'Guides to UAE cover, claims, and compliance.', href: '/blog' },
]

export default function NotFoundPage() {
  const isMobile = useIsMobile()

  useEffect(() => {
    const prevTitle = document.title
    document.title = 'Page Not Found | Insure First'

    // The SPA fallback in wrangler.jsonc serves index.html with HTTP 200 for
    // unmatched paths, so this is a soft 404 as far as crawlers are concerned.
    // noindex is what keeps dead URLs from staying in the index.
    const robots = document.createElement('meta')
    robots.setAttribute('name', 'robots')
    robots.setAttribute('content', 'noindex, follow')
    document.head.appendChild(robots)

    return () => {
      document.title = prevTitle
      robots.remove()
    }
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111827' }}>
      <ProtoNav />
      <main>
        <section style={{ background: 'var(--navy)', borderBottom: '3px solid var(--teal)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '3rem 0.75rem' : '4.5rem 4rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.75rem' }}>Error 404</p>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.9rem' : 'clamp(2rem, 3.6vw, 3rem)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '1.1rem', maxWidth: '780px' }}>
                We can&rsquo;t find that page
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '15px' : '17px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: '640px' }}>
                The link may be out of date, or the page may have moved when we rebuilt the site. Everything below is a good place to pick up from.
              </p>
            </motion.div>
          </div>
        </section>

        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '2.5rem 0.75rem' : '4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem' }}>
            {destinations.map((d) => (
              <Link
                key={d.href}
                to={d.href}
                style={{ display: 'block', padding: isMobile ? '1.25rem' : '1.6rem', border: '1px solid #e5e7eb', borderRadius: '10px', textDecoration: 'none', background: '#fff' }}
              >
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem' }}>{d.title}</h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#4b5563', lineHeight: 1.6, marginBottom: '0.75rem' }}>{d.desc}</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--teal)' }}>
                  Go there <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>

          <div style={{ marginTop: isMobile ? '2rem' : '2.5rem', padding: isMobile ? '1.5rem' : '2rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '15px' : '16px', color: '#374151', lineHeight: 1.7, marginBottom: '1.1rem' }}>
              Looking for something specific? Tell us what you need and we&rsquo;ll point you to the right cover.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.4rem', background: 'var(--teal)', color: 'var(--white)', borderRadius: '6px', textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600 }}>
                Contact Us <ArrowRight size={15} />
              </Link>
              <a href="tel:+971509765976" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.4rem', background: 'transparent', color: 'var(--navy)', border: '1px solid var(--navy)', borderRadius: '6px', textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600 }}>
                <Phone size={15} /> 050 976 5976
              </a>
            </div>
          </div>
        </section>
      </main>
      <ProtoFooter />
    </div>
  )
}
