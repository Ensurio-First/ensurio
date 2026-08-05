# Changelog

All notable changes to the Insure First / Ensurio website are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).
The site is a Vite + React SPA deployed on Vercel at **insurefirst.ae**.

## 2026-08-05 — Clients tab reads a local mirror, not Zoho

Caching the access token stopped the integration falling over, but it was
treating a symptom. The tab still called Zoho on every render — one list call
plus eight COQL aggregates, two to five seconds, repeated every time someone
switched tabs — against an API that meters credits per org and caps token mints
per ten minutes. My own note at the top of that function said "live now, sync
when we build the reports"; this is the wall that justified the sync.

### Added

- **`crm_clients` / `crm_policies` / `crm_sync_runs`**, plus a
  `crm_client_summary` view giving policy totals and the next renewal in one
  query. All five modules flatten into one policy table — they disagree about
  field names but not about what a policy is, and one table is what makes
  "everything expiring this month, across the book" a single query.
- **`zoho-sync`**, incremental by `Modified_Time`: records come back
  newest-modified first and the pass stops at the first one older than the last
  successful run, so a routine sync costs a page or two per module.
- **A visible freshness line** with "Sync now". A mirror with no visible
  freshness quietly goes stale, and "no policies" and "nothing has synced since
  Tuesday" otherwise look identical on screen.

### Changed

- **Sorting by renewal date now covers the whole book.** This is the part the
  live version could not do at all: expiry lives on the policy modules, so Zoho
  cannot order a *client* query by it and the old UI could only sort the fifty
  rows already on screen — which it had to admit in a footnote. Postgres sorts
  all of them.
- Switching tabs no longer costs anything. That was the original complaint and
  it was a fair one.

### Notes

- **The watermark is the START of the last successful run, not its end.** A
  record modified while a sync was mid-flight may have been read before the edit
  landed; starting from the finish time would skip it permanently. Re-reading a
  few records is free, missing one is not.
- **Deletions can only be seen by a full pass.** A record deleted in Zoho stops
  being returned rather than being reported, so `mode: full` re-stamps every
  live record and prunes whatever kept an older `synced_at`. Running that prune
  after an incremental pass would delete the entire book bar the few rows that
  changed — hence the guard.
- Policy rows carry **no foreign key** to clients. A policy can point at a
  client the Accounts pass has not reached yet, and a sync that dies halfway on
  referential integrity is worse than a briefly orphaned row.
- The sync reads **all readable fields** and keeps the record in `raw`, not just
  the eight columns we name today. Storing only those would mean a full re-sync
  the first time anyone wants a ninth.
- `zoho-sync` is deployed with `verify_jwt` off because it has two callers with
  two credentials — a staff JWT through the usual allowlist, or a shared secret
  for the scheduled run. Authentication is inside the function, not in front
  of it.
- The mirror tables have **no write policy for anyone**. The CRM is the system
  of record; a row edited in the portal would look saved and be silently
  overwritten by the next sync.

## 2026-08-05 — Zoho token: one mint an hour, not one per isolate

The Clients tab worked for four requests and then failed every request after
with `token refresh failed: Access Denied`, which reads like a bad credential
and is not one. Zoho caps how many access tokens a single refresh token may
mint in a rolling ten-minute window and refuses for the rest of it once the cap
is passed.

The cap was being hit in about a minute, for two compounding reasons. The token
cache was an edge-function module variable, so every cold isolate minted its
own; and nothing serialised a cache miss, so the five module-metadata reads the
Clients tab issues in parallel all saw an empty cache and all minted. One page
view cost a double-figure number of tokens.

### Added

- **`private.zoho_token`**, one row, reached only through `zoho_token_get()` /
  `zoho_token_put()`. The `private` schema is not exposed to PostgREST, both
  functions are `security definer` with a pinned `search_path`, and EXECUTE is
  revoked from PUBLIC before being granted to `service_role` alone — a bearer
  token for the whole CRM is not something a signed-in advisor should be able to
  read out of the database and replay against Zoho.

### Changed

- **Concurrent cache misses join one in-flight mint** instead of racing. This is
  the fix that matters most: the parallel reads elsewhere in this codebase are
  deliberate, and without this every one of them was a separate mint.
- A 401 retry now **bypasses the shared store**. A token revoked before its
  stated expiry would otherwise be handed back from the row to every isolate
  indefinitely.
