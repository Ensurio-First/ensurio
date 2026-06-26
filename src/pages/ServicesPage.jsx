import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Building2, Users, BarChart3, Heart,
  ClipboardCheck, Search, FileText, Headphones, Gavel,
  CheckCircle2, ArrowRight, Phone, Shield, Award,
} from 'lucide-react'
import ProtoNav from '../prototype/home/components/ProtoNav'
import ProtoFooter from '../prototype/home/components/ProtoFooter'
import { useIsMobile } from '../prototype/home/hooks/useIsMobile'
import '../prototype/prototype.css'

/* ─── Image imports ─── */
import heroBanner       from '../assets/services/hero-banner.webp'
import imgBizOwners     from '../assets/services/business-owners.webp'
import imgFinance       from '../assets/services/finance-managers.webp'
import imgOps           from '../assets/services/operations-managers.webp'
import imgFamilies      from '../assets/services/individuals-families.webp'
import imgAudit         from '../assets/services/insurance-audit.webp'
import imgRisk          from '../assets/services/risk-assesment.webp'
import imgPolicy        from '../assets/services/policy-review.webp'
import imgClaims        from '../assets/services/claims-advisory.webp'
import imgLegal         from '../assets/services/legal-claims-supposrt.webp'
import imgGap           from '../assets/services/coverage-gap-analysis.webp'
import imgBizIns        from '../assets/services/business-insurance.webp'
import imgSpecialist    from '../assets/services/specilalist-insurance.webp'
import imgProfessional  from '../assets/services/professional-protection.webp'
import imgPersonal      from '../assets/services/personal-insurance.webp'
import imgTrust         from '../assets/services/trust.webp'

/* ─── Data ─── */

const whoWeHelp = [
  {
    icon: Building2,
    title: 'Business Owners',
    subtitle: 'SMEs · Corporates · Startups',
    img: imgBizOwners,
    desc: 'Whether you run a trading company, a service firm, or a multi-site operation, we audit your entire insurance programme and close the gaps that could destroy years of work in a single incident.',
    points: ['Full policy gap analysis', 'Premium benchmarking', 'Renewal strategy & negotiation', 'Claims history review'],
  },
  {
    icon: BarChart3,
    title: 'Finance Managers',
    subtitle: 'CFOs · Finance Directors · Controllers',
    img: imgFinance,
    desc: 'Insurance is often the largest hidden cost on the balance sheet. We help finance teams understand exactly what they are paying for, cut waste, and ensure compliance with lender and board requirements.',
    points: ['TCOR (Total Cost of Risk) analysis', 'Budget forecasting & benchmarking', 'Lender insurance compliance', 'Board-level risk reporting'],
  },
  {
    icon: Users,
    title: 'Operations Managers',
    subtitle: 'COOs · Project Managers · Safety Officers',
    img: imgOps,
    desc: 'Operational risk is physical and contractual. We ensure your insurance aligns with your contracts, subcontractor requirements, and day-to-day exposures across every site and location.',
    points: ['Contract insurance compliance', 'Subcontractor risk transfer', 'Site and project coverage review', 'Business interruption planning'],
  },
  {
    icon: Heart,
    title: 'Individuals & Families',
    subtitle: 'Residents · Expats · HNW Individuals',
    img: imgFamilies,
    desc: 'From life and health to home and personal assets, we help individuals in the UAE understand their personal insurance needs and ensure they are adequately protected at every stage of life.',
    points: ['Life & health insurance review', 'Home & contents coverage', 'Personal accident protection', 'Expat insurance advisory'],
  },
]

