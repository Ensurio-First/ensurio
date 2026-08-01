import { ArrowRight, Check, Phone } from 'lucide-react'
import InlineLeadForm from './InlineLeadForm'
import { useLeadJourney } from '../context/LeadJourneyContext'
import scrollToCheck from './interactive/scrollToCheck'

/*
 * The closing band on every content page.
 *
 * On pages that carry an on-page check it stops asking for the same thing a
 * third time: it only shows a form while the visitor has ignored the check,
 * nudges them back to it once they have started, and turns into plain
 * reassurance after they have submitted.
 *
 * Pages with no check keep the original always-on form.
 */
export default function PageCtaBand({
  isMobile,
  title,
  blurb,
  service,
  source,
  heading = 'Book a free review',
  hasCheck = false,
}) {
  const { state } = useLeadJourney()
  const mode = !hasCheck ? 'form' : state === 'submitted' ? 'done' : state === 'started' ? 'resume' : 'form'

  const section = {
    background: 'var(--navy)',
    borderTop: '3px solid var(--teal)',
    padding: isMobile ? '2.75rem 0' : '4rem 0',
  }
  const inner = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: isMobile ? '0 0.75rem' : '0 4rem',
    display: 'grid',
    gridTemplateColumns: isMobile || mode !== 'form' ? '1fr' : '1.05fr 0.95fr',
    gap: isMobile ? '1.75rem' : '3rem',
    alignItems: 'center',
  }
  const h2 = {
    fontFamily: 'var(--font-heading)',
    fontSize: isMobile ? '1.5rem' : '2rem',
    fontWeight: 800,
    color: 'var(--white)',
    letterSpacing: '-0.02em',
    marginBottom: '0.75rem',
  }
  const body = {
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    color: 'rgba(255,255,255,0.66)',
    lineHeight: 1.7,
    maxWidth: '520px',
    marginBottom: '1.5rem',
  }
  const phoneLink = {
    display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--teal)',
    fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 700, textDecoration: 'none',
  }
  const tealBtn = {
    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px',
    background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700,
  }

  if (mode === 'done') {
    return (
      <section style={section}>
        <div style={{ ...inner, maxWidth: '760px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', marginBottom: '1rem' }}>
              <span style={{ width: '26px', height: '26px', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={15} color="#fff" strokeWidth={3} />
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--teal)' }}>
                Your check is in
              </span>
            </div>
            <h2 style={h2}>What happens next</h2>
            <p style={body}>
              An independent advisor reads your answers against your actual policy wording, then comes back with
              what is missing, what overlaps, and what it should cost — usually within one business day.
              Nothing else is needed from you right now.
            </p>
            <a href="tel:+971509765976" style={phoneLink}>
              <Phone size={16} /> Need it sooner? Call 050 976 5976
            </a>
          </div>
        </div>
      </section>
    )
  }

  if (mode === 'resume') {
    return (
      <section style={section}>
        <div style={{ ...inner, maxWidth: '760px' }}>
          <div>
            <h2 style={h2}>You're partway through your check</h2>
            <p style={body}>
              Finish the questions and you'll see your score and the specific gaps worth raising — before you give
              us any details.
            </p>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="button" onClick={scrollToCheck} style={tealBtn}>
                Finish my check <ArrowRight size={15} />
              </button>
              <a href="tel:+971509765976" style={phoneLink}>
                <Phone size={16} /> Or call 050 976 5976
              </a>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section style={section}>
      <div style={inner}>
        <div>
          <h2 style={h2}>{title}</h2>
          <p style={body}>{blurb}</p>
          <a href="tel:+971509765976" style={phoneLink}>
            <Phone size={16} /> Call 050 976 5976
          </a>
        </div>
        <InlineLeadForm service={service} source={source} heading={heading} cta="Request a Callback" />
      </div>
    </section>
  )
}