- Both halves of the store are best-effort. If it is unreachable the isolate
  falls back to its own cache, so a broken table degrades this to the previous
  behaviour rather than taking Zoho offline.
- `Access Denied` now says on screen that it means either a wrong secret **or**
  the ten-minute cap, and that if it was working a moment ago it is the second.
  The two are indistinguishable in Zoho's reply, and the wrong reading sends you
  to re-issue credentials that were fine.

## 2026-08-05 — Portal: policy terms on the Clients tab

The Clients tab rendered whatever fields a policy record happened to carry,
because the CRM had never been introspected and inventing field names would have
produced a table of blanks that looked like missing data rather than a wrong
guess. With the `zoho-crm-data-operations` MCP server authorised, the schema
could finally be read — so the guessing is over, and the tab can answer the
question advisors actually open it for: who lapses next.

### What the CRM turned out to contain

Five policy modules, all linking to `Accounts`, all carrying issue and expiry
dates — under five different sets of names, which is why a generic renderer
could never produce a sortable expiry column:

| Module | Issue | Expiry | Type | Client lookup |
| --- | --- | --- | --- | --- |
| `Motor_Policies` | `Policy_Issued_on` | `Policy_Expires_on` | date | `Customer_Name` |
| `Medical_Policies` | `Policy_Issued_on` | `Policy_Expires_on` | date | `Customer_Name` |
| `General_Insurance` | `Policy_Issued_on` | `Policy_Expires_on` | date | `Customer_Name` |
| `Policy_Details` | `Policy_Issue_Date` | `Policy_Expiry_Date` | date | **`Account`** |
| `Renewal_Policy_Details` | `Policy_Issued_Date` | `Policy_Expiry_Date` | **datetime** | `Customer_Name` |

`Name` is the Policy Number in all five.

They are not equivalent, and that matters more than the naming. The first three
are the live book — client link and both dates populated throughout, expiries
running into 2027. `Policy_Details` is an endorsement ledger: roughly two thirds
of a 200-record sample had no expiry at all and most rows are Status
"Endorsement". `Renewal_Policy_Details` is a dead archive whose most recently
*modified* rows are 2020–2022 policies, about a third of them linked to no
client. One client had four live policies against ~40 records total.

### Added

- **Next expiry column**, banded in four steps — lapsed, ≤30 days, ≤90 days,
  fine. Four bands rather than a gradient because the column is scanned, not
  read, and a continuous scale makes every row look mildly urgent.
- **Renewal dates from the live modules only.** An archive that expired in 2022
  is not a renewal; letting it win the column would have put a permanent false
  alarm against half the book.
- **Structured policy cards** — number, type, insurer, status, premium, and the
  term leading. Everything the metadata could not name still renders in an
  expandable list, so a field this org uses unexpectedly stays visible.
- **Collapsed "Historical" section** for the endorsement ledger and the old
  book. Reachable, never competing with current cover for attention.
- **Active / On record / Next renewal** summary at the top of the detail panel.

### Changed

- **Fields are resolved from metadata by data type plus a pattern tested against
  both `api_name` and `field_label`.** Matching either alone misses here: Motor's
  `Cover_Type` is *labelled* "Policy Type", and `Policy_Details.Account` is
  *labelled* "Customer Name". Verified: 35/35 resolutions correct across all five
  modules against live metadata.
- **The policy count still spans all five modules**, deliberately. A record
  linked to the client is a record linked to the client, and quietly dropping
  some would make the portal disagree with Zoho.
- `detectPolicyModules` now filters on `generated_type` too — subforms and field
  trackers are `api_supported` and were otherwise eligible to slip through the
  name match.
- Expiry-column sorting is scoped to the loaded page and **says so on screen**.
  Expiry lives on the policy modules, so Zoho cannot order the client query by
  it; sorting the whole book would mean reading the whole book.

### Notes

- Renewal maths costs three extra COQL aggregates per page (`MIN(expiry)` where
  expiry is still ahead of today), so a 50-client page is eight aggregate queries
  rather than five — against 250 calls for the related-list approach.
- `Renewal_Policy_Details` stores datetimes at `+04:00`. Dates are truncated to
  their leading `YYYY-MM-DD` rather than parsed, so a UTC render cannot shift a
  policy a day earlier than the broker wrote it.
