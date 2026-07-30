import industryLogistics from '../../../assets/industry-logistics.jpg'

/*
 * Service / insurance-line pages. Same data-driven pattern as blog.js — each
 * page is an object rendered by the shared <ServicePage> template using the
 * shared content-block system (contentBlocks.jsx), including the interactive
 * `estimator` and `gapcheck` tools.
 */
export const servicePages = [
  {
    slug: 'marine-cargo',
    category: 'Specialist Insurance',
    title: 'Marine Cargo Insurance',
    tagline: 'Protect the value of your goods at every leg of the journey — by sea, air, or land.',
    metaTitle: 'Marine Cargo Insurance Dubai | Ensurio First',
    metaDescription: 'Independent marine cargo insurance advisory in Dubai — the right Institute Cargo Clauses, warehouse-to-warehouse cover, and correct sums insured for your shipments.',
    image: industryLogistics,
    imageAlt: 'Cargo containers in transit through Dubai',
    badges: ['CBUAE Licensed', 'Independent Advisory', 'All Institute Cargo Clauses'],
    relatedBlog: 'marine-cargo-insurance-dubai',
    body: [
      { type: 'lead', text: 'Marine cargo insurance protects the value of your goods against loss or damage while they move — anywhere in the world, by any mode.' },
      { type: 'p', text: 'Dubai runs on trade, and your goods spend much of their life in transit — exactly where they are most exposed. As independent advisors, we make sure your cover matches how your cargo actually travels, with the right clauses and the correct sums insured, so a claim is paid when it matters.' },

      { type: 'estimator', config: {
        title: 'Estimate your marine cargo premium',
        note: 'Move the sliders to see an indicative annual premium range for your shipments.',
        fields: [
          { label: 'Cargo value per shipment', type: 'range', min: 50000, max: 5000000, step: 50000, default: 500000, format: (v) => 'AED ' + v.toLocaleString('en-US') },
          { label: 'Shipments per year', type: 'range', min: 1, max: 300, step: 1, default: 24, unit: '/ yr' },
          { label: 'Route risk', type: 'select', default: 'med', options: [
            { value: 'low', label: 'Low' },
            { value: 'med', label: 'Medium' },
            { value: 'high', label: 'High' },
          ] },
        ],
        estimate: (vals) => {
          const [value, shipments, risk] = vals
          const annual = value * shipments
          const rate = risk === 'low' ? 0.0008 : risk === 'high' ? 0.0025 : 0.0014
          const base = annual * rate
          return { low: base * 0.8, high: base * 1.3 }
        },
        cta: { label: 'Get an exact quote', href: '/contact?service=Marine%20Cargo%20Insurance' },
      } },

      { type: 'h2', text: 'What it covers' },
      { type: 'cardgrid', variant: 'cover', columns: 4, items: [
        { icon: 'shield', title: 'Physical loss & damage', text: 'All-risks cover for the insured goods in transit.' },
        { icon: 'gem', title: 'Theft & pilferage', text: 'Loss of goods in transit or temporary storage.' },
        { icon: 'truck', title: 'Loading & unloading', text: 'Damage during handling between modes.' },
        { icon: 'package', title: 'General average', text: 'Your share of a declared sea loss.' },
        { icon: 'flame', title: 'War & strikes', text: 'Optional cover for higher-risk routes.' },
        { icon: 'building', title: 'Warehouse to warehouse', text: 'Cover for the full door-to-door journey.' },
        { icon: 'lock', title: 'Container damage', text: 'Loss from damaged or lost containers.' },
        { icon: 'users', title: 'Duty & freight', text: 'Insure landed cost, not just invoice value.' },
      ] },

      { type: 'h2', text: "Who it's for" },
      { type: 'chips', items: ['Importers', 'Exporters', 'Traders', 'Freight forwarders', 'Manufacturers', 'Distributors', 'E-commerce', 'Commodity traders'] },

      { type: 'h2', text: "What's not covered" },
      { type: 'exclusions', items: ['Inherent vice of the goods', 'Insufficient or unsuitable packing', 'Ordinary leakage, wear & tear', 'Delay & loss of market', 'Insolvency of the carrier', 'Deliberate damage', 'Wilful misconduct of the insured'] },

      { type: 'gapcheck', title: 'Is your cargo cover watertight?', subtitle: 'Tick the ones you already have in place — anything unchecked is a potential gap.', items: [
        'My goods are insured at CIF value plus 10%',
        'I know whether my policy is Clauses A, B, or C',
        'Cover runs warehouse-to-warehouse, not just port-to-port',
        'War & strikes cover is included for my routes',
        'My policy covers every transit mode I use (sea, air, land)',
      ], cta: { label: 'Book a cargo review', href: '/contact?service=Marine%20Cargo%20Insurance' } },

      { type: 'h2', text: 'How we help' },
      { type: 'steps', items: [
        { title: 'Match the right clauses', text: 'We set A, B, or C cover to your goods and routes.' },
        { title: 'Close the transit gaps', text: 'Warehouse-to-warehouse, so cover never lapses mid-journey.' },
        { title: 'Set the correct sum insured', text: 'CIF value plus a margin — the true landed cost.' },
        { title: 'Arrange the right policy type', text: 'Single transit or annual open cover for frequent shippers.' },
        { title: 'Support your claims', text: 'We manage the process through to settlement.' },
      ] },

      { type: 'cta', heading: 'Shipping soon? Let us check your cover first.', text: 'A short, independent review of your cargo policy can close gaps that would only surface after a loss at sea.', primary: { label: 'Get a Quote', href: '/contact?service=Marine%20Cargo%20Insurance' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },

      { type: 'h2', text: 'Frequently Asked Questions' },
      { type: 'faq', items: [
        { q: 'Does marine cargo insurance cover air freight?', a: 'Yes. Despite the name, cargo insurance covers goods moving by sea, air, road, or rail.' },
        { q: 'What are Institute Cargo Clauses?', a: 'The standard sets of cover — A (broadest, all-risks), B (named perils), and C (major casualties only) — that define what your goods are protected against.' },
        { q: 'How much should I insure my cargo for?', a: 'Typically CIF value plus a margin (often 10%) to cover freight, duty, and incidental costs — not just the invoice value.' },
        { q: 'What is open cover?', a: 'An annual policy that automatically covers all shipments a business makes — ideal for frequent importers and exporters.' },
      ] },
    ],
  },
]

export function getServiceBySlug(slug) {
  return servicePages.find((s) => s.slug === slug)
}
