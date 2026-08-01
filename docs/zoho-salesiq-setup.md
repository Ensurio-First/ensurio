# Zoho SalesIQ — remaining setup

The chat widget is installed and loading (brand `insurefirstconsultancy`, EU
datacentre). Everything below happens **in the SalesIQ console**, not in code.

> ⚠️ **An unstaffed chat widget converts worse than no widget.** A visitor who
> opens a chat and gets silence is worse off than one who was never invited to.
> Do §1 before this goes live, or turn the widget off until you can.

---

## 1. Set operating hours and the offline form

**Settings → Brands → Insure First → Business Hours**

Outside those hours the widget should collect a message rather than imply someone
is there. **Settings → Brands → … → Chat Window → Offline** — turn the offline
form on and point it at the same inbox the advisor alerts already go to.

While you are there, decide who is actually on rota. SalesIQ will ring every
operator marked Available; nobody marked Available means chats queue unanswered.

---

## 2. Decide where chats land — SalesIQ or Supabase

This is the one that matters and it is not a code decision.

Right now every lead the site captures goes to Supabase via the `submit-lead`
edge function, which issues the `IF-…` reference and sends both emails. SalesIQ
chats do **not** pass through that — they live in SalesIQ, and can sync natively
into Zoho CRM (both are in your Zoho One plan).

So a chat lead and a form lead currently end up in different systems, with only
the form leads getting a reference number. Pick one:

- **Supabase stays the system of record.** Leave the CRM sync off and have
  operators copy qualified chats into the enquiry flow. Simple, manual, and the
  reference numbering stays consistent.
- **Zoho CRM becomes the system of record.** Turn on the SalesIQ → CRM sync and
  add a second write from `submit-lead` into CRM. More work, one inbox.

Doing neither is the bad outcome: leads in two places, nobody sure which is real.

---

## 3. Position the bubble

**Settings → Brands → … → Personalization → Position**

The site already lifts the bubble 66px on screens ≤1280px so it clears the sticky
Call / WhatsApp bar on the contact page (`src/prototype/prototype.css`). If you
move the widget to the bottom-**left** in the console, delete that override —
otherwise it will float oddly on the left.

---

## 4. WhatsApp in the same inbox

The contact page already links to WhatsApp, so you are running two channels with
separate inboxes. Zoho One includes the SalesIQ WhatsApp Business channel —
**Settings → Channels → WhatsApp** — which puts both in one operator view.

---

## 5. Privacy

Two things to check with whoever owns the privacy policy:

- The tool capture form says *"We never share your data with third parties."*
  On submit the site now passes the visitor's name, email and phone to Zoho so
  the operator sees who they are talking to. Zoho is a processor rather than a
  third party you are sharing with, but the sentence is absolute as written and
  the privacy policy should name Zoho alongside Supabase.
- SalesIQ sets cookies and does IP-based geolocation on every visitor, before any
  chat starts. If a consent banner is ever added, the widget script in
  `index.html` needs to load behind it.

---

## What the code does

| Where | What |
| --- | --- |
| `index.html` | Loads the widget; owns the `ready` callback and the pre-ready queue |
| `src/lib/salesiq.js` | `identifyVisitor()` and `trackSalesIQPage()`; no-ops when the widget is absent |
| `src/App.jsx` | Reports the route to SalesIQ alongside GA4 |
| `src/components/interactive/ToolCapture.jsx` | Identifies the visitor on a successful submit |
| `src/styles/print.css` | Hides the bubble when printing a report |
| `src/prototype/prototype.css` | Lifts the bubble clear of the sticky mobile bar |

**Why the page is tracked manually:** this is a single-page app, and SalesIQ was
observed sending no request at all on a client-side route change — its idea of
where the visitor is would otherwise stay frozen on whichever page they landed
on. The current path goes in as a `Current page` visitor field, refreshed on
every navigation, so the operator sees the real page when they open the chat.
