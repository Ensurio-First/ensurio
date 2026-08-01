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
      { type: 'gapcheck', title: 'Is your project fully covered?', subtitle: 'Five questions. "Not sure" is a valid answer — and the most common one.', items: [
        { statement: 'My CAR policy is insured for the full contract value, including materials and variations', gapTitle: 'Contract works may be under-insured', consequence: 'If the sum insured sits below the true contract value, insurers apply average — a 25% shortfall cuts every claim payment by 25%, not just the excess.', severity: 'high' },
        { statement: 'My cover runs past practical completion, through the maintenance and defects period', gapTitle: 'No maintenance-period cover', consequence: 'Most CAR policies end at handover. Defects that surface during the 12-month maintenance period are then entirely at your cost.', severity: 'high' },
        { statement: 'Every subcontractor carries their own cover and I hold current certificates', gapTitle: 'Unverified subcontractor risk', consequence: "If a subcontractor's cover has lapsed, their liability lands on your policy — and on your claims record at renewal.", severity: 'high' },
        { statement: 'All site workers are covered under UAE Labour Law and workmen’s compensation', gapTitle: 'Workforce cover may not meet Labour Law', consequence: 'Cover priced on an out-of-date wage roll or headcount can be reduced proportionally at claim time, leaving you to fund the difference.', severity: 'high' },
        { statement: 'Principals, consultants and every contractor on site are named on the policy', gapTitle: 'Not all parties named on the policy', consequence: 'An unnamed party has no right to claim under your policy — and can sue you instead. Main contracts in the UAE usually require them to be named.', severity: 'medium' },
      ], cta: { label: 'Book a construction review', href: '/contact?service=Construction%20Review' } },
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
      { type: 'gapcheck', title: 'Is your production protected?', subtitle: 'Five questions. "Not sure" is a valid answer — and the most common one.', items: [
        { statement: 'My buildings, plant and stock are insured at full reinstatement cost, not book value', gapTitle: 'Assets insured below reinstatement cost', consequence: 'Book value ignores inflation and replacement freight. Insure at a depreciated figure and the average clause reduces every claim in proportion.', severity: 'high' },
        { statement: 'Machinery breakdown cover is in place for my critical production plant', gapTitle: 'No machinery breakdown cover', consequence: 'A property policy covers fire and named perils, not a motor burning out. The most common cause of a production stoppage is usually the one excluded.', severity: 'high' },
        { statement: 'My business interruption indemnity period matches how long a rebuild would really take', gapTitle: 'Indemnity period too short', consequence: 'Twelve months is the default, but replacing specialised plant with a long lead time often takes longer. Cover stops on the anniversary, mid-recovery.', severity: 'high' },
        { statement: 'Product liability covers everything I currently manufacture, including exports', gapTitle: 'Product liability may not match output', consequence: 'Policies list declared products and territories. A new line or a new export market added since renewal sits outside the cover.', severity: 'medium' },
        { statement: 'My workforce is covered under UAE Labour Law and workmen’s compensation', gapTitle: 'Workforce cover may not meet Labour Law', consequence: 'Cover priced on an out-of-date wage roll can be reduced proportionally at claim time.', severity: 'high' },
      ], cta: { label: 'Book a manufacturing review', href: '/contact?service=Manufacturing%20Review' } },
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
      { type: 'gapcheck', title: 'Are your goods and fleet covered?', subtitle: 'Five questions. "Not sure" is a valid answer — and the most common one.', items: [
        { statement: 'My cargo is insured warehouse-to-warehouse, not just port-to-port', gapTitle: 'Gap at each end of the journey', consequence: 'Port-to-port cover leaves the inland legs uninsured — which is where a large share of handling damage and theft actually happens.', severity: 'high' },
        { statement: 'Every vehicle is on a single fleet policy with an up-to-date schedule', gapTitle: 'Vehicles missing from the schedule', consequence: 'A vehicle bought mid-term but never declared is uninsured. Fleet schedules drift quickly as trucks are added and sold.', severity: 'high' },
        { statement: 'My warehouse building and the stock inside it are separately insured to value', gapTitle: 'Stored goods may fall between policies', consequence: 'Marine cargo cover usually lapses after a set storage period. Goods sitting longer than that are covered by neither policy.', severity: 'high' },
        { statement: 'Third-party liability is in place for my operations, not just my vehicles', gapTitle: 'Operational liability gap', consequence: 'Motor policies cover road risk only. Damage caused while loading, unloading or handling in a yard falls outside them.', severity: 'medium' },
        { statement: 'My cover matches every mode I actually use — sea, air, road and rail', gapTitle: 'Not every transit mode is covered', consequence: 'Policies are written per mode. Switching a shipment to air freight at short notice can put it outside the cover entirely.', severity: 'medium' },
      ], cta: { label: 'Book a logistics review', href: '/contact?service=Logistics%20Review' } },
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
      { type: 'gapcheck', title: 'Is your venue protected?', subtitle: 'Five questions. "Not sure" is a valid answer — and the most common one.', items: [
        { statement: 'My public liability limit meets what my landlord or mall agreement requires', gapTitle: 'Liability limit may breach your lease', consequence: 'Mall and landlord agreements set a minimum limit. Falling below it is a breach of contract as well as an uninsured exposure.', severity: 'high' },
        { statement: 'My fit-out, not just the base building, is insured at replacement cost', gapTitle: 'Fit-out may be uninsured', consequence: 'Landlords insure the shell. The fit-out you paid for is usually your responsibility — and often the largest asset you own on site.', severity: 'high' },
        { statement: 'Business interruption cover is in place and reflects my seasonal trade', gapTitle: 'No business interruption cover', consequence: 'Rebuilding a closed venue means months of rent and payroll with no income. Property cover pays for the damage, not the lost trade.', severity: 'high' },
        { statement: 'Food safety and product liability are specifically covered', gapTitle: 'Food-safety exposure not covered', consequence: 'A general liability policy may exclude food-borne illness. One incident can bring a group claim alongside a municipality investigation.', severity: 'medium' },
        { statement: 'All staff are covered under UAE Labour Law and workmen’s compensation', gapTitle: 'Staff cover may not meet Labour Law', consequence: 'High-turnover venues drift out of step with declared headcount, which can reduce a claim proportionally.', severity: 'medium' },
      ], cta: { label: 'Book a hospitality review', href: '/contact?service=Hospitality%20Review' } },
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
      { type: 'gapcheck', title: 'Is your aviation risk covered?', subtitle: 'Five questions. "Not sure" is a valid answer — and the most common one.', items: [
        { statement: 'My hull is insured at an agreed value that was reviewed this year', gapTitle: 'Agreed value may be out of date', consequence: 'An agreed value fixed years ago pays out at that figure after a total loss, not at today’s replacement cost.', severity: 'high' },
        { statement: 'My passenger and third-party limits meet every regulator and lease requirement', gapTitle: 'Liability limits may fall short', consequence: 'Lessors and regulators set minimum limits. Falling below one can ground the aircraft as well as leave the exposure open.', severity: 'high' },
        { statement: 'Hull war and allied perils cover is included', gapTitle: 'No hull war cover', consequence: 'War, terrorism and confiscation are excluded from standard hull cover and must be bought back separately — a material gap on regional routes.', severity: 'high' },
        { statement: 'Ground handling and hangar-keeper risks are covered', gapTitle: 'Ground risk not covered', consequence: 'A large share of hull damage happens on the ground, where flight-risk cover does not respond.', severity: 'medium' },
        { statement: 'My programme is placed with the specialist aviation market', gapTitle: 'Placed outside the specialist market', consequence: 'Generalist markets price aviation conservatively and may lack the wording and claims capability when it matters.', severity: 'low' },
      ], cta: { label: 'Book an aviation review', href: '/contact?service=Aviation%20Industry%20Review' } },
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
      { type: 'gapcheck', title: 'Is your engineering risk covered?', subtitle: 'Five questions. "Not sure" is a valid answer — and the most common one.', items: [
        { statement: 'My installation projects carry erection all-risks cover', gapTitle: 'No erection all-risks cover', consequence: 'Standard property and CAR wordings do not respond to damage during installation, testing and commissioning — the highest-risk phase of the job.', severity: 'high' },
        { statement: 'I hold professional indemnity cover for the design work I take on', gapTitle: 'Design liability uninsured', consequence: 'A design error is a professional liability, not physical damage. General liability policies exclude it outright.', severity: 'high' },
        { statement: 'My PI retroactive date reaches back far enough to cover my earlier projects', gapTitle: 'Retroactive date leaves past work exposed', consequence: 'PI responds to when the work was done, not when the claim arrives. A recent retroactive date leaves years of completed projects uninsured.', severity: 'high' },
        { statement: 'My machinery and plant are insured, including while in transit between sites', gapTitle: 'Plant may be uninsured in transit', consequence: 'Site-based cover often stops at the gate. Plant moving between projects is a common uninsured loss.', severity: 'medium' },
        { statement: 'Third-party liability is in place for my site operations', gapTitle: 'Site liability gap', consequence: 'Injury to a visitor or damage to neighbouring property sits outside contract works cover.', severity: 'medium' },
      ], cta: { label: 'Book an engineering review', href: '/contact?service=Engineering%20Review' } },
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