const solutions = [
  {
    icon: ClipboardCheck,
    title: 'Insurance Audit',
    tag: 'Most Requested',
    img: imgAudit,
    desc: 'A comprehensive review of every policy you hold — identifying gaps, overlaps, under-insurance, and premium inefficiencies that most brokers miss at renewal.',
    process: ['Collect all current policy documents', 'Map coverage against your actual risk profile', 'Identify gaps, duplications & overpayments', 'Deliver a prioritised action report'],
  },
  {
    icon: Search,
    title: 'Risk Assessment',
    tag: '',
    img: imgRisk,
    desc: 'Structured evaluation of your business risks — operational, contractual, financial, and reputational — to ensure the right coverage is in place before a loss event occurs.',
    process: ['On-site / remote risk survey', 'Hazard and exposure mapping', 'Coverage adequacy assessment', 'Risk improvement recommendations'],
  },
  {
    icon: FileText,
    title: 'Policy Review',
    tag: '',
    img: imgPolicy,
    desc: 'Line-by-line analysis of policy wording, conditions, exclusions, and endorsements in plain language — so you know exactly what is covered and what is not before you need to make a claim.',
    process: ['Policy wording examination', 'Exclusion clause analysis', 'Endorsement adequacy check', 'Plain-language summary report'],
  },
  {
    icon: Headphones,
    title: 'Claims Advisory',
    tag: 'High Demand',
    img: imgClaims,
    desc: 'Expert guidance through every stage of the claims process — from first notification through to final settlement — to maximise your outcome as an independent advocate.',
    process: ['Claims strategy & documentation', 'Insurer liaison & negotiation', 'Loss adjuster engagement', 'Settlement maximisation support'],
  },
  {
    icon: Gavel,
    title: 'Legal Claims Support',
    tag: '',
    img: imgLegal,
    desc: 'Independent legal advisory for disputed, complex, or rejected insurance claims. We represent your interests when the insurer pushes back.',
    process: ['Claim dispute analysis', 'Policy interpretation & legal grounds', 'Formal dispute correspondence', 'Escalation & litigation support'],
  },
  {
    icon: BarChart3,
    title: 'Coverage Gap Analysis',
    tag: '',
    img: imgGap,
    desc: 'Identify uninsured or under-insured exposures before they become liabilities. A forward-looking analysis to protect what your existing policies leave uncovered.',
    process: ['Asset and liability mapping', 'Cross-reference against held policies', 'Gap prioritisation by severity', 'Coverage solution recommendations'],
  },
]

const insuranceCategories = [
  {
    title: 'Business Insurance',
    img: imgBizIns,
    color: 'var(--navy)',
    items: [
      { name: 'Commercial Property', desc: 'Buildings, contents, and assets against fire, theft, and natural perils.' },
      { name: 'Business Interruption', desc: 'Revenue protection when operations are disrupted by an insured event.' },
      { name: 'Public & Product Liability', desc: 'Third-party bodily injury and property damage claims.' },
      { name: "Employer's Liability", desc: 'Workforce injury and illness compensation coverage.' },
      { name: 'Motor Fleet', desc: 'Commercial vehicle fleets — owned, hired, and non-owned.' },
    ],
  },
  {
    title: 'Specialist Insurance',
    img: imgSpecialist,
    color: 'var(--teal)',
    items: [
      { name: 'Marine Cargo & Hull', desc: 'Import, export, and transit cargo plus vessel hull coverage.' },
      { name: 'Aviation Insurance', desc: 'Aircraft hull, passenger liability, and ground operations risk.' },
      { name: 'Engineering & Construction', desc: 'Contractor All Risk, Erection All Risk, and project insurance.' },
      { name: 'Energy & Oil', desc: 'Upstream and downstream energy sector risk programmes.' },
    ],
  },
  {
    title: 'Professional Protection',
    img: imgProfessional,
    color: 'var(--navy)',
    items: [
      { name: 'Professional Indemnity', desc: 'Errors, omissions, and negligent advice claims for service firms.' },
      { name: 'Directors & Officers', desc: 'Personal liability protection for company leadership.' },
      { name: 'Cyber Liability', desc: 'Data breach, ransomware, and cyber attack response coverage.' },
      { name: 'Management Liability', desc: 'Employment practices, fiduciary, and crime coverage combined.' },
    ],
  },
  {
    title: 'Personal Insurance',
    img: imgPersonal,
    color: 'var(--teal)',
    items: [
      { name: 'Life & Critical Illness', desc: 'Financial security for family and dependants.' },
      { name: 'Health & Medical', desc: 'Comprehensive medical coverage for individuals and families.' },
      { name: 'Home & Contents', desc: 'Villa, apartment, and household contents protection.' },
      { name: 'Personal Accident', desc: 'Disability and accidental death benefit protection.' },
    ],
  },
]

const claimsSteps = [
  { step: '01', title: 'First Notification', desc: 'Contact us immediately. We advise on what to document and notify the insurer correctly from day one.' },
  { step: '02', title: 'Assessment & Strategy', desc: 'We analyse your policy coverage, assess the claim value, and develop the strongest possible submission strategy.' },
  { step: '03', title: 'Documentation & Submission', desc: 'We prepare all documentation, manage the loss adjuster relationship, and submit your claim professionally.' },
  { step: '04', title: 'Negotiation & Settlement', desc: 'We negotiate directly with the insurer to maximise your settlement. If disputed, we escalate through legal channels.' },
]

/* ─── Sub-components ─── */

