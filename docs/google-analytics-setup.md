# Google Analytics — remaining setup

The GA4 tag (`G-VDYR2B06QG`) is installed and firing. Three things still need
doing **in the GA4 dashboard**, none of which involve code.

> ⚠️ **None of it is retroactive.** GA4 only counts from the moment each setting
> is saved, so do these before spending anything on ads.

---

## 1. Mark `lead_submit` as a key event

This is what tells GA4 (and later Google Ads) that a form submission is the
outcome that matters.

**Admin** (gear icon, bottom-left) → **Data display** → **Key events** →
**New key event**

Enter the event name exactly, then **Save**:

```
lead_submit
```

**Why this route and not the Events list:** the Events list only shows events GA4
has already seen. If nobody has submitted a lead yet, `lead_submit` will not be
there and it looks like something is broken. "New key event" lets you create it
ahead of time, which is what you want.

- Requires **Marketer** access or above at property level.
- Takes a few minutes to a few hours to apply.

---

## 2. Register the custom dimensions

Without this, the site sends `tool_id`, `service` and `score` with every event
and GA4 collects them — but they never appear in any report. This is the
difference between *"we got 40 leads"* and *"the TCOR calculator produced 28 of
them."*

**Admin** → **Data display** → **Custom definitions** → **Create custom
dimension**. Do this three times:

| Dimension name | Scope | Event parameter |
| -------------- | ----- | --------------- |
| Tool           | Event | `tool_id`       |
| Service        | Event | `service`       |
| Score          | Event | `score`         |

---

## 3. Import the conversion into Google Ads

Do this once `lead_submit` has fired a few times.

**Google Ads** → **Goals** → **Conversions** → **Import** →
**Google Analytics 4 properties** → select `lead_submit`

This is the link that makes Ads optimise toward people who actually submit
rather than people who click. Without it you are paying for traffic and guessing.

---

## What the site already sends

| Event | Fires when | Parameters |
| ----- | ---------- | ---------- |
| `page_view` | Every route change (sent manually — gtag only fires once on load in a single-page app) | standard |
| `tool_start` | First genuine interaction with a tool, once per tool | `tool_id` |
| `tool_complete` | A result is reached without giving details | `tool_id`, `score` |
| `lead_submit` | A lead is successfully saved — **the conversion** | `tool_id`, `service`, `source`, `score` |

`tool_start` is the one the database cannot give you. Supabase already knows how
many people **submitted**, broken down by `tool_id`. Without knowing how many
**started**, there is no way to tell a tool nobody wants from a tool everybody
abandons at question three.

---

## Checking it works

**Admin** → **DebugView**, or the **Realtime** report.

1. Load any page, then navigate to another. You should see **two** `page_view`
   events. If the second never appears, single-page-app tracking is broken —
   fix that before anything else, because it means most of the site looks
   untrafficked.
2. Start a check on any service page → `tool_start` appears with a `tool_id`.
3. Submit it → `lead_submit` appears.

Ad blockers suppress all of this. The site is built so that analytics failing
never affects a form submission, but it does mean you should test with blockers
off.

---

## Worth deciding before running ads

The site now runs Google tags on pages that collect names, emails and phone
numbers. If a meaningful share of traffic comes from the EU or UK, consent mode
is an obligation rather than a nicety — and it is much cheaper to add a consent
banner now than to retrofit one around a live campaign.

Check **Reports → Demographics → Country** once a few weeks of data exist.

---

## On the wider Google integration question

GA4, Search Console and Google Ads link to each other **natively in the UI** —
no API work, roughly ten minutes:

- **Ads ↔ GA4** — the conversion import above. Highest value of the three.
- **GSC ↔ GA4** — search queries and landing-page performance inside GA4.
- **GA4 audiences → Ads** — remarket to people who *started* a tool and did not
  submit. That segment only became addressable when `tool_start` was added, and
  it is a far better audience than generic site visitors.

The Data APIs (GA4 Data API, Search Console API, Google Ads API) solve a
different problem: pulling all three into one custom dashboard, or automating
reporting. That is a real project — OAuth service accounts, and the Google Ads
API needs a developer token that goes through an approval process. Worth doing
only once opening three dashboards is genuinely annoying.
