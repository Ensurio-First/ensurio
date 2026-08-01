# Project TODO

## ✅ Supabase — lead capture is LIVE

All the site's forms ("Get a Quote", "Book a Review", the contact form, and every
interactive tool's CTA) funnel into a single `submitLead()` helper
(`src/lib/supabase.js`) that inserts into the Supabase `leads` table.

**Status: done & verified in production** — the `leads` table + anon INSERT policy
are created, a live insert returns HTTP 201, and the env vars are set both locally
(`.env.local`) and on Vercel (baked into the insurefirst.ae build). Submissions land
in **Supabase → Table Editor → `leads`**. The public can insert leads but cannot read
them (insert-only RLS policy, no SELECT policy).

---

## ✅ Interactive checks — live on all 39 content pages

Every `gapcheck` block is now an on-page diagnostic instead of a checklist that
handed off to `/contact`: one question at a time, Yes / No / Not sure, a score
the visitor earns before giving any details, then the capture form inside the
result panel.

- Engine: `src/components/interactive/` (`useToolEngine` = rules, `CoverageCheck` = UI)
- Journey state: `src/context/LeadJourneyContext.jsx` — `idle | started | submitted`
- Closing band: `src/components/PageCtaBand.jsx` replaces four hand-rolled CTA
  sections and stops asking for the same thing three times per page. It shows a
  form only while the check is untouched, nudges back to the check once started,
  and becomes reassurance after submission.
- Hero CTAs on the service/solution/industry/audience templates now start the
  check rather than routing to `/contact`. Pages with no check keep the old CTA.
- The 19 `estimator` blocks hand off into the check on the same page.

**Content: all 35 checks enriched — 175 items** carrying `{ statement, gapTitle,
consequence, severity }`. Consequences explain the mechanism (average clause,
claims-made retroactive dates, warranties) rather than quoting market statistics
we cannot evidence. Severity drives both the score weighting and the ranking of
findings.

Submissions carry `tool_id`, `score`, the ranked findings, and every raw answer
into Supabase, so an advisor opens a pre-briefed lead.

### Still open on this workstream

- **Bespoke tools (Phase 2).** The 6 solution and 4 audience pages currently use
  the generic check. They were scoped for purpose-built tools — a TCOR calculator
  for finance managers, a dispute triage for legal claims support, a risk register
  builder for risk assessment. The generic check is a solid interim.
- **Home page triage, blog teasers, PDF reports** (Phase 4).

---

## ✅ Lead email pipeline — LIVE (verified 1 Aug 2026)

Every submission now goes through the **`submit-lead` Edge Function** instead of
inserting straight from the browser. The function:

1. saves the lead (service-role, so the public INSERT policy can be dropped),
2. emails **the visitor** a copy of their result,
3. emails **the team** an alert with the full answer set and `reply_to` set to
   the lead, and
4. records the outcome in `leads.email_status`.

A lead is never lost to an email failure — the row is written first. If the
function itself is unreachable, `submitLead()` falls back to the old direct
insert and tags the row `email_status = 'direct-insert'` so those can be found
and followed up.

Also new: a honeypot field (bots get a success response, nothing is saved), and
`leads.reference` — a short human-readable code (`IF-7K2M9X`) shown on screen
and in the email so a caller can quote it.

**Verified working:** valid payload → 200 + row + reference; honeypot → 200 +
nothing saved; invalid payload → 400.

Sending is via **Resend**, from a verified domain. Configuration lives in
Supabase → Edge Functions → Secrets (never in `.env` — these are server-side):

| Secret | Required | Default if unset |
|---|---|---|
| `RESEND_API_KEY` | ✅ | — (no email sent, `email_status = 'skipped'`) |
| `LEAD_FROM_EMAIL` | ✅ | `Insure First <noreply@insurefirst.ae>` — **must be on the Resend-verified domain or every send is rejected** |
| `LEAD_NOTIFY_EMAIL` | | `consult@insurefirst.ae` — **comma-separated list**, e.g. `webservices@insurefirst.ae,consult@insurefirst.ae` |
| `SITE_URL` | | `https://www.insurefirst.ae` |
| `LEAD_PHONE_DISPLAY` / `LEAD_PHONE_E164` | | `050 976 5976` / `+971509765976` |

### Diagnosing a failed send

The function returns `status` and `reasons` in its HTTP response and records the
outcome in `leads.email_status`:

