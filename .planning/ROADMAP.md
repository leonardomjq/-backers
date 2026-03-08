# Roadmap: Backers

**Created:** 2026-03-07
**Milestone:** v1 — Hackathon Submission

## Phase 1: Foundation — API Routes & Auth
**Goal:** Server-side Bags API proxy, Privy auth flow, error handling infrastructure
**Requirements:** INFRA-01, INFRA-02, INFRA-03, INFRA-04, AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Plans:** 3/3 plans complete

Plans:
- [x] 01-01-PLAN.md — Test infra, env validation (Zod), in-memory TTL cache
- [x] 01-02-PLAN.md — API routes (creators, creator detail, stubs), middleware, Privy server auth
- [x] 01-03-PLAN.md — Error boundaries, loading states, not-found page, auth verification

### Scope
- Create API routes for Bags API proxy (creators list, creator detail, trade, launch)
- Add caching layer (Next.js cache or in-memory with TTL)
- Validate env vars at startup
- Wire up Privy auth (Google login, embedded wallet creation)
- Add middleware for auth-gated routes
- Add error.tsx and loading.tsx files
- Remove global `force-dynamic`, set per-route

### UAT
- [ ] API route `/api/creators` returns creator data from Bags API
- [ ] API route `/api/creator/[handle]` returns token state
- [ ] Cached responses return within 100ms on repeat calls
- [ ] Google login creates embedded Solana wallet
- [ ] Unauthenticated user redirected from /dashboard
- [ ] App shows error boundary on API failure (not white screen)
- [ ] Missing env var crashes at startup with clear message

---

## Phase 2: Landing Page
**Goal:** Creator grid with live data, search, compelling first impression
**Requirements:** LAND-01, LAND-02, LAND-03, LAND-04, LAND-05
**Plans:** 2 plans

Plans:
- [ ] 02-01-PLAN.md — Data layer (lib/creators.ts) + UI components (Hero, CreatorCard, GridSkeleton, SearchBar)
- [ ] 02-02-PLAN.md — Page assembly (CreatorGrid + page.tsx wiring) + visual verification

### Scope
- Creator grid component with cards (avatar, name, price, backers)
- Fetch creator data from `/api/creators` route
- Search bar that navigates to `/creator/[handle]`
- Hero section with value prop
- Responsive layout (mobile + desktop)
- Pre-seed curated creator list in Supabase or config

### UAT
- [ ] Landing page shows 5+ creators with real token data
- [ ] Each card shows avatar, handle, price, backer count
- [ ] Search bar accepts Twitter handle and navigates to creator page
- [ ] Value prop visible without scrolling on desktop and mobile
- [ ] Page loads in under 2 seconds

---

## Phase 3: Creator Page
**Goal:** Dynamic creator profile with live Bags data and trade entry points
**Requirements:** CREA-01, CREA-02, CREA-03, CREA-04, CREA-05, CREA-06

### Scope
- Creator page fetches data from `/api/creator/[handle]`
- Display token stats (price, market cap, volume, holders)
- Display fee earnings
- Launch status badge component
- Buy/Sell buttons (UI only — trade logic in Phase 4)
- Handle "no token found" state with launch CTA
- Twitter avatar via `pbs.twimg.com` image domain

### UAT
- [ ] `/creator/elonmusk` shows live token data (if token exists)
- [ ] Token stats update on page refresh
- [ ] Fee earnings section displays data
- [ ] Status badge shows correct graduation state
- [ ] Non-existent token shows "launch" prompt instead of error
- [ ] Page works for any handle typed in URL

---

## Phase 4: Buy & Sell Flow
**Goal:** End-to-end trading through Bags Trade API with Privy wallet signing
**Requirements:** TRAD-01, TRAD-02, TRAD-03, TRAD-04, TRAD-05, WALL-01, WALL-02, WALL-03

### Scope
- Buy modal/sheet: amount input, price preview, confirmation
- Sell modal/sheet: same pattern
- API route builds transaction via Bags Trade API
- Client deserializes, signs with Privy embedded wallet, submits to Solana
- Transaction status feedback (pending, success, failure)
- Wallet balance display
- Fund wallet button (Privy MoonPay integration)
- Insufficient balance detection with funding prompt
- Partner key included in all trades

### UAT
- [ ] User can buy tokens — transaction confirmed onchain
- [ ] User can sell tokens — SOL returned to wallet
- [ ] Price impact and fees shown before confirmation
- [ ] Success message with transaction link after trade
- [ ] Failure shows clear error message with retry option
- [ ] Wallet balance visible on creator page
- [ ] Fund wallet opens MoonPay/Coinbase Pay flow
- [ ] Insufficient balance shows funding prompt before trade

---

## Phase 5: Token Launch (Champion Model)
**Goal:** Anyone can launch a Bags token for a creator without one
**Requirements:** LAUN-01, LAUN-02, LAUN-03, LAUN-04

### Scope
- Launch flow on creator page when no token exists
- Cost display (0.2 SOL) with confirmation
- Fee share configuration UI
- API route calls Bags Token Launch API
- Transaction signing via Privy wallet
- Post-launch redirect to live creator page
- Champion incentive explanation

### UAT
- [ ] User sees "Launch token" on creator page with no existing token
- [ ] 0.2 SOL cost clearly shown before confirmation
- [ ] Fee share config presented during launch
- [ ] Token launch transaction succeeds onchain
- [ ] Creator page shows live data immediately after launch

---

## Phase 6: Portfolio Dashboard
**Goal:** Fan sees their holdings, value, and P&L
**Requirements:** PORT-01, PORT-02, PORT-03, PORT-04

### Scope
- Holdings list from Bags Analytics API
- Current value calculation (holdings x current price)
- P&L display (current value vs purchase cost)
- Total portfolio value
- Wallet balance display
- Link to each creator page from holding

### UAT
- [ ] Dashboard shows all tokens user holds
- [ ] Each holding shows quantity, current value, P&L
- [ ] Total portfolio value is sum of all holdings
- [ ] Wallet SOL balance displayed
- [ ] Clicking a holding navigates to creator page

---

## Phase 7: Demo Polish & Submission
**Goal:** Pre-seed data, execute real trades, polish for async judging
**Requirements:** DEMO-01, DEMO-02, DEMO-03

### Scope
- Select and configure 5-10 creators with active Bags tokens
- Pre-fund demo wallets with SOL
- Execute real trades for onchain proof
- Polish landing page (loading states, transitions, copy)
- Test entire flow end-to-end as a judge would experience it
- Fix any remaining rough edges
- Deploy to production URL

### UAT
- [ ] Landing page populated with 5+ real creators
- [ ] At least 3 trades verifiable onchain
- [ ] Complete flow works: land -> click creator -> sign in -> buy shares
- [ ] No error states visible during normal flow
- [ ] App loads and is interactive within 2 seconds
- [ ] Works on mobile browser

---

**Total phases:** 7
**Total v1 requirements:** 35
**All requirements mapped.**

---
*Roadmap created: 2026-03-07*
*Last updated: 2026-03-08 after Phase 2 planning*
