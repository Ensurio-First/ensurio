import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Phone, ShieldCheck, Scale, Users } from 'lucide-react'
import ProtoNav from '../prototype/home/components/ProtoNav'
import ProtoFooter from '../prototype/home/components/ProtoFooter'
import ProtoTrustBar from '../prototype/home/components/ProtoTrustBar'
import ProtoFounder from '../prototype/home/components/ProtoFounder'
import { useIsMobile } from '../prototype/home/hooks/useIsMobile'
import heroImg from '../assets/hero-handshake.jpg'
import '../prototype/prototype.css'

const pillars = [
  { title: 'Insurance Advisory', desc: 'Independent audits, policy reviews, and claims advocacy across every commercial and personal line.', href: '/services', label: 'Explore insurance' },
  { title: 'Risk Management Consultancy', desc: 'Our Insurance Optimisation Programme benchmarks your Total Cost of Risk and drives down premiums.', href: '/risk-management', label: 'Explore risk management' },
  { title: 'Management Consultancy', desc: 'Succession, governance, valuation, and operational advisory for family businesses and SMEs.', href: '/management-consultancy', label: 'Explore consultancy' },
]

const values = [
  { icon: ShieldCheck, title: 'Independent', desc: 'We are not tied to any insurer. Our advice is always in your interest — never a commission-driven sale.' },
  { icon: Scale, title: 'Technical & legal', desc: 'Law-qualified (LLB) and ACII-qualified expertise means we read the fine print others miss.' },
  { icon: Users, title: 'On your side', desc: 'From audit to claim, we act as your advocate — especially when the insurer pushes back.' },
]

export default function AboutPage() {
  const isMobile = useIsMobile()

  useEffect(() => {
    const prevTitle = document.title
    document.title = 'About | Insure First — Independent Insurance Consultancy UAE'
    let meta = document.querySelector('meta[name="description"]')
    let created = false
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
      created = true
    }
    const prevDesc = meta.getAttribute('content')
    meta.setAttribute('content', 'About Ensurio First (Insure First) — an independent, CBUAE-licensed insurance consultancy in the UAE led by Fredrick Lobo, working only in the client’s interest.')
    return () => {
      document.title = prevTitle
      if (created) meta.remove()
      else if (prevDesc !== null) meta.setAttribute('content', prevDesc)
    }
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111827' }}>
      <ProtoNav />
      <main>
        {/* Hero */}
        <section style={{ position: 'relative', borderBottom: '3px solid var(--teal)', overflow: 'hidden' }}>
          <img src={heroImg} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,27,75,0.82)' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '3rem 0.75rem' : '4.5rem 4rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
                <Link to="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Home</Link>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/</span>
                <span style={{ fontSize: '13px', color: 'var(--teal)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>About</span>
              </div>
              <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.75rem' }}>About Us</p>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.9rem' : 'clamp(2rem, 3.6vw, 3rem)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '1.1rem', maxWidth: '780px' }}>
                Independent insurance expertise for the UAE
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '15px' : '17px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: '640px' }}>
                Ensurio First RMC FZC — powered by Fredrick Insurance Consultant, licensed by CBUAE (License 143). We work for you, not the insurer.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <ProtoTrustBar />

        {/* Our story */}
        <section style={{ background: 'var(--white)', padding: isMobile ? '3rem 0' : '5rem 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
            <div style={{ maxWidth: '820px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.75rem' }}>Who we are</p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.5rem' : 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
                An advisor on your side of the table
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '15px' : '16.5px', color: 'var(--text-dark)', lineHeight: 1.85, marginBottom: '1.1rem' }}>
                Most people meet insurance through a broker or an agent whose income depends on the sale. We are different. Ensurio First is an independent insurance consultancy — our only interest is making sure your cover actually protects you.
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '15px' : '16.5px', color: 'var(--text-dark)', lineHeight: 1.85 }}>
                We audit your policies, review the wording line by line, assess your real risks, and stand beside you when a claim is disputed. With over 25 years of experience across commercial, industrial, and aviation markets, we have helped more than 130 businesses secure the right cover, resolve complex claims, and cut unnecessary cost.
              </p>
            </div>
          </div>
        </section>

        {/* Founder */}
        <ProtoFounder />

        {/* Three pillars */}
        <section style={{ background: 'var(--light-bg)', padding: isMobile ? '3rem 0' : '5rem 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>What we do</p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.5rem' : 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
              Three pillars of advisory
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)' }}>
              {pillars.map((p) => (
                <Link key={p.title} to={p.href} style={{ textDecoration: 'none', background: 'var(--white)' }}>
                  <div
                    style={{ padding: isMobile ? '1.5rem' : '2rem', borderTop: '3px solid var(--teal)', height: '100%', display: 'flex', flexDirection: 'column', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--light-bg)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--white)' }}
                  >
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.01em', marginBottom: '0.6rem' }}>{p.title}</h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.1rem', flex: 1 }}>{p.desc}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--teal-dark)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13.5px' }}>{p.label} <ArrowRight size={15} /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{ background: 'var(--white)', padding: isMobile ? '3rem 0' : '5rem 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>Why it matters</p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.5rem' : 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
              What independent really means
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '1.5rem' : '2.5rem' }}>
              {values.map(({ icon: Icon, title, desc }) => (
                <div key={title}>
                  <div style={{ width: '44px', height: '44px', background: 'var(--teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <Icon size={22} color="var(--teal)" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem' }}>{title}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: 1.75 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ background: 'var(--navy)', borderTop: '3px solid var(--teal)', padding: isMobile ? '2.75rem 0' : '3.75rem 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Let's review where your insurance really stands
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'rgba(255,255,255,0.66)', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto 1.75rem' }}>
              Book a no-obligation consultation with Fredrick Lobo and his team — independent advice, always in your interest.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'var(--teal)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                Book a Consultation <ArrowRight size={15} />
              </Link>
              <a href="tel:+971509765976" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                <Phone size={15} /> Call an Advisor
              </a>
            </div>
          </div>
        </section>
      </main>
      <ProtoFooter />
    </div>
  )
}
