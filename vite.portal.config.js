import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
 * The internal portal builds separately from the marketing site.
 *
 * Not a route inside the main app: the public bundle is already ~1.2MB and Vite
 * warns about it, and a dashboard bolted on would ship admin views to every
 * marketing visitor and every crawler. The two also have opposite constraints —
 * the public site is tuned for first paint and SEO, the portal has neither.
 * Keeping the builds apart means a portal bug cannot break lead capture.
 *
 * Deployed as its own Vercel project (portal.insurefirst.ae) from this same
 * repo — see docs/portal-setup.md.
 */
export default defineConfig({
  plugins: [react()],
  root: 'src/portal',
  publicDir: '../../public',
  // envDir follows `root` by default, which would look for .env.local inside
  // src/portal and silently find nothing — the app would render "Not
  // configured" against a perfectly good .env.local at the repo root.
  envDir: '../..',
  build: {
    outDir: '../../dist-portal',
    emptyOutDir: true,
  },
  server: {
    // Deliberately not 5200 — the marketing site's dev server runs there, and
    // both need to be up at once when working across the two.
    port: 5300,
    host: true,
  },
})
