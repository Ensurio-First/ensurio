import imgBizOwners from '../../../assets/services/business-owners.webp'
import imgFinance from '../../../assets/services/finance-managers.webp'
import imgOps from '../../../assets/services/operations-managers.webp'
import imgFamilies from '../../../assets/services/individuals-families.webp'

/*
 * "Who We Help" audience pages — rendered by <AudiencePage>. Each speaks to a
 * specific audience and links to the service/solution pages most relevant to
 * them (relatedServices), reinforcing internal linking.
 */
export const audiencePages = [
  {
    slug: 'business-owners',
    title: 'Business Owners',
    subtitle: 'SMEs · Corporates · Startups',
    tagline: 'We audit your entire insurance programme and close the gaps that could undo years of work in a single incident.',
    metaTitle: 'Insurance Advisory for Business Owners UAE | Ensurio First',
    metaDescription: 'Independent insurance advisory for UAE business owners — a whole-programme audit to close coverage gaps, cut waste, and protect what you have built.',
    image: imgBizOwners,
    badges: ['CBUAE Licensed', 'Independent Advisory', 'Whole-Programme Review'],
    body: [
      { type: 'lead', text: 'Whether you run a trading company, a service firm, or a multi-site operation, your insurance should protect everything you have built — not leave gaps you only discover at claim time.' },
      { type: 'p', text: 'As independent advisors we review your entire programme, benchmark your premiums, and negotiate your renewals — so your cover is comprehensive, competitive, and genuinely fit for your business.' },
      { type: 'h2', text: 'How we help you' },
      { type: 'checklist', items: [
        { strong: 'Full policy gap analysis', text: 'across everything you hold.' },
        { strong: 'Premium benchmarking', text: 'against the market.' },
        { strong: 'Renewal strategy', text: '& negotiation on your behalf.' },
        { strong: 'Claims history review', text: 'to strengthen your position.' },
      ] },
      { type: 'gapcheck', title: 'Is your business properly protected?', subtitle: 'Five questions. "Not sure" is a valid answer — and the most common one.', items: [
        { statement: 'My whole insurance programme has been reviewed as one thing, recently', gapTitle: 'Programme never reviewed as a whole', consequence: 'Policies bought one at a time drift apart. The dangerous gaps sit between them, where no single policy is responsible.', severity: 'high' },
        { statement: 'My sums insured reflect what the business is actually worth today', gapTitle: 'Sums insured may have drifted', consequence: 'Values set years ago quietly become under-insurance, and average then reduces every claim in proportion.', severity: 'high' },
        { statement: 'I am confident there are no gaps where one policy ends and the next begins', gapTitle: 'Gaps between policies', consequence: 'Each insurer covers its own section. A loss that falls between two policies gets argued about rather than paid.', severity: 'high' },
        { statement: 'My premiums have been benchmarked against the market', gapTitle: 'Premiums never benchmarked', consequence: 'Without a market comparison a renewal increase cannot be challenged — you have nothing to hold it against.', severity: 'medium' },
        { statement: 'I have an independent advisor, not only the broker who sold me the policies', gapTitle: 'No independent second opinion', consequence: 'The broker who placed the cover is not the right person to audit whether it works.', severity: 'medium' },
      ], cta: { label: 'Book a business review', href: '/contact?service=Business%20Owner%20Review' } },
      { type: 'cta', heading: 'Protect what you have built.', text: 'A no-obligation review of your whole insurance programme by an independent advisor.', primary: { label: 'Book a Review', href: '/contact?service=Business%20Owner%20Review' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
    ],
    relatedServices: [
      { label: 'Insurance Audit', href: '/solutions/insurance-audit' },
      { label: 'Commercial Property', href: '/insurance/commercial-property' },
      { label: 'Public & Product Liability', href: '/insurance/public-liability' },
      { label: 'Business Interruption', href: '/insurance/business-interruption' },
    ],
  },
  {
    slug: 'finance-managers',
    title: 'Finance Managers',
    subtitle: 'CFOs · Finance Directors · Controllers',
    tagline: 'We help finance teams understand exactly what they are paying for, cut waste, and meet lender and board requirements.',
    metaTitle: 'Insurance Advisory for Finance Managers UAE | Ensurio First',
    metaDescription: 'Independent insurance advisory for UAE finance leaders — Total Cost of Risk analysis, budget benchmarking, lender compliance, and board-level risk reporting.',
    image: imgFinance,
    badges: ['CBUAE Licensed', 'TCOR Analysis', 'Board-Level Reporting'],
    body: [
      { type: 'lead', text: 'Insurance is often one of the largest hidden costs on the balance sheet — and one of the least scrutinised. We turn it into a measurable, controllable line.' },
      { type: 'p', text: 'We help finance teams see the true Total Cost of Risk, benchmark and forecast their spend, stay compliant with lenders and boards, and make deliberate decisions about which risks to transfer and which to retain.' },
      { type: 'h2', text: 'How we help you' },
      { type: 'checklist', items: [
        { strong: 'Total Cost of Risk (TCOR)', text: 'analysis and reporting.' },
        { strong: 'Budget forecasting', text: '& premium benchmarking.' },
        { strong: 'Lender insurance compliance', text: 'kept in order.' },
        { strong: 'Board-level risk reporting', text: 'in plain numbers.' },
      ] },
      { type: 'tcor', title: 'Do you control your cost of risk?', subtitle: 'Premium is the number you negotiate. It is rarely the number that matters. Move the sliders to your figures.' },
      { type: 'cta', heading: 'Turn insurance into a controllable cost.', text: 'An independent review that puts real numbers behind your risk spend.', primary: { label: 'Book a Review', href: '/contact?service=Finance%20TCOR%20Review' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
    ],
    relatedServices: [
      { label: 'Risk Assessment', href: '/solutions/risk-assessment' },
      { label: 'Coverage Gap Analysis', href: '/solutions/coverage-gap-analysis' },
      { label: 'Trade Credit', href: '/insurance/trade-credit' },
      { label: 'Directors & Officers', href: '/insurance/directors-officers' },
    ],
  },
  {
    slug: 'operations-managers',
    title: 'Operations Managers',
    subtitle: 'COOs · Project Managers · Safety Officers',
    tagline: 'We ensure your insurance aligns with your contracts, subcontractors, and day-to-day exposures across every site.',
    metaTitle: 'Insurance Advisory for Operations Managers UAE | Ensurio First',
    metaDescription: 'Independent insurance advisory for UAE operations leaders — contract compliance, subcontractor risk transfer, project cover, and business interruption planning.',
    image: imgOps,
    badges: ['CBUAE Licensed', 'Contract Compliance', 'Project & Site Cover'],
    body: [
      { type: 'lead', text: 'Operational risk is physical and contractual. Your insurance has to match your contracts, your subcontractors, and the real exposures across every site and project.' },
      { type: 'p', text: 'We align your cover with contractual requirements, structure subcontractor risk transfer, review project and site cover, and plan for business interruption — so an incident on site does not become a liability on the balance sheet.' },
      { type: 'h2', text: 'How we help you' },
      { type: 'checklist', items: [
        { strong: 'Contract insurance compliance', text: 'checked and met.' },
        { strong: 'Subcontractor risk transfer', text: 'structured correctly.' },
        { strong: 'Site & project coverage', text: 'reviewed end to end.' },
        { strong: 'Business interruption planning', text: 'for real downtime.' },
      ] },
      { type: 'gapcheck', title: 'Is your operational risk covered?', subtitle: 'Five questions. "Not sure" is a valid answer — and the most common one.', items: [
        { statement: 'My cover meets every insurance requirement in the contracts we have signed', gapTitle: 'Contract requirements may be unmet', consequence: 'Main contracts specify limits, wordings and named parties. Falling short is a breach you carry until someone audits it.', severity: 'high' },
        { statement: 'Subcontractor risk is properly transferred and I hold current certificates', gapTitle: 'Unverified subcontractor risk', consequence: 'A lapsed subcontractor policy pushes their liability onto yours — and onto your claims record at renewal.', severity: 'high' },
        { statement: 'Every site and project we are running is declared and covered', gapTitle: 'Sites or projects may be uncovered', consequence: 'Cover is usually scheduled per site or per project. A new one started mid-term is uninsured until it is declared.', severity: 'high' },
        { statement: 'We have planned for how long operations could survive an interruption', gapTitle: 'Interruption not planned for', consequence: 'Property cover repairs the damage. Nothing pays the fixed costs while operations are stopped unless business interruption is in place.', severity: 'high' },
        { statement: 'My insurance certificates are current and compliant', gapTitle: 'Certificates may be out of date', consequence: 'An expired certificate can stop you being paid, or stop you being let on site, regardless of whether the cover actually exists.', severity: 'medium' },
      ], cta: { label: 'Book an operations review', href: '/contact?service=Operations%20Review' } },
      { type: 'cta', heading: 'Match your cover to your operations.', text: 'An independent review that aligns your insurance with your contracts and sites.', primary: { label: 'Book a Review', href: '/contact?service=Operations%20Review' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
    ],
    relatedServices: [
      { label: 'Engineering & Construction', href: '/insurance/engineering-construction' },
      { label: 'Motor Fleet', href: '/insurance/motor-fleet' },
      { label: "Employer's Liability", href: '/insurance/employers-liability' },
      { label: 'Business Interruption', href: '/insurance/business-interruption' },
    ],
  },
  {
    slug: 'individuals-families',
    title: 'Individuals & Families',
    subtitle: 'Residents · Expats · HNW Individuals',
    tagline: 'We help individuals and families in the UAE understand their needs and stay properly protected at every stage of life.',
    metaTitle: 'Personal Insurance Advisory UAE | Ensurio First',
    metaDescription: 'Independent personal insurance advisory in the UAE — life and health reviews, home and contents, personal accident, and expat advisory for individuals and families.',
    image: imgFamilies,
    badges: ['CBUAE Licensed', 'Independent Advisory', 'Family Protection'],
    body: [
      { type: 'lead', text: 'From life and health to home and personal assets, we help individuals and families in the UAE understand their needs and make sure they are properly protected.' },
      { type: 'p', text: 'As independent advisors we review your life and health cover, protect your home and belongings, arrange personal accident cover, and guide expats through the specifics of insurance in the UAE — with advice that is always in your interest.' },
      { type: 'h2', text: 'How we help you' },
      { type: 'checklist', items: [
        { strong: 'Life & health insurance', text: 'reviewed and right-sized.' },
        { strong: 'Home & contents coverage', text: 'for what you own.' },
        { strong: 'Personal accident protection', text: 'for the unexpected.' },
        { strong: 'Expat insurance advisory', text: 'for life in the UAE.' },
      ] },
      { type: 'protectiongap', title: 'Would your family be financially secure without you?', subtitle: 'Four figures and two questions. The arithmetic is shown in full — no black box.' },
      { type: 'cta', heading: 'Protect the people who matter most.', text: 'A no-obligation review of your family’s personal insurance by an independent advisor.', primary: { label: 'Book a Review', href: '/contact?service=Personal%20Review' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
    ],
    relatedServices: [
      { label: 'Life & Critical Illness', href: '/insurance/life-critical-illness' },
      { label: 'Health & Medical', href: '/insurance/health-medical' },
      { label: 'Home & Contents', href: '/insurance/home-contents' },
      { label: 'Personal Accident', href: '/insurance/personal-accident' },
    ],
  },
]

export function getAudienceBySlug(slug) {
  return audiencePages.find((a) => a.slug === slug)
}
