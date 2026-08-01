# Internal portal — setup and deploy

The staff portal at **portal.insurefirst.ae**. Separate Vite build, separate
Vercel project, same repo and same Supabase project as the public site.

```
npm run dev:portal      # localhost:5300 (the public site keeps 5200)
npm run build:portal    # → dist-portal/
```

---

## 1. Add yourself to the staff allowlist

Nobody can see a single lead until their address is on this list — including
you. Supabase → **SQL Editor**:

```sql
insert into public.portal_staff (email, full_name, role)
values ('you@insurefirst.ae', 'Your Name', 'admin');
```

Then sign in at the portal and request a link.

> **Why there is no "add staff" button in the portal.** The allowlist is what
> grants access to every lead in the database. A staff account able to edit it
> could grant access to anyone, so it has no insert/update policy at all and is
> changed with the service-role key only — the SQL editor, or a future admin
> edge function that checks `role = 'admin'` server-side.

To remove access, set `active = false` rather than deleting the row, so you keep
a record of who had it.

---

## 2. Deploy to Vercel

A **second Vercel project** pointing at the same GitHub repo:

| Setting | Value |
| --- | --- |
| Build Command | `npm run build:portal` |
| Output Directory | `dist-portal` |
| Install Command | `npm install` |
| Domain | `portal.insurefirst.ae` |

Environment variables — the same two the public site uses:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

The anon key is safe to ship. Row Level Security is what protects the data, and
every policy requires an allowlisted staff JWT.

**No extra `vercel.json` is needed.** Both projects share the repo root, so both
pick up the existing one — and its single rule, `/(.*) → /index.html`, is the
SPA rewrite the portal wants too. It resolves against whichever output directory
that project builds, so the portal gets `dist-portal/index.html`. Leave it alone.

Both projects also watch the same repo, so a push to either rebuilds both. That
is wasteful rather than harmful; if it becomes annoying, set an **Ignored Build
Step** on each project:

```bash
# portal project — skip the build unless something it depends on changed
git diff --quiet HEAD^ HEAD -- src/portal vite.portal.config.js package.json src/styles
```

### Which branch deploys

Production builds come from the project's **Production Branch** (`main` by
default), so the portal goes live once `feat/internal-portal` is merged. Before
that, every push to the branch gets a **preview URL** — which is the right place
to test, but preview URLs change on every deploy. Add a wildcard to Supabase's
redirect list rather than chasing them:

```
https://*.vercel.app/**
```

Remove that wildcard once the custom domain is live; it lets any Vercel-hosted
page receive a magic link for this project.

### Supabase Auth settings

**Authentication → URL Configuration** — add `https://portal.insurefirst.ae` to
**Redirect URLs**, or magic links will bounce off the allowlist of permitted
redirects and fail silently.

The built-in auth mailer is rate-limited to a handful of sends per hour, which a
team of five will hit on a busy morning. **Authentication → Emails → SMTP** —
point it at the same provider the lead emails already use.

---

## 3. What is and isn't protected

Verified against the live database before shipping:

| Caller | `is_portal_staff()` | Leads visible |
| --- | --- | --- |
| anon (no session) | — | **0** |
| signed in, not allowlisted | `false` | **0** |
| signed in, allowlisted | `true` | all |

Email matching is case-insensitive — an address typed `Amira@InsureFirst.ae` at
sign-in still matches a lowercase allowlist row.

**Anyone can create an account.** `signInWithOtp` creates an auth user for an
unknown address by default. That is deliberate: authorisation lives in
`portal_staff`, not in who holds an account, and an account without an allowlist
row reads zero rows from every table. The alternative — creating auth users by
hand — means onboarding takes two steps, and an admin who does only the second
leaves the new advisor requesting links that never arrive.

The sign-in confirmation is worded identically whether or not the address has
access, so the form cannot be used to discover who works here.

---

## 4. Current scope

The leads view is **read-only**. It reads `public.leads` directly — there is no
server layer, because RLS is the server layer.

Not built yet, in the order that makes sense:

1. **Status changes** from the portal (`received → contacted → …`). Needs an
   UPDATE policy on `leads` restricted to `lead_status`, so a staff account
   cannot rewrite a lead's contact details or its report.
2. **Zoho auth edge function** — refresh token in, access token out, cached
   until expiry. The token lives in Supabase secrets and never reaches a browser.
3. **Scheduled Zoho sync** into their own tables. CRM and Books are rate-limited
   per org, so the dashboard must read synced tables rather than querying live —
   hourly is plenty for an internal view.
4. **Client report** built on the synced data.

> Note the endpoints when you get to step 2: this Zoho org is on the **EU**
> datacentre (`accounts.zoho.eu`, `www.zohoapis.eu`). Almost every tutorial shows
> `.com`, which fails authentication against an EU org.