| `email_status` | Meaning |
|---|---|
| `sent` | both emails accepted |
| `lead-only` | visitor got theirs; a notify address failed |
| `team-only` | team got theirs; the visitor's failed — usually `LEAD_FROM_EMAIL` is not on the verified domain |
| `failed` | Resend rejected both — usually a bad or missing key |
| `skipped` | `RESEND_API_KEY` not visible to the function |
| `direct-insert` | the edge function was unreachable; lead saved but no email |

Two traps that cost real time during setup, both now guarded against:

1. **The secret NAME is the variable name.** A key saved as `Insurefirst_key`
   is invisible to `Deno.env.get('RESEND_API_KEY')`. Vault secrets (Database →
   Vault) are a different store entirely and Edge Functions cannot read them.
2. **Verifying a domain in Resend does not change what the site sends *from*.**
   `LEAD_FROM_EMAIL` has to be updated separately, or Resend keeps treating the
   send as a sandbox test and will only deliver to the account owner.

### Table security — hardened 1 Aug 2026

`public.leads` now has **RLS enabled with zero policies**, so the anon key cannot
insert. Leads arrive only via the edge function, which uses the service-role key
and bypasses RLS. Verify with:

```sql
select relrowsecurity,
       (select count(*) from pg_policies
         where schemaname='public' and tablename='leads') as policies
from pg_class where relname = 'leads';   -- expect: true, 0
```

Consequence: the `direct-insert` fallback in `submitLead()` can no longer write.
If the edge function is unreachable the form shows an error rather than quietly
saving the lead — deliberate, but it means **function downtime costs leads**.
Restore a fallback by re-adding an anon INSERT policy if that trade ever looks wrong.

### Still open

- Consider a Resend webhook for bounces and complaints.

### Not done yet

- **PDF reports.** The tools now say "we'll email you a copy" (an HTML email),
  which is accurate. A real PDF attachment is Phase 4.
- **Nurture sequence.** Needs a scheduled function, unsubscribe link, and a
  suppression list — do not bolt this onto the transactional path.

---

Optional further hardening if bot spam appears: rate-limiting or CAPTCHA on the
contact form (the honeypot covers the naive bots).

<details><summary>Original setup steps (for reference)</summary>

Do these three steps once and lead capture goes live across the **whole site**.

### 1. Create the `leads` table
In your Supabase project → **SQL Editor** → run:

```sql
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text,
  phone text,
  message text,
  service text,   -- which service/quote the lead came from
  source text,    -- 'quote' | 'contact' | ...
  page text       -- the page the form was submitted from
);

-- Enable Row Level Security and allow anonymous INSERTs only (no public read).
alter table public.leads enable row level security;

create policy "website can insert leads"
  on public.leads for insert
  to anon
  with check (true);
```

> The website can only **insert** leads, never read them — they are viewed from the
> Supabase dashboard (or with the service-role key). The anon key is safe to expose
> in the frontend; RLS protects the data.

### 2. Get your API keys
Supabase → **Project Settings → API** → copy:
- **Project URL** — `https://<project-ref>.supabase.co`
- **anon public** key

### 3. Add the env vars (both places)
**Local** — create `.env.local` in the project root (git-ignored; see `.env.example`):

```
VITE_SUPABASE_URL=https://<your-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```

**Vercel** — Project → **Settings → Environment Variables** → add the same two →
redeploy.

### Done
Submissions now land in the `leads` table (view / filter / export in the Supabase
dashboard). Verify by submitting the contact form once.

**Optional (later):** to capture an interactive tool's inputs alongside a lead
(e.g. "estimated for 12 vehicles"), add a `details jsonb` column and pass a
`details` object into `submitLead()` — one table, one function, flexible payload.

</details>

---

## 🟡 Other pending items

- **Confirm the sitemap domain.** `public/sitemap.xml` and `public/robots.txt` use
  `https://www.insurefirst.ae`. Update if the live site uses a different domain.
- **Images.** Several pages use closest-fit / reused stock images. Swap in
  topic-specific photos (esp. Group Medical, Professional Indemnity, personal lines).
- **Content polish.** Page and blog copy is solid draft quality — a final pass with
  the client's real figures, claims data, and named articles would sharpen it.
- ~~**Migrate legacy forms.**~~ Done — no EmailJS references remain anywhere in
  `src/`. Every form on the site routes through `submitLead()`.