- **Still unproven: the COQL calls themselves.** The edge function's Zoho
  credentials are rejected (`token refresh failed: Access Denied`) and the MCP
  server exposes no COQL endpoint, so `COUNT(id) … GROUP BY` and `MIN(expiry)`
  are written to the documented contract but have never executed. Everything
  else here was verified against live records.
- Two data-quality findings for the CRM, not the code: about 20 of 200 sampled
  motor policies share an expiry of exactly `2026-06-30`, which looks like bulk
  or placeholder entry and will band as lapsed; and some terms are reversed
  (issued 2026-05-10, "expires" 2025-08-16).

## 2026-08-01 — Portal: lead status editing

The leads view was read-only, so `lead_status` could only be changed with the
service-role key — "Awaiting contact" counted every lead forever and the
workflow stages were dead columns.

### Added

- **Stage control** in the detail panel. Buttons rather than a dropdown: five
  options clicked dozens of times a day are worth one tap.
- **`lead_status_updated_at` / `_by`**, stamped by a database trigger. The team
  shares mailboxes (`webservices@`, `consult@`), so "it says contacted" is not
  much use without knowing who said so.

### Security

- **The column grant is what scopes this, not the policy.** An RLS policy
  decides which *rows* an update may touch, never which *columns* — and Supabase
  grants UPDATE on every column to `authenticated` by default. Adding an UPDATE
  policy alone would have let any staff account rewrite a lead's name, email,
  report or reference number. UPDATE is now revoked wholesale and re-granted on
  `lead_status` alone.
- The audit columns have no grant at all, so they cannot be forged from the
  client — the trigger is the only thing that writes them.
- Verified against the live database: staff setting `lead_status` succeeds and
  is stamped; staff setting `name` or `lead_status_updated_by` is denied at the
  table; a non-allowlisted account updates 0 rows.

## 2026-08-01 — Internal staff portal (leads view)

First slice of the internal dashboard, at `portal.insurefirst.ae`. Setup and
deploy steps in `docs/portal-setup.md`.

### Added

- **`portal_staff` allowlist + `is_portal_staff()`** and the first RLS policies
  the `leads` table has ever had. Authentication proves an address; membership
  of the allowlist grants access. Verified against the live database: anon sees
  0 rows, a signed-in non-allowlisted account sees 0, an allowlisted one sees
  all — and email matching is case-insensitive.
- **Separate portal build** (`npm run build:portal` → `dist-portal/`), its own
  Vercel project from the same repo. Not a route in the main app: the public
  bundle is already ~1.2MB, and the two have opposite constraints — the public
  site is tuned for first paint and SEO, the portal for neither. 387kB vs the
  site's 1,229kB, and a portal bug cannot break lead capture.
- **Magic-link sign-in.** No passwords for a small internal team. The
  confirmation reads the same whether or not the address has access, so the form
  cannot be used to enumerate staff.
- **Leads view** — table, search, status and tool filters, and a detail panel
  with the computed report and findings. Counts follow the filters rather than
  quietly reporting the whole table. A lead whose result email failed is flagged
  in the list, since that is the one most likely to have gone cold wondering why.

### Notes

- The allowlist has no insert/update policy anywhere, deliberately: it is what
  grants access to every lead, so it changes with the service-role key only.
- Portal auth uses its own storage key, so a staff session cannot leak into the
  public site's Supabase client.
- `envDir` is pinned to the repo root in `vite.portal.config.js` — it follows
  `root` by default, so the portal would have looked for `.env.local` inside
  `src/portal`, found nothing, and rendered "Not configured".
- The portal has its **own** `public/` dir. Pointing `publicDir` at the site's
  copied `robots.txt`, `sitemap.xml` and `proposal.html` into the portal build —
  so `portal.insurefirst.ae` would have served `Allow: /` and a sitemap of public
  URLs, inviting crawlers onto an internal tool and contradicting its own
  `noindex` tag. It now ships a `Disallow: /` robots.txt and a favicon, nothing
  else.
- `is_portal_staff()` had to be revoked from `PUBLIC`, not just from `anon`.
  Postgres grants EXECUTE on a new function to PUBLIC, and anon inherits it
  through that — so the original revoke did nothing and the function stayed
  callable at `/rest/v1/rpc/is_portal_staff` with the anon key. Caught by the
  Supabase security advisor; anon is now denied outright.

