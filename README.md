# Safari Boda

Guided boda boda tours from Kimana toward Amboseli — booking site, rider dashboard, and admin panel in one codebase.

This README covers the frontend scaffold as it stands right now: what's built, what's a placeholder, and how to run it. For business context see the Foundations Report; for the "why this stack" reasoning see the Tech Stack Report.

## Status: early scaffold, not yet functional end-to-end

What works: the design, the routing, the page structure, and the public booking flow end-to-end (details → simulated M-Pesa payment → confirmation with a generated booking reference).
What doesn't yet: real data. There is no Supabase project connected. Every page that needs data either shows mock content or a "will appear here once wired in" placeholder. The M-Pesa step is simulated (a timed delay, no real Daraja call) — see "What's next" below.

## Two versions in this repo

| Folder | Purpose |
|---|---|
| `safari-boda/` | The real codebase. Talks to a Supabase project — currently placeholder credentials in `js/supabase-client.js`. This is what gets built on going forward. |
| `safari-boda-preview/` | A visual-only copy with mock package data instead of a real backend, so the design can be viewed immediately with zero setup. Not meant to be developed further — once Supabase is connected, work happens in `safari-boda/` and this folder can be deleted. |

## Running it

**Preview (see the design right now):**
Unzip `safari-boda-preview/`, open `index.html` directly in a browser. No server, no setup. Works via `file://` — this was a deliberate constraint since development happens in Termux on Android.

**Real build:**
Same — open `index.html` directly. It'll currently fail to load packages since the Supabase URL/key in `js/supabase-client.js` are placeholders. Once a Supabase project exists, replace those two constants and it starts working.

## Why no build step, no framework

Originally planned as Next.js/TypeScript. Switched to plain HTML/CSS/JavaScript because Next.js's compiler (SWC) has no prebuilt binary for Android ARM64 — it 404s when trying to compile inside Termux. Vanilla JS has no compiler at all, so the blocker doesn't exist. Full reasoning is in the Tech Stack Report.

Practically, this means:
- No `npm install`, no build/watch process. Edit a file, refresh the browser.
- No `import`/`export` — `file://` blocks ES module loading over CORS. Every file attaches to one shared global object (`SafariBoda`) instead. **Script load order in `index.html` is the dependency graph** — a file can only use something from a file that loaded before it.
- No JSX, no TypeScript. HTML is built with plain template strings.

## File structure

```
safari-boda/
├── index.html                      Single entry point. Loads every CSS/JS file
│                                    in dependency order. All routing happens
│                                    inside the one <div id="app">.
├── css/
│   ├── base.css                    Design tokens (colors, type, spacing) as
│   │                                CSS custom properties, plus resets.
│   ├── components.css              Shared UI: buttons, cards, forms, badges,
│   │                                the .horizon signature element, .glass panels.
│   └── views/
│       ├── public.css              Hero, navbar, package cards, trust section.
│       ├── rider.css               Rider dashboard shell (minimal so far).
│       └── admin.css               Admin panel shell — KPI card grid.
│
├── js/
│   ├── supabase-client.js          Creates `window.SafariBoda` (the shared
│   │                                namespace every other file attaches to)
│   │                                and the Supabase client. Must load first.
│   ├── auth.js                     Sign in/out, session restore, role lookup.
│   │                                Keeps SafariBoda.state.role in sync.
│   ├── router.js                   Hash-based router (#/packages, #/admin, …)
│   │                                with role guards. UX-level only — see
│   │                                "Security model" below.
│   ├── app.js                      Boot sequence: init auth, then resolve
│   │                                the first route. Loads last.
│   │
│   ├── utils/
│   │   ├── format.js               KES formatting, date/time formatting.
│   │   └── currency.js             Live FX conversion (Frankfurter API) with
│   │                                6-hour localStorage caching.
│   │
│   ├── components/
│   │   ├── navbar.js                Re-renders on every route change so nav
│   │   │                             links match the current role.
│   │   ├── package-card.js          One package card, with async-loaded
│   │   │                             converted price.
│   │   └── booking-form.js          The 3 steps of the booking flow (details
│   │                                 → M-Pesa prompt → confirmation).
│   │
│   └── views/
│       ├── public/
│       │   ├── home.js              Hero + package preview + trust section.
│       │   ├── packages.js          Full package browser.
│       │   └── booking.js           Owns the booking flow's step state.
│       ├── rider/
│       │   ├── dashboard.js         STUB
│       │   └── bookings.js          STUB
│       └── admin/
│           ├── dashboard.js         STUB — KPI cards, no real numbers yet.
│           ├── riders.js            STUB
│           ├── bookings.js          STUB
│           └── packages.js          STUB
│
└── assets/images/                  Empty — no image assets yet.
```

