# Changelog

All notable changes to the Insure First / Ensurio website are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).
The site is a Vite + React SPA deployed on Vercel at **insurefirst.ae**.

## 2026-07-31 — Lead capture & conversion

### Added
- **WhatsApp contact opt-in** on every lead form. A shared `WhatsAppConsent`
  component adds a "Contact me on WhatsApp" checkbox and a "use this same
  number" option that reveals an alternate-number field. Captured to new
  `whatsapp_opt_in` and `whatsapp_number` columns.
- **Interactive Policy Review page** (`/policy-review`) — a 4-step wizard
  (what to review · main concern · renewal timing · contact details) with a
  progress bar and animated transitions. Submits to Supabase with a structured
  `details` JSON payload. The home hero's "Request Policy Review" now links here.
- **Preferred callback time** picker (Morning/Afternoon/Evening/Anytime) in the
  quote modal and inline forms, stored in a `preferred_time` column.
- **Global quote modal** (`openQuote()` via a window CustomEvent) mounted once
  in `App`, rendering the shared inline lead form.
- **Supabase lead capture**, live end-to-end. `submitLead()` inserts into a
  `leads` table (insert-only RLS, anon key). Every form is tagged with a
  `source` and relevant `service`.
- **Dedicated About page** (`/about`).

### Changed
- Contact form's "What can we help with?" is now selectable **icon cards**
  instead of a dropdown.
- All contact/CTA forms across service, solution, audience, and industry pages
  now **submit inline** to Supabase instead of only navigating to `/contact`.
- Diagnostic tool and consultancy contact forms routed to Supabase
  (replacing the previous broken EmailJS wiring).

### Removed
- Dead legacy chrome (old prototype/production split, unused Navbar/Footer).

## 2026-07-30 — Site architecture build-out

### Added
- **Data-driven page system**: `ServicePage`, `SolutionPage`, `AudiencePage`,
  `IndustryPage`, and `CategoryHubPage` templates rendered from data files, with
  a shared typed content-block dispatcher (`stathero`, `cardgrid`, `estimator`,
  `gapcheck`, `faq`, `cta`, etc.).
- **19 insurance line pages** (`/insurance/:slug`) and **category hub pages**
  (`/insurance-services/:category`).
- **6 Solution pages** (`/solutions/:slug`).
- **Who We Help audience pages** (`/who-we-help/:slug`).
- **Industry pages** (`/industries/:slug`) + Industries dropdown in the top nav.
- Interactive engagement tools: **premium estimator** (config-driven sliders →
  indicative AED band) and **coverage gap check** (self-assessment → gaps + CTA).
- **Blog**: `/blog` listing, article pages, and AIDA-structured content blocks;
  UAE-market-focused articles added and dummy placeholders retired.
- **Unified navigation** — `ProtoNav` used site-wide, with a two-level Insurance
  Services mega-menu.
- `public/sitemap.xml` (~60 URLs) and `public/robots.txt`.
- `TODO.md` documenting the Supabase setup steps.

## 2026-06 – 2026-07 — Foundation

### Added
- Initial Ensurio landing page (Vite + React, React Router, Framer Motion,
  lucide-react, inline styles + CSS custom-property design tokens).
- Client content: contacts, credentials (CBUAE License 143), testimonials,
  socials, legal entity name.
