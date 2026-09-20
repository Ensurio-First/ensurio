/*
 * Prerender entry point. Built separately by `vite build --ssr` and consumed by
 * scripts/prerender.mjs — never shipped to the browser.
 *
 * StaticRouter stands in for BrowserRouter (which needs a real history object).
 * Effects do not run under renderToString, which is exactly what we want here:
 * the per-page useEffect blocks that poke at document.title are skipped, and
 * prerender.mjs writes the head tags from src/lib/seo.js instead.
 */
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
// React Router 7 merged the server entry into the core package; the old
// 'react-router-dom/server' subpath no longer exists.
import { StaticRouter } from 'react-router'
import App from './App'

export function render(url) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
}

export { allRoutes, seoFor } from './lib/seo.js'
