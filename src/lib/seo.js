/*
 * SEO metadata for every route, in one place.
 *
 * The prerender build (scripts/prerender.mjs) calls seoFor() for each route and
 * bakes the result into that route's static HTML, so crawlers get a real title,
 * description, canonical and structured data on the first byte rather than
 * after they decide to run our JavaScript.
 *
 * The per-page useEffect blocks still set title/description at runtime for
 * client-side navigation. They produce the same strings this module does —
 * if you change a title format here, change it there too.
 */

import { servicePages, serviceCategories } from '../prototype/home/data/services.js'
import { solutionPages } from '../prototype/home/data/solutions.js'
import { industryPages } from '../prototype/home/data/industries.js'
import { audiencePages } from '../prototype/home/data/audiences.js'
import { blogPosts } from '../prototype/home/data/blog.js'

export const SITE_URL = 'https://www.insurefirst.ae'
export const SITE_NAME = 'Insure First'
export const LEGAL_NAME = 'Ensurio First RMC FZC'
export const PHONE = '+971509765976'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`

/* Static pages carry their copy here; data-driven pages read from the data files. */
const staticPages = {
  '/': {
    title: 'Insure First | Independent Insurance Consultancy UAE',
    description:
      'CBUAE-licensed independent insurance consultancy in the UAE. We audit your cover, benchmark your premiums, and fight your claims — working for you, never the insurer.',
  },
  '/services': {
    title: 'Insurance Services UAE | Insure First',
    description:
      'Independent advisory across commercial, specialist, professional, and personal insurance in the UAE — matched to your risks, not an insurer’s product list.',
  },
  '/about': {
    title: 'About | Insure First — Independent Insurance Consultancy UAE',
    description:
      'About Ensurio First (Insure First) — an independent, CBUAE-licensed insurance consultancy in the UAE led by Fredrick Lobo, working only in the client’s interest.',
  },
  '/contact': {
    title: 'Contact | Insure First — Insurance Consultancy UAE',
    description:
      'Talk to an independent insurance advisor in the UAE. Book a policy review, get a quote, or get help with a claim. Call 050 976 5976.',
  },
  '/blog': {
    title: 'Insurance Insights UAE | Insure First',
    description:
      'Practical guides to UAE insurance — cover explained, claims handled, and the exclusions that catch businesses out.',
  },
  '/policy-review': {
    title: 'Insurance Policy Review UAE | Insure First',
    description:
      'An independent review of the cover you already hold — what it pays, what it excludes, and where the gaps are, before you need to claim.',
  },
  '/risk-management': {
    title: 'Risk Management Consultancy UAE | Insure First',
    description:
      'Our Insurance Optimisation Programme benchmarks your Total Cost of Risk and drives down premiums without cutting the cover you depend on.',
  },
  '/management-consultancy': {
    title: 'Management Consultancy UAE | Insure First',
    description:
      'Succession, governance, valuation, and operational advisory for UAE family businesses and SMEs.',
  },
}

const stripHtml = (s) => String(s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

/* Google truncates around 155-160 characters; trim at a word boundary. */
const clamp = (s, max = 158) => {
  const t = stripHtml(s)
  if (t.length <= max) return t
  return `${t.slice(0, t.lastIndexOf(' ', max - 1))}…`
}

/*
 * Posts carry a human date ("July 2026"). schema.org wants ISO 8601, so map it
 * to the first of that month — precise enough for datePublished, and better
 * than omitting the field. Returns null if the shape is anything else.
 */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const isoDate = (s) => {
  const m = /^([A-Za-z]+)\s+(\d{4})$/.exec(String(s || '').trim())
  if (!m) return null
  const i = MONTHS.indexOf(m[1].toLowerCase())
  return i === -1 ? null : `${m[2]}-${String(i + 1).padStart(2, '0')}-01`
}

const crumb = (name, item) => ({ name, item: `${SITE_URL}${item}` })

const breadcrumbLd = (crumbs) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [crumb('Home', '/'), ...crumbs].map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: c.item,
  })),
})

/* Emitted on every page — this is the entity Google ties the brand to. */
export const organizationLd = {
  '@type': 'InsuranceAgency',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: LEGAL_NAME,
  url: SITE_URL,
  telephone: PHONE,
  areaServed: { '@type': 'Country', name: 'United Arab Emirates' },
  address: { '@type': 'PostalAddress', addressCountry: 'AE', addressRegion: 'Dubai' },
  description:
    'Independent, CBUAE-licensed insurance and risk management consultancy in the UAE.',
}

/*
 * Pull the FAQ block out of a page body — blog posts, service pages and
 * solution pages all use the same block shape. A page that has one becomes
 * eligible for the FAQ rich result, which is the cheapest SERP real estate
 * available to a page that already ranks.
 */
const faqLdFromBody = (body) => {
  const block = (body || []).find((b) => b.type === 'faq' && Array.isArray(b.items))
  if (!block || !block.items.length) return null
  return {
    '@type': 'FAQPage',
    mainEntity: block.items.map((f) => ({
      '@type': 'Question',
      name: stripHtml(f.q),
      acceptedAnswer: { '@type': 'Answer', text: stripHtml(f.a) },
    })),
  }
}

/**
 * Metadata for a pathname.
 * Returns null for a path with no route, so the prerender build skips it.
 */
export function seoFor(pathname) {
  const path = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  const canonical = `${SITE_URL}${path === '/' ? '/' : path}`
  const base = { canonical, image: DEFAULT_OG_IMAGE, type: 'website', jsonLd: [organizationLd] }

  const stat = staticPages[path]
  if (stat) {
    const jsonLd = [organizationLd]
    if (path === '/') {
      jsonLd.push({
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { '@id': `${SITE_URL}/#organization` },
      })
    } else {
      jsonLd.push(breadcrumbLd([crumb(stat.title.split('|')[0].trim(), path)]))
    }
    return { ...base, title: stat.title, description: clamp(stat.description), jsonLd }
  }

  const seg = path.split('/').filter(Boolean)

  if (seg[0] === 'insurance' && seg[1]) {
    const s = servicePages.find((p) => p.slug === seg[1])
    if (!s) return null
    const svcFaq = faqLdFromBody(s.body)
    return {
      ...base,
      title: s.metaTitle || `${s.title} | ${SITE_NAME}`,
      description: clamp(s.metaDescription || s.tagline),
      jsonLd: [
        organizationLd,
        {
          '@type': 'Service',
          name: s.title,
          serviceType: s.title,
          description: clamp(s.metaDescription || s.tagline),
          provider: { '@id': `${SITE_URL}/#organization` },
          areaServed: { '@type': 'Country', name: 'United Arab Emirates' },
        },
        ...(svcFaq ? [svcFaq] : []),
        breadcrumbLd([crumb('Insurance', '/services'), crumb(s.title, path)]),
      ],
    }
  }

  if (seg[0] === 'insurance-services' && seg[1]) {
    const c = serviceCategories.find((x) => x.slug === seg[1])
    if (!c) return null
    return {
      ...base,
      title: `${c.title} UAE | ${SITE_NAME}`,
      description: clamp(c.intro || c.tagline),
      jsonLd: [organizationLd, breadcrumbLd([crumb('Insurance', '/services'), crumb(c.title, path)])],
    }
  }

  if (seg[0] === 'solutions' && seg[1]) {
    const s = solutionPages.find((p) => p.slug === seg[1])
    if (!s) return null
    const solFaq = faqLdFromBody(s.body)
    return {
      ...base,
      title: s.metaTitle || `${s.title} | ${SITE_NAME}`,
      description: clamp(s.metaDescription || s.tagline),
      jsonLd: [
        organizationLd,
        ...(solFaq ? [solFaq] : []),
        breadcrumbLd([crumb('Services', '/services'), crumb(s.title, path)]),
      ],
    }
  }

  if (seg[0] === 'industries' && seg[1]) {
    const i = industryPages.find((p) => p.slug === seg[1])
    if (!i) return null
    return {
      ...base,
      title: i.metaTitle || `${i.title} Insurance | ${SITE_NAME}`,
      description: clamp(i.metaDescription || i.tagline),
      jsonLd: [organizationLd, breadcrumbLd([crumb('Industries', '/services'), crumb(i.title, path)])],
    }
  }

  if (seg[0] === 'who-we-help' && seg[1]) {
    const a = audiencePages.find((p) => p.slug === seg[1])
    if (!a) return null
    return {
      ...base,
      title: a.metaTitle || `${a.title} | ${SITE_NAME}`,
      description: clamp(a.metaDescription || a.tagline),
      jsonLd: [organizationLd, breadcrumbLd([crumb('Who We Help', '/services'), crumb(a.title, path)])],
    }
  }

  if (seg[0] === 'blog' && seg[1]) {
    const p = blogPosts.find((x) => x.slug === seg[1])
    if (!p) return null
    const faq = faqLdFromBody(p.body)
    return {
      ...base,
      type: 'article',
      title: p.metaTitle || `${p.title} | ${SITE_NAME}`,
      description: clamp(p.metaDescription || p.excerpt),
      jsonLd: [
        organizationLd,
        {
          '@type': 'Article',
          headline: clamp(p.title, 110),
          description: clamp(p.metaDescription || p.excerpt),
          author: { '@id': `${SITE_URL}/#organization` },
          publisher: { '@id': `${SITE_URL}/#organization` },
          mainEntityOfPage: canonical,
          ...(isoDate(p.date) ? { datePublished: isoDate(p.date) } : {}),
        },
        ...(faq ? [faq] : []),
        breadcrumbLd([crumb('Insights', '/blog'), crumb(p.title, path)]),
      ],
    }
  }

  return null
}

/** Every route the prerender build should emit. */
export function allRoutes() {
  return [
    ...Object.keys(staticPages),
    ...serviceCategories.map((c) => `/insurance-services/${c.slug}`),
    ...servicePages.map((s) => `/insurance/${s.slug}`),
    ...solutionPages.map((s) => `/solutions/${s.slug}`),
    ...industryPages.map((i) => `/industries/${i.slug}`),
    ...audiencePages.map((a) => `/who-we-help/${a.slug}`),
    ...blogPosts.map((p) => `/blog/${p.slug}`),
  ]
}