## 2026-08-01 — Zoho SalesIQ live chat

### Added

- **SalesIQ chat widget** (Zoho One, EU datacentre). Loaded from `index.html`,
  which also owns the `ready` callback — it must be assigned before the widget
  script runs, and `src/lib/salesiq.js` loads with the React bundle, far too late
  to win that race. The callback drains a queue of calls made while the widget
  was still loading.
- **`src/lib/salesiq.js`** — wrapper over the widget's JS API. No-ops entirely
  when the widget is absent (ad blockers, local dev), on the same rule as
  `analytics.js`: chat failing must never cost a lead.
- **Visitor identification.** `ToolCapture` hands the lead's name, email, phone,
  score, tool and reference to the widget on submit, so an operator opening the
  chat sees a named lead rather than "Visitor 42".
- **SPA page tracking.** Verified in a browser: SalesIQ fires **no** request on a
  client-side route change, so its idea of the visitor's location freezes on the
  landing page. `trackSalesIQPage` refreshes a `Current page` visitor field from
  the same effect that reports to GA4.

### Notes

- `$zoho.salesiq.reset()` reads like the SPA navigation hook and is not used: it
  clears cookies, ends a connected chat abruptly and makes the person a new
  visitor. On a route change it would hang up on someone mid-conversation.
- `visitor.name()` takes the **object** form `{firstname, lastname}`. The string
  form most published examples show puts the entire name into `lastname` on this
  widget build — confirmed by probing the live API.
- `visitor.cpage()` / `visitor.pagetitle()` exist on the widget but are
  undocumented and returned nothing when probed; not relied on.
- Print stylesheet hides the `zsiq`-prefixed elements, and the bubble is lifted
  66px at ≤1280px to clear the sticky Call/WhatsApp bar.

## 2026-08-01 — Interactive tools, lead email pipeline, analytics

The largest change to date: every page that previously ended in "Book a Free
Review" now carries a tool that gives the visitor something before asking for
anything.

### Added

- **On-page tool system** (`src/components/interactive/`). `useToolEngine` holds
  the scoring rules, `ToolCapture` the shared capture form, `FindingList` the
  reveal-and-gate, `toolStyles` the chrome. Twelve tools across 39 content pages:
  - `gapcheck` — coverage check, one question at a time, Yes / No / **Not sure**
  - `tcor` — Total Cost of Risk calculator (finance managers)
  - `protectiongap` — family shortfall in AED (individuals & families)
  - `triage` — claim dispute urgency verdict (refused claims)
  - `riskregister` — likelihood × severity matrix (risk assessment)
  - `claimstage` — routes fresh loss / in progress / declined / preparing
  - `evidencepack` — incident record, saved to `localStorage`, sent only on request
  - `offercheck` — settlement offer vs claim, excess and average explained
  - `statuslookup` — enquiry status by reference + email
- **Lead email pipeline.** `submit-lead` edge function saves the lead with the
  service-role key, then emails the visitor their result and the team a
  pre-briefed alert with `reply_to` set to the lead. Outcome recorded in
  `leads.email_status`; a lead is never lost to an email failure.
- **`lead-status` edge function** — enquiry lookup requiring reference **and**
  email together. A wrong reference and a mismatched email return identical
  responses, so it cannot be used to discover which references exist.
- **175 items of check content** across all 35 `gapcheck` blocks, each with a
  `gapTitle`, a `consequence` and a severity. Consequences explain the mechanism
  (average clause, claims-made retroactive dates, warranties) rather than quoting
  market statistics we cannot evidence.
- **GA4** (`G-VDYR2B06QG`) with SPA page-view tracking and three funnel events —
  `tool_start`, `tool_complete`, `lead_submit`. Setup steps in
  `docs/google-analytics-setup.md`.
- **Print stylesheet.** Browser Save-as-PDF produces a clean document; chosen over
  server-side PDF generation, which would need an HTML-to-PDF vendor since Deno
  edge functions cannot run headless Chrome.
- **`leads` columns**: `tool_id`, `score`, `report`, `reference`, `email_status`,
  `lead_status`. Every submission issues a human-readable reference (`IF-7K2M9X`).

### Changed

- **CTAs name what the visitor gets, not the meeting we want.** Hero buttons on
  service, solution, industry and audience pages start that page's tool and take
  its wording — "Calculate my cost of risk", "Check where my claim stands".
