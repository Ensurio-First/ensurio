import industryConstruction from '../../../assets/industry-construction.jpg'
import industryManufacturing from '../../../assets/industry-manufacturing.jpg'
import industryLogistics from '../../../assets/industry-logistics.jpg'
import industryHospitality from '../../../assets/industry-hospitality.jpg'
import industryAviation from '../../../assets/industry-aviation.jpg'
import industryEngineering from '../../../assets/industry-engineering.jpg'

/*
 * Industry pages — rendered by <IndustryPage>. Each speaks to a sector, maps
 * its key risks, and links to the covers most relevant to it (relatedServices).
 */
export const industryPages = [
  {
    slug: 'construction',
    title: 'Construction',
    tagline: 'Project liability, contractor all-risk, and workforce protection for every stage of the build.',
    metaTitle: 'Construction Insurance UAE | Ensurio First',
    metaDescription: 'Independent insurance advisory for UAE construction — Contractors All Risks, workforce, and liability cover matched to your contracts and sites.',
    image: industryConstruction,
    badges: ['CBUAE Licensed', 'Independent Advisory', 'Project & Site Cover'],
    body: [
      { type: 'lead', text: 'Construction is one of the UAE’s largest and riskiest industries — a single incident on site can cost millions and stall a project.' },
      { type: 'p', text: 'We align your cover with your contracts, subcontractors, and site exposures — so the works, the plant, the public, and your workforce are all protected from ground-breaking to handover.' },
      { type: 'h2', text: 'Key risks in construction' },
      { type: 'cardgrid', variant: 'risk', columns: 3, items: [
        { icon: 'building', title: 'Damage to the works', text: 'Fire, flood, collapse, and accidental damage on site.' },
        { icon: 'users', title: 'Third-party injury', text: 'Injury to the public or damage to nearby property.' },
        { icon: 'package', title: 'Plant & equipment', text: 'Loss of or damage to construction machinery.' },
        { icon: 'shield', title: 'Workforce injury', text: 'Labour Law liability for on-site injuries.' },
        { icon: 'flame', title: 'Project delay', text: 'Lost time and cost after an insured event.' },
        { icon: 'truck', title: 'Subcontractor risk', text: 'Gaps where risk is not properly transferred.' },
      ] },
      { type: 'gapcheck', title: 'Is your project fully covered?', subtitle: 'Tick what is true today.', items: ['My CAR cover matches the full contract value', 'The cover period includes the maintenance phase', 'Subcontractor risk is properly transferred', 'My workforce is covered under Labour Law', 'Every contractor on site is named or covered'], cta: { label: 'Book a construction review', href: '/contact?service=Construction%20Review' } },
      { type: 'cta', heading: 'Building something? Insure it properly.', text: 'An independent review that matches your cover to your contract and your site.', primary: { label: 'Book a Review', href: '/contact?service=Construction%20Review' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
    ],
    relatedServices: [
      { label: 'Engineering & Construction', href: '/insurance/engineering-construction' },
      { label: "Employer's Liability", href: '/insurance/employers-liability' },
      { label: 'Public & Product Liability', href: '/insurance/public-liability' },
      { label: 'Motor Fleet', href: '/insurance/motor-fleet' },
    ],
  },
  {
    slug: 'manufacturing',
    title: 'Manufacturing',
    tagline: 'Property, machinery breakdown, and supply-chain protection for your plant and production.',
    metaTitle: 'Manufacturing Insurance UAE | Ensurio First',
    metaDescription: 'Independent insurance advisory for UAE manufacturers — property, machinery breakdown, business interruption, and product liability matched to your operations.',
    image: industryManufacturing,
    badges: ['CBUAE Licensed', 'Independent Advisory', 'Plant & Production'],
    body: [
      { type: 'lead', text: 'For a manufacturer, the biggest risk is not just damage to the plant — it is the income lost while production is down.' },
      { type: 'p', text: 'We make sure your property and machinery are insured at the right value, your business interruption cover reflects real recovery time, and your product and workforce liabilities are protected.' },
      { type: 'h2', text: 'Key risks in manufacturing' },
      { type: 'cardgrid', variant: 'risk', columns: 3, items: [
        { icon: 'flame', title: 'Fire & property damage', text: 'The plant, stock, and buildings you depend on.' },
        { icon: 'building', title: 'Machinery breakdown', text: 'Failure of critical production equipment.' },
        { icon: 'gem', title: 'Business interruption', text: 'Lost income while production is halted.' },
        { icon: 'package', title: 'Product liability', text: 'Harm caused by the goods you produce.' },
        { icon: 'truck', title: 'Supply chain', text: 'Disruption from a key supplier or customer.' },
        { icon: 'shield', title: 'Workforce injury', text: 'Labour Law liability on the factory floor.' },
      ] },
      { type: 'gapcheck', title: 'Is your production protected?', subtitle: 'Tick what is true today.', items: ['My property is insured at full reinstatement value', 'Machinery breakdown cover is in place', 'My business interruption reflects real recovery time', 'Product liability is covered for what I make', 'My workforce is covered under Labour Law'], cta: { label: 'Book a manufacturing review', href: '/contact?service=Manufacturing%20Review' } },
      { type: 'cta', heading: 'Keep production protected.', text: 'An independent review of your property, machinery, and interruption cover.', primary: { label: 'Book a Review', href: '/contact?service=Manufacturing%20Review' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
    ],
    relatedServices: [
      { label: 'Commercial Property', href: '/insurance/commercial-property' },
      { label: 'Business Interruption', href: '/insurance/business-interruption' },
      { label: 'Public & Product Liability', href: '/insurance/public-liability' },
      { label: "Employer's Liability", href: '/insurance/employers-liability' },
    ],
  },
  {
    slug: 'logistics',
    title: 'Logistics',
    tagline: 'Marine cargo, fleet, and liability cover for goods and vehicles on the move.',
    metaTitle: 'Logistics Insurance UAE | Ensurio First',
    metaDescription: 'Independent insurance advisory for UAE logistics — marine cargo, motor fleet, warehouse, and liability cover for goods and vehicles in transit.',
    image: industryLogistics,
    badges: ['CBUAE Licensed', 'Independent Advisory', 'Cargo & Fleet'],
    body: [
      { type: 'lead', text: 'In logistics, your risk is constantly moving — goods in transit, vehicles on the road, and stock in the warehouse all need protection.' },
      { type: 'p', text: 'We cover the goods door-to-door with the right cargo clauses, consolidate your vehicles into an efficient fleet policy, and protect your premises and third-party liabilities.' },
      { type: 'h2', text: 'Key risks in logistics' },
      { type: 'cardgrid', variant: 'risk', columns: 3, items: [
        { icon: 'package', title: 'Cargo loss & damage', text: 'Goods lost or damaged in transit.' },
        { icon: 'truck', title: 'Fleet accidents', text: 'Damage and liability across your vehicles.' },
        { icon: 'users', title: 'Third-party liability', text: 'Injury or damage caused to others.' },
        { icon: 'building', title: 'Warehouse & property', text: 'Fire, flood, and theft at your premises.' },
        { icon: 'lock', title: 'Theft & pilferage', text: 'Loss of goods in transit or storage.' },
        { icon: 'flame', title: 'Delay & disruption', text: 'Costs from delayed or disrupted shipments.' },
      ] },
      { type: 'gapcheck', title: 'Are your goods and fleet covered?', subtitle: 'Tick what is true today.', items: ['My cargo is insured warehouse-to-warehouse', 'All my vehicles are on one fleet policy', 'My warehouse and stock are insured', 'Third-party liability is in place', 'My cover matches every transit mode I use'], cta: { label: 'Book a logistics review', href: '/contact?service=Logistics%20Review' } },
      { type: 'cta', heading: 'Keep your goods and fleet moving safely.', text: 'An independent review of your cargo, fleet, and premises cover.', primary: { label: 'Book a Review', href: '/contact?service=Logistics%20Review' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
    ],
    relatedServices: [
      { label: 'Marine Cargo', href: '/insurance/marine-cargo' },
      { label: 'Motor Fleet', href: '/insurance/motor-fleet' },
      { label: 'Public & Product Liability', href: '/insurance/public-liability' },
      { label: 'Commercial Property', href: '/insurance/commercial-property' },
    ],
  },
  {
    slug: 'hospitality',
    title: 'Hospitality',
    tagline: 'Guest liability, property, and business interruption cover for hotels, restaurants, and venues.',
    metaTitle: 'Hospitality Insurance UAE | Ensurio First',
    metaDescription: 'Independent insurance advisory for UAE hospitality — guest liability, property, business interruption, and food-safety cover for hotels, restaurants, and venues.',
    image: industryHospitality,
    badges: ['CBUAE Licensed', 'Independent Advisory', 'Guest & Property'],
    body: [
      { type: 'lead', text: 'Hospitality means welcoming the public every day — and carrying the liability that comes with it, alongside high-value property and thin operating margins.' },
      { type: 'p', text: 'We protect your guests, your property, and your income — with the right public liability limits, property cover, and business interruption to keep you trading after a loss.' },
      { type: 'h2', text: 'Key risks in hospitality' },
      { type: 'cardgrid', variant: 'risk', columns: 3, items: [
        { icon: 'users', title: 'Guest injury', text: 'Slips, trips, and accidents on your premises.' },
        { icon: 'flame', title: 'Property & fire', text: 'Damage to the building, fit-out, and contents.' },
        { icon: 'gem', title: 'Business interruption', text: 'Lost income while you cannot trade.' },
        { icon: 'package', title: 'Food safety', text: 'Product liability from food and beverage.' },
        { icon: 'shield', title: 'Employee injury', text: 'Labour Law liability for your staff.' },
        { icon: 'lock', title: 'Theft & cash', text: 'Loss of stock, cash, and guest property.' },
      ] },
      { type: 'gapcheck', title: 'Is your venue protected?', subtitle: 'Tick what is true today.', items: ['My public liability limit meets landlord/mall terms', 'My property and fit-out are insured to value', 'Business interruption cover is in place', 'Food-safety and product liability are covered', 'My staff are covered under Labour Law'], cta: { label: 'Book a hospitality review', href: '/contact?service=Hospitality%20Review' } },
      { type: 'cta', heading: 'Welcome guests with confidence.', text: 'An independent review of your guest, property, and interruption cover.', primary: { label: 'Book a Review', href: '/contact?service=Hospitality%20Review' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
    ],
    relatedServices: [
      { label: 'Public & Product Liability', href: '/insurance/public-liability' },
      { label: 'Commercial Property', href: '/insurance/commercial-property' },
      { label: 'Business Interruption', href: '/insurance/business-interruption' },
      { label: "Employer's Liability", href: '/insurance/employers-liability' },
    ],
  },
  {
    slug: 'aviation',
    title: 'Aviation',
    tagline: 'Aircraft hull, passenger liability, and ground-risk cover for the UAE aviation sector.',
    metaTitle: 'Aviation Industry Insurance UAE | Ensurio First',
    metaDescription: 'Independent insurance advisory for the UAE aviation sector — hull, passenger and third-party liability, and ground-risk cover placed with specialist underwriters.',
    image: industryAviation,
    badges: ['CBUAE Licensed', 'Specialist Market', 'Hull & Liability'],
    body: [
      { type: 'lead', text: 'Aviation risk reaches a scale no other industry faces — and it demands cover placed with specialist underwriters who understand it.' },
      { type: 'p', text: 'From airlines and charter operators to private jets, MRO, and ground handlers, we structure hull, liability, and ground cover and place it in the dedicated aviation market.' },
      { type: 'h2', text: 'Key risks in aviation' },
      { type: 'cardgrid', variant: 'risk', columns: 3, items: [
        { icon: 'shield', title: 'Hull damage', text: 'Loss or damage to the aircraft itself.' },
        { icon: 'users', title: 'Passenger liability', text: 'Injury or loss to passengers aboard.' },
        { icon: 'building', title: 'Third-party liability', text: 'Injury or damage to people and property below.' },
        { icon: 'truck', title: 'Ground risk', text: 'Damage while taxiing, parked, or handled.' },
        { icon: 'gem', title: 'Crew & licence', text: 'Loss of crew medical certification.' },
        { icon: 'flame', title: 'War & hijack', text: 'Specialist hull war exposures.' },
      ] },
      { type: 'gapcheck', title: 'Is your aviation risk covered?', subtitle: 'Tick what is true today.', items: ['My hull is insured at a current agreed value', 'Passenger and third-party limits meet requirements', 'Hull war cover is included', 'Ground and handling risks are covered', 'My cover is placed with the specialist market'], cta: { label: 'Book an aviation review', href: '/contact?service=Aviation%20Industry%20Review' } },
      { type: 'cta', heading: 'Aviation cover, placed with specialists.', text: 'An independent review of your hull values, liability limits, and wordings.', primary: { label: 'Book a Review', href: '/contact?service=Aviation%20Industry%20Review' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
    ],
    relatedServices: [
      { label: 'Aviation Insurance', href: '/insurance/aviation' },
      { label: 'Public & Product Liability', href: '/insurance/public-liability' },
      { label: "Employer's Liability", href: '/insurance/employers-liability' },
      { label: 'Cyber', href: '/insurance/cyber' },
    ],
  },
  {
    slug: 'engineering',
    title: 'Engineering',
    tagline: 'Erection all-risk, professional indemnity, and project cover for engineering firms.',
    metaTitle: 'Engineering Insurance UAE | Ensurio First',
    metaDescription: 'Independent insurance advisory for UAE engineering firms — erection all-risk, professional indemnity, machinery, and project cover for technical projects.',
    image: industryEngineering,
    badges: ['CBUAE Licensed', 'Independent Advisory', 'Project & Professional'],
    body: [
      { type: 'lead', text: 'Engineering carries both physical and professional risk — a failure can be a damaged asset, or a claim that your design or advice was at fault.' },
      { type: 'p', text: 'We cover the project and the plant with erection all-risk and machinery cover, and protect the firm itself with professional indemnity for the advice and designs you deliver.' },
      { type: 'h2', text: 'Key risks in engineering' },
      { type: 'cardgrid', variant: 'risk', columns: 3, items: [
        { icon: 'building', title: 'Erection all-risk', text: 'Damage during installation and testing.' },
        { icon: 'gem', title: 'Professional indemnity', text: 'Claims over your design or advice.' },
        { icon: 'flame', title: 'Project delay', text: 'Lost time and cost after an insured event.' },
        { icon: 'package', title: 'Machinery breakdown', text: 'Failure of installed plant and equipment.' },
        { icon: 'users', title: 'Third-party liability', text: 'Injury or damage arising from the works.' },
        { icon: 'shield', title: 'Design risk', text: 'Exposure from faulty or defective design.' },
      ] },
      { type: 'gapcheck', title: 'Is your engineering risk covered?', subtitle: 'Tick what is true today.', items: ['My projects have erection all-risk cover', 'I hold professional indemnity for my designs', 'My PI retroactive date covers past projects', 'Machinery and plant are covered', 'Third-party liability is in place'], cta: { label: 'Book an engineering review', href: '/contact?service=Engineering%20Review' } },
      { type: 'cta', heading: 'Cover the project and the professional risk.', text: 'An independent review of your project, machinery, and professional indemnity cover.', primary: { label: 'Book a Review', href: '/contact?service=Engineering%20Review' }, secondary: { label: 'Call 050 976 5976', href: 'tel:+971509765976' } },
    ],
    relatedServices: [
      { label: 'Engineering & Construction', href: '/insurance/engineering-construction' },
      { label: 'Professional Indemnity', href: '/insurance/professional-indemnity' },
      { label: 'Business Interruption', href: '/insurance/business-interruption' },
      { label: 'Public & Product Liability', href: '/insurance/public-liability' },
    ],
  },
]

export function getIndustryBySlug(slug) {
  return industryPages.find((i) => i.slug === slug)
}
