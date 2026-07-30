import blogSigning from '../../../assets/blog-signing.jpg'
import blogBusiness from '../../../assets/blog-business.jpg'
import blogDubai from '../../../assets/blog-dubai.jpg'
import heroHandshake from '../../../assets/hero-handshake.jpg'
import industryConstruction from '../../../assets/industry-construction.jpg'

/*
 * Solution (advisory service) pages — rendered by <SolutionPage> using the
 * shared content-block system. Anatomy: problem → self-assessment tool →
 * process → deliverables → FAQ → CTA.
 */
export const solutionPages = [
  {
    slug: 'insurance-audit',
    title: 'Insurance Audit',
    tagline: 'A comprehensive, independent review of every policy you hold — to find the gaps, overlaps, and overpayments.',
    metaTitle: 'Insurance Audit UAE | Ensurio First',
    metaDescription: 'An independent insurance audit for UAE businesses — we review every policy against your real risk profile to find coverage gaps, overlaps, and premium savings.',
    image: blogSigning,
    badges: ['CBUAE Licensed', 'Independent Advisory', 'Prioritised Action Report'],
    body: [
      { type: 'lead', text: 'An insurance audit is a structured review of every policy you hold, measured against the risks your business actually carries today.' },
      { type: 'p', text: 'Most businesses only look at their insurance at renewal, under time pressure. An independent audit finds the gaps where a real exposure has no cover, the overlaps where you pay twice, and the sums insured that no longer reflect reality — before a loss does.' },
      { type: 'gapcheck', title: 'How healthy is your insurance programme?', subtitle: 'Tick what is true today — anything unchecked is worth an audit.', items: ['Every policy has been reviewed in the last 12 months', 'My sums insured reflect current values', 'I have no overlapping or duplicated cover', 'I understand my key exclusions and conditions', 'My premiums have been benchmarked to the market'], cta: { label: 'Book an insurance audit', href: '/contact?service=Insurance%20Audit' } },
      { type: 'h2', text: "What's involved" },
      { type: 'steps', items: [
        { title: 'Collect your policies', text: 'We gather every current policy document.' },
        { title: 'Map cover to risk', text: 'Measure your cover against your real risk profile.' },
        { title: 'Identify gaps & overlaps', text: 'Find exposures, duplications, and overpayments.' },
        { title: 'Deliver an action report', text: 'A prioritised plan of what to fix and how.' },
      ] },
      { type: 'h2', text: 'What you get' },
      { type: 'checklist', items: [
        { text: 'A full inventory of the policies you hold.' },
        { text: 'A clear gap-and-overlap report.' },
        { text: 'Premium benchmarking against the market.' },
        { text: 'A prioritised, practical action plan.' },
      ] },
      { type: 'cta', heading: 'Find out where your insurance really stands.', text: 'A no-obligation audit that shows exactly where you are exposed and where you are overpaying.', primary: { label: 'Book an Audit', href: '/contact?service=Insurance%20Audit' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
      { type: 'h2', text: 'Frequently Asked Questions' },
      { type: 'faq', items: [
        { q: 'How long does an insurance audit take?', a: 'For most SMEs, a first review takes days rather than weeks once we have your policy documents.' },
        { q: 'Do I have to change insurer?', a: 'No. The audit is independent — its job is to show you the truth about your cover, not to move your business.' },
        { q: 'Is it worth it if my policies look fine?', a: 'Often the biggest gaps are in policies that look comprehensive on the schedule — an audit is how you find them.' },
      ] },
    ],
  },
  {
    slug: 'risk-assessment',
    title: 'Risk Assessment',
    tagline: 'A structured evaluation of your business risks — so the right cover is in place before a loss occurs.',
    metaTitle: 'Risk Assessment UAE | Ensurio First',
    metaDescription: 'Independent business risk assessment in the UAE — we map your operational, contractual, and financial exposures so your insurance matches your real risk.',
    image: industryConstruction,
    badges: ['CBUAE Licensed', 'Independent Advisory', 'Risk Register'],
    body: [
      { type: 'lead', text: 'A risk assessment is a structured evaluation of your operational, contractual, financial, and reputational exposures — the foundation of getting insurance right.' },
      { type: 'p', text: 'You cannot insure what you have not identified. We survey your business, map its hazards and exposures, and check that your cover actually matches the risks you carry — then recommend improvements that reduce both risk and premium.' },
      { type: 'gapcheck', title: 'Do you know your real exposures?', subtitle: 'Tick what is true today.', items: ['My business risks have been formally assessed', 'My contractual insurance requirements are mapped', 'Business interruption exposure has been considered', 'Site and operational hazards have been reviewed', 'My cover is matched to my assessed exposures'], cta: { label: 'Book a risk assessment', href: '/contact?service=Risk%20Assessment' } },
      { type: 'h2', text: "What's involved" },
      { type: 'steps', items: [
        { title: 'Risk survey', text: 'An on-site or remote survey of your operations.' },
        { title: 'Hazard mapping', text: 'We map your exposures across the business.' },
        { title: 'Adequacy assessment', text: 'Check your cover against those exposures.' },
        { title: 'Recommendations', text: 'Practical steps to reduce and transfer risk.' },
      ] },
      { type: 'h2', text: 'What you get' },
      { type: 'checklist', items: [
        { text: 'A documented risk register for your business.' },
        { text: 'Clear hazard and exposure mapping.' },
        { text: 'Coverage adequacy findings.' },
        { text: 'Prioritised risk-improvement recommendations.' },
      ] },
      { type: 'cta', heading: 'Understand your risk before it becomes a loss.', text: 'An independent assessment that turns unknown exposures into a clear, managed plan.', primary: { label: 'Book an Assessment', href: '/contact?service=Risk%20Assessment' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
      { type: 'h2', text: 'Frequently Asked Questions' },
      { type: 'faq', items: [
        { q: 'What does a risk assessment cover?', a: 'Operational, contractual, financial, and reputational risks — everything that could turn into a loss or a claim.' },
        { q: 'Is it only for large businesses?', a: 'No. SMEs benefit just as much — often more, because their exposures are less formally managed.' },
        { q: 'Will it lower my premium?', a: 'Frequently. Demonstrating good risk management to insurers is one of the most reliable ways to reduce cost.' },
      ] },
    ],
  },
  {
    slug: 'policy-review',
    title: 'Policy Review',
    tagline: 'A line-by-line analysis of your policy wording, conditions, and exclusions — in plain language.',
    metaTitle: 'Policy Review UAE | Ensurio First',
    metaDescription: 'Independent insurance policy review in the UAE — we examine your wording, exclusions, conditions, and endorsements in plain language so you know exactly what is covered.',
    image: blogSigning,
    badges: ['CBUAE Licensed', 'Independent Advisory', 'Plain-Language Summary'],
    body: [
      { type: 'lead', text: 'A policy review is a line-by-line analysis of your wording, conditions, exclusions, and endorsements — so you know exactly what is covered before you need to claim.' },
      { type: 'p', text: 'The fine print decides whether a claim is paid. We translate the legal wording into plain language, flag the conditions and exclusions that matter, and confirm your sums insured are adequate.' },
      { type: 'gapcheck', title: 'Do you know what your policy really says?', subtitle: 'Tick what is true today.', items: ['I have read my policy wording', 'I understand my key exclusions', 'I have checked the conditions and warranties', 'My endorsements are adequate for my business', 'My sums insured are correct'], cta: { label: 'Book a policy review', href: '/contact?service=Policy%20Review' } },
      { type: 'h2', text: "What's involved" },
      { type: 'steps', items: [
        { title: 'Wording examination', text: 'We read the policy end to end.' },
        { title: 'Exclusion analysis', text: 'We flag the exclusions that matter.' },
        { title: 'Condition & endorsement check', text: 'Confirm you are meeting them.' },
        { title: 'Plain-language summary', text: 'A clear report you can actually use.' },
      ] },
      { type: 'h2', text: 'What you get' },
      { type: 'checklist', items: [
        { text: 'A plain-language summary of your cover.' },
        { text: 'A breakdown of exclusions and conditions.' },
        { text: 'An endorsement adequacy check.' },
        { text: 'Clear recommendations to fix any weaknesses.' },
      ] },
      { type: 'cta', heading: 'Know what your policy covers — before you claim.', text: 'An independent, plain-language review of your wording, conditions, and exclusions.', primary: { label: 'Book a Review', href: '/contact?service=Policy%20Review' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
      { type: 'h2', text: 'Frequently Asked Questions' },
      { type: 'faq', items: [
        { q: 'Why do I need a policy review?', a: 'Because the wording — not the schedule — decides whether a claim is paid. A review finds the traps before they cost you.' },
        { q: 'Can you review a policy from any insurer?', a: 'Yes. As independent advisors we review any UAE or international policy wording.' },
        { q: 'What comes out of it?', a: 'A plain-language summary of what you are and are not covered for, plus clear recommendations.' },
      ] },
    ],
  },
  {
    slug: 'claims-advisory',
    title: 'Claims Advisory',
    tagline: 'Expert guidance through every stage of a claim — as your independent advocate, not the insurer’s.',
    metaTitle: 'Claims Advisory UAE | Ensurio First',
    metaDescription: 'Independent insurance claims advisory in the UAE — we guide you from first notification to final settlement and negotiate directly with insurers to maximise your outcome.',
    image: heroHandshake,
    badges: ['CBUAE Licensed', 'Independent Advocate', 'Settlement Support'],
    body: [
      { type: 'lead', text: 'Claims advisory means expert guidance through every stage of the claims process — from first notification to final settlement — with an independent advocate working only for you.' },
      { type: 'p', text: 'When a loss happens, the insurer has a team; you should too. We handle strategy, documentation, and negotiation, deal with the loss adjuster, and push for the fullest settlement you are entitled to.' },
      { type: 'gapcheck', title: 'Are you ready if a claim happens?', subtitle: 'Tick what is true today.', items: ['I know my policy notification deadlines', 'My documentation is ready to support a claim', 'I understand the claims process', 'I have an independent advocate on my side', 'My past claims have been handled well'], cta: { label: 'Get claims support', href: '/contact?service=Claims%20Advisory' } },
      { type: 'h2', text: "What's involved" },
      { type: 'steps', items: [
        { title: 'Strategy & documentation', text: 'We build the strongest possible claim.' },
        { title: 'Insurer liaison', text: 'We manage all communication and negotiation.' },
        { title: 'Loss adjuster engagement', text: 'We represent you with the adjuster.' },
        { title: 'Settlement support', text: 'We push for the fullest settlement due.' },
      ] },
      { type: 'h2', text: 'What you get' },
      { type: 'checklist', items: [
        { text: 'A clear claims strategy from day one.' },
        { text: 'Full documentation support.' },
        { text: 'Insurer and loss-adjuster liaison.' },
        { text: 'Settlement negotiation on your behalf.' },
      ] },
      { type: 'cta', heading: 'Facing a claim? Get an advocate on your side.', text: 'Independent claims support that works only for you — from notification to settlement.', primary: { label: 'Get Claims Support', href: '/contact?service=Claims%20Advisory' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
      { type: 'h2', text: 'Frequently Asked Questions' },
      { type: 'faq', items: [
        { q: 'When should I involve a claims advisor?', a: 'As early as possible — ideally at first notification, when the strategy and documentation matter most.' },
        { q: 'Do you work for the insurer?', a: 'No. We are independent and work exclusively for you, as your advocate.' },
        { q: 'Can you help with a claim already in progress?', a: 'Yes. We can step in at any stage, including where a claim has stalled or been underpaid.' },
      ] },
    ],
  },
  {
    slug: 'legal-claims-support',
    title: 'Legal Claims Support',
    tagline: 'Independent legal advisory for disputed, complex, or rejected insurance claims.',
    metaTitle: 'Legal Claims Support UAE | Ensurio First',
    metaDescription: 'Independent legal claims support in the UAE — expert advisory for disputed, complex, or rejected insurance claims, from policy interpretation to escalation.',
    image: blogBusiness,
    badges: ['CBUAE Licensed', 'Legal & Technical', 'Dispute Resolution'],
    body: [
      { type: 'lead', text: 'Legal claims support provides independent legal and technical advisory when a claim is disputed, complex, or rejected — representing your interests when the insurer pushes back.' },
      { type: 'p', text: 'A rejection is not the end of the road. We analyse the dispute, interpret the policy and the legal grounds, prepare formal correspondence, and escalate through the right channels to get a fair outcome.' },
      { type: 'gapcheck', title: 'Has a claim been disputed or rejected?', subtitle: 'Tick what is true today.', items: ['My claim is being handled fairly', 'I understand the legal grounds of my policy', 'My deadlines are under control', 'I have independent representation', 'My correspondence is properly documented'], cta: { label: 'Get legal support', href: '/contact?service=Legal%20Claims%20Support' } },
      { type: 'h2', text: "What's involved" },
      { type: 'steps', items: [
        { title: 'Dispute analysis', text: 'We assess the rejection and the grounds for it.' },
        { title: 'Policy interpretation', text: 'We establish the legal basis of your claim.' },
        { title: 'Formal correspondence', text: 'We put your case to the insurer in writing.' },
        { title: 'Escalation & litigation', text: 'We escalate through the right channels.' },
      ] },
      { type: 'h2', text: 'What you get' },
      { type: 'checklist', items: [
        { text: 'A clear analysis of the dispute.' },
        { text: 'Policy interpretation and legal grounds.' },
        { text: 'Formal, professional correspondence.' },
        { text: 'Escalation and litigation support if needed.' },
      ] },
      { type: 'cta', heading: 'Claim rejected? You have options.', text: 'Independent legal and technical support to challenge a disputed or rejected claim.', primary: { label: 'Get Legal Support', href: '/contact?service=Legal%20Claims%20Support' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
      { type: 'h2', text: 'Frequently Asked Questions' },
      { type: 'faq', items: [
        { q: 'My claim was rejected — can it be reopened?', a: 'Often, yes. Many rejections rest on interpretation or process, both of which can be challenged with the right grounds.' },
        { q: 'Do I need a lawyer?', a: 'Not always. Much can be resolved through technical and legal advisory before litigation — which we handle first.' },
        { q: 'How quickly should I act?', a: 'Quickly — deadlines and time bars apply, so the sooner we review the dispute, the stronger your position.' },
      ] },
    ],
  },
  {
    slug: 'coverage-gap-analysis',
    title: 'Coverage Gap Analysis',
    tagline: 'Identify uninsured or under-insured exposures before they become liabilities.',
    metaTitle: 'Coverage Gap Analysis UAE | Ensurio First',
    metaDescription: 'Independent coverage gap analysis in the UAE — we map your assets and liabilities against your policies to find and close the exposures you are not insuring.',
    image: blogDubai,
    badges: ['CBUAE Licensed', 'Independent Advisory', 'Prioritised Gaps'],
    body: [
      { type: 'lead', text: 'Coverage gap analysis is a forward-looking review that identifies the uninsured and under-insured exposures your current policies leave open.' },
      { type: 'p', text: 'Businesses grow faster than their insurance. New assets, contracts, and activities create exposures your existing policies never anticipated. We map what you have against what you are insuring, and close the gaps before they become liabilities.' },
      { type: 'gapcheck', title: 'Where are you exposed?', subtitle: 'Tick what is true today.', items: ['All my assets are mapped to a cover', 'My key liabilities are insured', 'New activities have been added to my policies', 'My contractual insurance gaps are closed', 'Emerging risks like cyber are covered'], cta: { label: 'Book a gap analysis', href: '/contact?service=Coverage%20Gap%20Analysis' } },
      { type: 'h2', text: "What's involved" },
      { type: 'steps', items: [
        { title: 'Asset & liability mapping', text: 'We map everything of value and every exposure.' },
        { title: 'Cross-reference policies', text: 'We check each against the cover you hold.' },
        { title: 'Prioritise the gaps', text: 'We rank exposures by severity.' },
        { title: 'Recommend solutions', text: 'A clear plan to close each gap.' },
      ] },
      { type: 'h2', text: 'What you get' },
      { type: 'checklist', items: [
        { text: 'A complete asset-and-liability map.' },
        { text: 'A prioritised report of your gaps.' },
        { text: 'A cross-reference against every held policy.' },
        { text: 'Practical recommendations to close them.' },
      ] },
      { type: 'cta', heading: 'Find the exposures you are not insuring.', text: 'An independent analysis that closes the gaps before they turn into uninsured losses.', primary: { label: 'Book a Gap Analysis', href: '/contact?service=Coverage%20Gap%20Analysis' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
      { type: 'h2', text: 'Frequently Asked Questions' },
      { type: 'faq', items: [
        { q: 'How is this different from an audit?', a: 'An audit reviews the policies you hold; a gap analysis looks forward at the exposures you are not insuring at all.' },
        { q: 'What kind of gaps do you find?', a: 'Commonly new assets, contractual requirements, business interruption, and emerging risks like cyber.' },
        { q: 'What do I do with the findings?', a: 'We give you a prioritised plan — you decide what to close and when, with our recommendations.' },
      ] },
    ],
  },
]

export function getSolutionBySlug(slug) {
  return solutionPages.find((s) => s.slug === slug)
}
