# Project TODO

## 🔴 Supabase — switch on lead capture (quote/contact forms)

All the site's forms ("Get a Quote", "Book a Review", the contact form, and every
interactive tool's CTA) already funnel into a single `submitLead()` helper
(`src/lib/supabase.js`) that inserts into a Supabase `leads` table. It is **built
but dormant** — until the two env vars below are set, forms fall back to a success
message without storing anything.

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

---

## 🟡 Other pending items

- **Confirm the sitemap domain.** `public/sitemap.xml` and `public/robots.txt` use
  `https://www.insurefirst.ae`. Update if the live site uses a different domain.
- **Images.** Several pages use closest-fit / reused stock images. Swap in
  topic-specific photos (esp. Group Medical, Professional Indemnity, personal lines).
- **Content polish.** Page and blog copy is solid draft quality — a final pass with
  the client's real figures, claims data, and named articles would sharpen it.
- **Migrate legacy forms.** The diagnostic tool's lead form, the contact section, and
  the scroll popup still reference unconfigured EmailJS — point them at `submitLead()`
  so everything flows to the same `leads` table.