"STUB" means the file renders a real page with a placeholder message, rather than crashing — but has no live data or interactivity.

## How routing works

Hash-based (`#/packages`, `#/rider`, `#/admin/riders`), not path-based — this works on static hosting (GitHub Pages) or `file://` with zero server configuration, unlike path-based routing which needs server rewrite rules.

`router.js` holds a list of routes, each with a URL pattern, a handler function, and an optional `guard` ('rider' or 'admin'). On every hash change, the router finds the matching route, checks the guard against the current role, and either renders the view or shows a "you don't have access" / "not found" screen.

This guard is **client-side convenience only** — it stops the UI from showing an admin page to a tourist, but it isn't what actually protects the data. See below.

## Security model: two separate layers

1. **Router guards (this codebase)** — control what renders. Someone could theoretically bypass this by editing JavaScript in devtools; it doesn't matter, because:
2. **Supabase row-level security (database-level, not yet configured)** — the real boundary. Once the schema exists, a rider's query for "my bookings" will be restricted by the database itself to rows where `rider_id` matches their own auth ID — regardless of what the frontend does or doesn't show. This is the actual trust boundary and is covered in the Tech Stack Report.

## The design system

Full reasoning was worked through before any code was written — see the design plan discussed in-conversation. Summary:

- **Colors** are sourced from the actual place (Kimana → Amboseli road), not a generic "Kenya palette": savanna-cream background, murram-orange as the one bold accent (the literal color of the road tourists ride on), forest-deep for rider/admin working surfaces, sage-bush and acacia-gold used sparingly. Revised for stronger contrast: card surfaces (`--surface-white`) are deliberately brighter than the page background so they lift off it, text uses a near-black (`--acacia-shadow`) rather than a mid-tone, and murram-orange was pushed more saturated so it reads as a confident accent rather than a muted terracotta.
- **Signature element**: `.horizon` in `components.css` — a CSS-only Kilimanjaro silhouette + road line, sitting behind glass panels. This is what makes the glassmorphism mean something specific to this brand, rather than being a generic frosted-card effect.
- **Type**: Space Grotesk (display), Inter (body), JetBrains Mono (prices, timestamps, booking references).
- **Packages** display as a horizontal snap-scroll carousel (`.grid-packages`, one card at a time with a peek of the next, dot indicators below) rather than a static grid — the mobile-first pattern for browsing 3 tiers on a phone.

## Current pricing (locked)

| Package | Price | Shape |
|---|---|---|
| Basic | KES 3,000 | Half-day (~4 hrs) |
| Standard | KES 6,000 | Full-day (~8 hrs) — marked "Most booked" |
| Premium | KES 9,000 | Full-day, private/personalized pacing |

Mock data reflecting this pricing lives in `safari-boda-preview/js/mock-data.js`. Once Supabase exists, this becomes real rows in a `packages` table.

## What's next

In order, per the Tech Stack Report's planned build sequence:

1. Set up a Safaricom Daraja sandbox account (credential setup, not code — unblocks payment testing early).
2. Design the Supabase schema (`profiles`, `riders`, `packages`, `bookings`, `payments`) with row-level security policies.
3. Replace the placeholder Supabase credentials in `js/supabase-client.js` with real ones.
4. Build out the admin panel for real (rider creation, package management) — needed first since nothing else has real data without it.
5. Wire the booking flow to real Supabase writes + a Supabase Edge Function for the M-Pesa STK push and webhook.
6. Build out the rider dashboard.

## A note on `safari-boda-preview/`

This folder exists purely so the design could be reviewed without setting up a backend first. It's a snapshot with `js/supabase-client.js` stubbed to return an empty session, and `js/mock-data.js` standing in for real package rows. It will drift out of date as `safari-boda/` evolves — treat it as disposable, not as a second copy to maintain.
