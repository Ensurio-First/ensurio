/*
 * Prerender every route to static HTML.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server), as the last
 * step of `npm run build`. For each route it renders the React tree to HTML and
 * writes dist/<route>/index.html with that markup and a full head.
 *
 * Why this exists: the site is a client-rendered SPA, so every URL used to serve
 * the same shell — one generic <title>, no description. Google's first-wave crawl
 * saw 61 identical pages and had to run our JavaScript to find anything else.
 *
 * Cloudflare serves dist/<route>/index.html for /<route> directly. The SPA
 * fallback in wrangler.jsonc still catches anything not prerendered, so client
 * -side navigation and unknown URLs behave exactly as before.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
// Built outside dist/ on purpose: anything under dist/ is deployed as a public
// asset, and this bundle has no business being downloadable.
const serverDir = join(root, '.prerender')

const { render, allRoutes, seoFor } = await import(join(serverDir, 'entry-server.js'))

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/* JSON-LD sits in a <script>, so the only dangerous sequence is a closing tag. */
const escJson = (o) => JSON.stringify(o).replace(/</g, '\\u003c')

function headFor(seo) {
  const tags = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<link rel="canonical" href="${esc(seo.canonical)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />`,

    `<meta property="og:type" content="${esc(seo.type)}" />`,
    `<meta property="og:site_name" content="Insure First" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:url" content="${esc(seo.canonical)}" />`,
    `<meta property="og:image" content="${esc(seo.image)}" />`,
    `<meta property="og:locale" content="en_AE" />`,

    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    `<meta name="twitter:description" content="${esc(seo.description)}" />`,
    `<meta name="twitter:image" content="${esc(seo.image)}" />`,

    `<script type="application/ld+json">${escJson({
      '@context': 'https://schema.org',
      '@graph': seo.jsonLd,
    })}</script>`,
  ]
  return tags.join('\n    ')
}

const template = await readFile(join(dist, 'index.html'), 'utf8')

const routes = allRoutes()
let written = 0
const problems = []

for (const route of routes) {
  const seo = seoFor(route)
  if (!seo) {
    problems.push(`${route}: no SEO entry`)
    continue
  }

  let body
  try {
    body = render(route)
  } catch (err) {
    problems.push(`${route}: render failed — ${err.message}`)
    continue
  }

  const html = template
    // The shell's generic title is the thing we are here to replace.
    .replace(/<title>[\s\S]*?<\/title>/, headFor(seo))
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)

  const outDir = route === '/' ? dist : join(dist, route)
  await mkdir(outDir, { recursive: true })
  await writeFile(join(outDir, 'index.html'), html, 'utf8')
  written++
}

/*
 * A dedicated shell for unmatched URLs.
 *
 * not_found_handling in wrangler.jsonc serves this with a real 404 status. It
 * cannot be dist/index.html: that file is now the prerendered homepage, so
 * using it as the fallback would answer every dead URL with homepage content,
 * a canonical pointing at /, and an index,follow robots tag.
 *
 * This is only reachable once every real route is prerendered — otherwise a
 * genuine page would be served as a 404.
 */
const notFoundHead = [
  '<title>Page Not Found | Insure First</title>',
  '<meta name="description" content="The page you are looking for is not available." />',
  '<meta name="robots" content="noindex, follow" />',
].join('\n    ')

const notFound = template
  .replace(/<title>[\s\S]*?<\/title>/, notFoundHead)
  .replace('<div id="root"></div>', `<div id="root">${render('/__not-found__')}</div>`)
await writeFile(join(dist, '404.html'), notFound, 'utf8')

console.log(`prerendered ${written}/${routes.length} routes + 404.html`)
if (problems.length) {
  console.error(`\n${problems.length} route(s) failed:`)
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}