- **The closing band stops repeating the ask.** `PageCtaBand` reads
  `LeadJourneyContext` and shows a form only while the check is untouched, nudges
  back to it once started, and becomes reassurance after submission. The
  mid-article `cta` block (35 of them) now suppresses itself after submission too.
- **Claims pages named for the visitor's situation.** "Claims Advisory" →
  **Making a Claim**; "Legal Claims Support" → **Claim Refused or Underpaid**.
  Internal vocabulary is preserved on the lead record via `serviceName`, so
  reporting is unchanged. Slugs untouched — no redirects, no lost indexing.
- **Homepage "Common Pain Points" route into tools.** Five situations already
  written in the visitor's own words, previously static text.
- **Blog hand-offs offer the check**, not "Explore this service", wherever the
  linked service has one. Mapping derived from the services' `relatedBlog` field.
- The 19 `estimator` blocks hand off to the check on the same page.

### Fixed

- **Every footer link was `href="#"`** — all sixteen. Now pointed at real pages.
- **Cross-page anchors never scrolled.** `ScrollToTop` skipped scrolling when a
  hash was present, on the reasoning that the browser handles it — true on a full
  page load, false on a client-side route change. `/services#solutions`, already
  used by the main nav, was landing at whatever scroll position the previous page
  had. It now finds the element and scrolls to it.
- **Top-level "Claims Support" pointed at a services-page anchor**, so the most
  prominent claims link in the nav reached neither claims page. It now opens the
  stage router.
- **`LeadGateForm` promised a "Personalised PDF report"** that was never sent.
  Copy corrected, and an email is now actually sent.

### Security

- `public.leads` has **RLS enabled with zero policies** — the anon key can no
  longer insert. Leads arrive only via the edge function. Consequence: the
  `direct-insert` fallback can no longer write, so edge function downtime costs
  leads rather than degrading quietly.
- Honeypot field on every form; bots receive a success response and nothing saves.

---

## 2026-07-31 — Navigation & internal linking

### Added
- **Two-level Insurance Services mega menu.** The nav dropdown now lists every
  insurance line under its category instead of only the four category names.
  Desktop renders a full-width four-column panel (category heading → hub page,
  each line → its own page, plus a "View all insurance services" footer row);
  mobile is a nested accordion with an "All &lt;category&gt;" link at the top of each
  sub-list. Built from `services.js`, so a line added there appears in the nav
  automatically.
- **Consultancy on the homepage.** The two advisory practices had no presence in
  the homepage body — only prose in the hero. Added a two-card strip under the
  Insurance Services grid linking to `/risk-management` and
  `/management-consultancy`.
- Secondary CTA on the Claims Advisory band linking to
  `/solutions/claims-advisory`, alongside the existing conversion CTA.

### Changed
- **Every service and solution on the homepage now links to its own page.**
  - The Insurance Services section (`ProtoServices`) previously rendered plain
    text with no links at all. It now reads from `services.js` — all 19 lines link
    to `/insurance/:slug` and each category heading to its hub.
  - The six Solutions cards (`ProtoProblems`) all pointed at `#contact`; each is
    now a full-card link to `/solutions/:slug`.
- Nav close-on-leave moved from the individual nav item up to the nav container,
  so the full-width mega panel — which cannot live inside its trigger element —
  stays open while the pointer is inside it.

### Fixed
- The homepage Insurance Services list was a hardcoded set of 18 abbreviated
  labels and **omitted Jewelers Block and Trade Credit**. Sourcing from
  `services.js` restores all 19 lines and keeps the labels in sync with the pages.

*Verified by crawling every internal link in the homepage `<main>`: all 41 resolve
to a real page, none silently redirect.*

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
- **Unified navigation** — `ProtoNav` used site-wide, with dropdowns for Who We
  Help, Industries, Solutions, Insurance Services, and Consultancy.
- `public/sitemap.xml` (~60 URLs) and `public/robots.txt`.
- `TODO.md` documenting the Supabase setup steps.

## 2026-06 – 2026-07 — Foundation

### Added
- Initial Ensurio landing page (Vite + React, React Router, Framer Motion,
  lucide-react, inline styles + CSS custom-property design tokens).
- Client content: contacts, credentials (CBUAE License 143), testimonials,
  socials, legal entity name.