function PageHero({ isMobile }) {
  return (
    <section style={{ position: 'relative', borderBottom: '3px solid var(--teal)', overflow: 'hidden' }}>
      {/* background image */}
      <img
        src={heroBanner}
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,27,75,0.65)' }} />
      {/* subtle grid on top */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(14,164,114,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(14,164,114,0.04) 1px,transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '3rem 0.75rem' : '4.5rem 4rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Link to="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Home</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/</span>
            <span style={{ fontSize: '13px', color: 'var(--teal)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Services</span>
          </div>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.75rem' }}>
            What We Do
          </p>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.75rem' : 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', maxWidth: '700px', marginBottom: '1.25rem', lineHeight: 1.2 }}>
            Expert Insurance Advisory, Tailored for the UAE
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '14px' : '16px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8, maxWidth: '560px', marginBottom: '2rem' }}>
            From risk assessments and policy reviews to full claims advocacy — we act exclusively in your interest, not the insurer's.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[{ label: '25+ Years Experience', icon: Award }, { label: 'CBUAE Licensed', icon: Shield }, { label: 'Independent Advisory', icon: CheckCircle2 }].map(({ label, icon: Icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', padding: '6px 14px' }}>
                <Icon size={14} color="var(--teal)" />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function WhoWeHelp({ isMobile }) {
  return (
    <section id="who-we-help" style={{ background: 'var(--white)', padding: isMobile ? '3rem 0' : '5rem 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
        <div style={{ textAlign: isMobile ? 'left' : 'center', marginBottom: isMobile ? '2rem' : '3.5rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>
            Who We Help
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.5rem' : 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Advisory Built for Every Client
          </h2>
          {!isMobile && (
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto', fontSize: '15px', lineHeight: 1.7 }}>
              We work with businesses of every size and individuals across the UAE — providing independent, conflict-free advisory at every stage.
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1px', background: 'var(--border)' }}>
          {whoWeHelp.map((client, i) => {
            const Icon = client.icon
            return (
              <motion.div
                key={client.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{ background: 'var(--white)', overflow: 'hidden', borderTop: '3px solid var(--teal)', display: 'flex', flexDirection: 'column' }}
              >
                {/* card image — no text on image so minimal overlay */}
                <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={client.img}
                    alt={client.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }}
                  />
                </div>

                {/* card body */}
                <div style={{ padding: isMobile ? '1.5rem' : '2rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '44px', height: '44px', background: 'var(--teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color="var(--teal)" />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '3px' }}>{client.title}</h3>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--teal)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{client.subtitle}</p>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1.25rem' }}>{client.desc}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {client.points.map((pt) => (
                      <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.5rem' }}>
                        <CheckCircle2 size={14} color="var(--teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-dark)' }}>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Solutions({ isMobile }) {
  return (
    <section id="solutions" style={{ background: 'var(--light-bg)', padding: isMobile ? '3rem 0' : '5rem 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
        <div style={{ textAlign: isMobile ? 'left' : 'center', marginBottom: isMobile ? '2rem' : '3.5rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>
            Our Solutions
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.5rem' : 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            From Challenge to Clarity
          </h2>
          {!isMobile && (
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto', fontSize: '15px', lineHeight: 1.7 }}>
              Structured, independent services to identify risks, resolve disputes, and ensure your coverage works when you need it most.
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)' }}>
          {solutions.map((sol, i) => {
            const Icon = sol.icon
            return (
              <motion.div
                key={sol.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                style={{ background: 'var(--white)', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderTop: '3px solid var(--teal)' }}
              >
                {/* card image — tag has own background so minimal overlay needed */}
                <div style={{ height: '185px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={sol.img}
                    alt={sol.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                  />
                  {sol.tag && (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--white)', background: 'var(--teal)', padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{sol.tag}</span>
                  )}
                </div>

                {/* card body */}
                <div style={{ padding: isMobile ? '1.5rem' : '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div style={{ width: '36px', height: '36px', background: 'var(--teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} color="var(--teal)" />
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>{sol.title}</h3>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1.25rem', flex: 1 }}>{sol.desc}</p>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: '0.75rem' }}>Our Process</p>
                    {sol.process.map((step, si) => (
                      <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.45rem' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', fontWeight: 800, color: 'var(--teal)', minWidth: '18px', marginTop: '1px' }}>{si + 1}.</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--text-dark)', lineHeight: 1.5 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function InsuranceServices({ isMobile }) {
  return (
    <section id="insurance-services" style={{ background: 'var(--white)', padding: isMobile ? '3rem 0' : '5rem 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>
        <div style={{ textAlign: isMobile ? 'left' : 'center', marginBottom: isMobile ? '2rem' : '3.5rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>
            Insurance Services
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.5rem' : 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Comprehensive Coverage Across Every Sector
          </h2>
          {!isMobile && (
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto', fontSize: '15px', lineHeight: 1.7 }}>
              We advise on the full spectrum of insurance products available in the UAE — from commercial property to specialist risk.
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1px', background: 'var(--border)' }}>
          {insuranceCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{ background: 'var(--white)', overflow: 'hidden' }}
            >
              {/* category banner image — title overlay needs contrast but image must show */}
              <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={cat.img}
                  alt={cat.title}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,27,75,0.42)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '5px', height: '28px', background: 'var(--teal)', flexShrink: 0 }} />
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--white)', margin: 0, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>{cat.title}</h3>
                  </div>
                </div>
              </div>

              {/* items */}
              <div style={{ padding: isMobile ? '1.25rem' : '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cat.items.map((item) => (
                  <div key={item.name} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '6px', height: '6px', background: 'var(--teal)', flexShrink: 0, marginTop: '7px' }} />
                    <div>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: 'var(--navy)', margin: '0 0 2px' }}>{item.name}</p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ClaimsSupport({ isMobile }) {
  return (
    <section id="claims-support" style={{ background: 'var(--light-bg)', padding: isMobile ? '3rem 0' : '5rem 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>

        <div style={{ textAlign: isMobile ? 'left' : 'center', marginBottom: isMobile ? '2rem' : '3.5rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>
            Claims Support
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.5rem' : 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            When Claims Become Complicated, We Stand Beside You
          </h2>
          {!isMobile && (
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto', fontSize: '15px', lineHeight: 1.7 }}>
              As an independent claims advocate, we work exclusively for you — not the insurer — from first notification through to final settlement.
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1px', background: 'var(--border)', marginBottom: '1px' }}>

          {/* Left: steps */}
          <div style={{ background: 'var(--white)', padding: isMobile ? '1.5rem' : '2.5rem' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: '1.5rem' }}>Our Claims Process</p>
            {claimsSteps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', gap: '1.25rem', marginBottom: i < claimsSteps.length - 1 ? '1.75rem' : 0, alignItems: 'flex-start' }}
              >
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 800, color: 'var(--teal)' }}>{step.step}</span>
                  </div>
                  {i < claimsSteps.length - 1 && (
                    <div style={{ width: '1px', height: '28px', background: 'var(--border)', marginTop: '4px' }} />
                  )}
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.35rem' }}>{step.title}</h4>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: image + stats */}
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: isMobile ? '260px' : 'auto' }}>
            <img src={imgClaims} alt="Claims advisory" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(12,31,79,0.62)' }} />
            <div style={{ position: 'relative', zIndex: 1, padding: isMobile ? '2rem 1.5rem' : '2.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.1)' }}>
                {[{ value: '98%', label: 'Claim success rate' }, { value: '25+', label: 'Years advocacy' }, { value: '24/7', label: 'Support available' }].map((stat) => (
                  <div key={stat.label} style={{ background: 'rgba(12,31,79,0.6)', padding: isMobile ? '1rem 0.75rem' : '1.5rem 1rem', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, color: 'var(--teal)' }}>{stat.value}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '3px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* What we handle */}
        <div style={{ background: 'var(--navy)', padding: isMobile ? '1.5rem' : '2rem 2.5rem', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: '1.5rem', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: '0.5rem' }}>We Handle</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Property Damage Claims', 'Business Interruption', 'Liability Claims', 'Cargo & Marine', 'Engineering Losses', 'Rejected / Disputed Claims'].map((tag) => (
                <span key={tag} style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '4px 12px', fontWeight: 500 }}>{tag}</span>
              ))}
            </div>
          </div>
          <Link
            to="/contact"
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '12px 24px', background: 'var(--teal)', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}
          >
            Get Claims Support <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ServicesCTA({ isMobile }) {
  return (
    <section style={{ position: 'relative', borderTop: '3px solid var(--teal)', overflow: 'hidden' }}>
      <img
        src={imgTrust}
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,27,75,0.84)' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '3rem 0.75rem' : '5rem 4rem', textAlign: isMobile ? 'left' : 'center' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.75rem' }}>Start Today</p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.5rem' : 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
            Ready to Secure Your Business?
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, maxWidth: '520px', margin: isMobile ? '0 0 2rem' : '0 auto 2.5rem' }}>
            Book a no-obligation consultation with Fredrick Lobo. We will review your current insurance position and tell you exactly where you stand.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: isMobile ? 'flex-start' : 'center' }}>
            <Link
              to="/contact"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '14px 28px', background: 'var(--teal)', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}
            >
              Book a Consultation <ArrowRight size={15} />
            </Link>
            <a
              href="tel:+971509765976"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '14px 28px', background: 'transparent', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <Phone size={15} /> Call Us Now
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Page ─── */

export default function ServicesPage() {
  const isMobile = useIsMobile()

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111827' }}>
      <ProtoNav />
      <main>
        <PageHero isMobile={isMobile} />
        <WhoWeHelp isMobile={isMobile} />
        <Solutions isMobile={isMobile} />
        <InsuranceServices isMobile={isMobile} />
        <ClaimsSupport isMobile={isMobile} />
        <ServicesCTA isMobile={isMobile} />
      </main>
      <ProtoFooter />
    </div>
  )
}
