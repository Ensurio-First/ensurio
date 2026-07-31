export const trustStats = [
  { value: '25+', label: 'Years Experience' },
  { value: '130+', label: 'Businesses Protected' },
  { value: 'CBUAE', label: 'Licensed Consultant' },
  { value: 'UAE-Wide', label: 'Coverage' },
]

export const problems = [
  { icon: 'ShieldQuestion', title: 'Underinsured?', desc: 'Unsure if your current policies actually cover your real business exposure.' },
  { icon: 'TrendingDown', title: 'Overpaying on Premiums?', desc: 'Paying high premiums without a clear breakdown of what you are paying for.' },
  { icon: 'XCircle', title: 'Worried About Claim Rejection?', desc: 'Concerned your insurer may reject or partially settle a legitimate claim.' },
  { icon: 'FileQuestion', title: 'Confused by Policy Wording?', desc: 'Policy exclusions and fine print that is hard to understand until it is too late.' },
  { icon: 'Scale', title: 'Facing a Dispute?', desc: 'Need expert support during complex claim negotiations or legal disputes.' },
]

// `slug` maps each card to its page in solutions.js — /solutions/:slug.
export const solutions = [
  { icon: 'ClipboardCheck', slug: 'insurance-audit', title: 'Insurance Audit', desc: 'Full review of your existing policies to identify gaps, overlaps, and overpayments.', color: 'teal' },
  { icon: 'Search', slug: 'risk-assessment', title: 'Risk Assessment', desc: 'Structured evaluation of your business risks to ensure the right coverage is in place.', color: 'navy' },
  { icon: 'FileText', slug: 'policy-review', title: 'Policy Review', desc: 'Line-by-line analysis of policy wording, conditions, exclusions, and adequacy.', color: 'teal' },
  { icon: 'Headphones', slug: 'claims-advisory', title: 'Claims Advisory', desc: 'Expert guidance through every stage of the claims process to maximise settlement.', color: 'navy' },
  { icon: 'Gavel', slug: 'legal-claims-support', title: 'Legal Claims Support', desc: 'Independent legal advisory for disputed or complex insurance claims.', color: 'teal' },
  { icon: 'BarChart3', slug: 'coverage-gap-analysis', title: 'Coverage Gap Analysis', desc: 'Identify uninsured or under-insured exposures before they become liabilities.', color: 'navy' },
]

export const industries = [
  { icon: 'HardHat', name: 'Construction', desc: 'Project liability, contractor all-risk, and workforce protection.' },
  { icon: 'Factory', name: 'Manufacturing', desc: 'Property, machinery breakdown, and supply chain coverage.' },
  { icon: 'Truck', name: 'Logistics', desc: 'Marine cargo, fleet, and third-party liability solutions.' },
  { icon: 'Hotel', name: 'Hospitality', desc: 'Guest liability, property, and business interruption coverage.' },
  { icon: 'Plane', name: 'Aviation', desc: 'Aircraft hull, passenger liability, and ground risk policies.' },
  { icon: 'Wrench', name: 'Engineering', desc: 'Erection all-risk, professional indemnity, and project insurance.' },
]

export const serviceCategories = [
  {
    category: 'Business Insurance',
    items: ['Commercial Property', 'Business Interruption', 'Public & Product Liability', "Employer's Liability", 'Motor Fleet'],
  },
  {
    category: 'Specialist Insurance',
    items: ['Marine Cargo & Hull', 'Aviation Insurance', 'Engineering & Construction', 'Energy & Oil'],
  },
  {
    category: 'Professional Protection',
    items: ['Professional Indemnity', 'Directors & Officers', 'Cyber Liability', 'Management Liability'],
  },
  {
    category: 'Personal Insurance',
    items: ['Life & Critical Illness', 'Health & Medical', 'Home & Contents', 'Personal Accident'],
  },
]

// Real client testimonials supplied by the client. `id` keys the list — two entries
// share the same name (different companies), so `name` alone is not unique.
export const testimonials = [
  {
    id: 'royal-trust-line',
    quote: 'Insure First completely restructured our corporate coverage. They managed to significantly reduce our premium costs while ensuring our business remains fully protected.',
    name: 'Nikolay',
    role: 'Managing Director',
    company: 'Royal Trust Line Technical Services',
    initials: 'N',
  },
  {
    id: 'al-inayah-alsahiya',
    quote: 'The team at Insure First conducted a thorough audit of our existing policies. They successfully optimized and broadened our coverage without adding a single dirham to our premium costs.',
    name: 'Abdul Razzaq',
    role: 'CFO',
    company: 'Al Inayah Alsahiya Drug Store LLC',
    initials: 'AR',
  },
  {
    id: 'diamond-bakery',
    quote: 'By proactively conducting a pre-risk inspection and presenting a comprehensive report to the underwriters, Insure First successfully negotiated a much lower premium for our operations. Their proactive approach truly pays off.',
    name: "Arun D'Souza",
    role: 'Finance Manager',
    company: 'Diamond Bakery',
    initials: 'AD',
  },
  {
    id: 'pacific-ocean-elect',
    quote: "Fredrick's recommendation to consolidate our vehicles into a single Motor Fleet policy was a game-changer. It has completely streamlined our administration, put our renewals at ease, and saved us countless hours.",
    name: "Arun D'Souza",
    role: 'Finance Manager',
    company: 'Pacific Ocean Elect & Switch Gear LLC',
    initials: 'AD',
  },
  {
    id: 'dubai-pacific-pest',
    quote: 'When our motor claim was initially rejected, Fredrick stepped in immediately. His deep technical knowledge and strong representation to the insurer turned an outright denial into a fully settled claim.',
    name: 'Joseph',
    role: 'Managing Director',
    company: 'Dubai Pacific Pest Control Services',
    initials: 'J',
  },
  {
    id: 'citic-middle-east',
    quote: "Insure First swiftly resolved a complex technical issue with our Contractors' All Risks (CAR) policy. Their high-level representation directly with the insurer bypassed the red tape and saved us invaluable project time.",
    name: 'Ganesh',
    role: 'Commercial and Technical Manager',
    company: 'CITIC Middle East Contracting Company',
    initials: 'G',
  },
  {
    id: 'sydn-fzc',
    quote: 'Fredrick rigorously audited our insurance proposals and negotiated fiercely on our behalf. He secured comprehensive worldwide cover for our Professional Indemnity and Public Liability policies while saving us a sizable amount on premiums.',
    // No individual named — the client attributed this one to the company's management.
    name: 'Management',
    role: '',
    company: 'Sydn FZC Dubai',
    initials: 'SY',
  },
]

export const insights = [
  {
    tag: 'Policy Review',
    title: 'Why Annual Insurance Audits Are Critical for UAE Businesses',
    excerpt: 'Most businesses review their policies only at renewal. Find out why a mid-year audit can prevent serious coverage gaps.',
    date: 'May 2025',
    readTime: '4 min read',
  },
  {
    tag: 'Claims Advisory',
    title: '5 Reasons Insurance Claims Get Rejected in the UAE',
    excerpt: 'Claim rejections are more common than you think. Here are the most frequent causes — and how to avoid them.',
    date: 'April 2025',
    readTime: '5 min read',
  },
  {
    tag: 'Risk Assessment',
    title: 'Understanding Total Cost of Risk (TCOR) for SMEs',
    excerpt: 'TCOR goes beyond premiums. Learn how to calculate the true cost of risk exposure in your business.',
    date: 'March 2025',
    readTime: '6 min read',
  },
]

// Official Insure First social accounts. Brand glyphs are inline path data because
// lucide-react v1 dropped its brand icons — there is no <Instagram /> to import.
export const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/insurefirstcco',
    path: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm7.846-10.405a1.441 1.441 0 01-2.88 0 1.44 1.44 0 012.88 0z',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/insurefirstcco',
    path: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 011.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 00-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 00-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/insurefirstcco/',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
]
