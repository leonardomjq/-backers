# Research Summary

## Key Findings

### 1. Bags API is the Entire Backend
Backers doesn't need a traditional backend. The Bags API provides token launch, trading, analytics, state, fee share, partner revenue, and fee claiming — all 7 modules. Our app is a frontend skin on the Bags engine. Supabase is only needed for caching and curating the creator list.

### 2. Transaction Flow is Multi-Step
Buy/sell isn't a single API call. It's: request transaction from Bags API → deserialize → sign with Privy wallet → submit to Solana → confirm. The API route builds the transaction server-side, but signing happens client-side via Privy's embedded wallet. This flow needs careful UX to feel like "one click."

### 3. Privy Solana Funding Needs Verification
Privy's `useFundWallet` hook with MoonPay/Coinbase Pay is confirmed for Solana, but it's newer than EVM support. Runtime testing is required. Fallback: manual SOL transfer instructions. For hackathon demo, pre-funded wallets bypass this entirely.

### 4. Permissionless Model is the Differentiator
No creator signup. Any Twitter handle → page exists. This mirrors Bags' native model and solves cold-start distribution. The champion model (anyone launches a token for 0.2 SOL, gets early shares + fee share) incentivizes page creation organically.

### 5. Async Judging Demands Instant Impact
Judge visits URL for ~60 seconds. Landing page must: load fast (<2s), show real data (pre-seeded creators), communicate value prop in first viewport, and let the judge click through a buy flow without friction. Empty states = instant rejection.

## Architecture Decision

**API-first, DB-light.** All data flows through Next.js API routes → Bags API. Supabase caches results and stores curated creator list. No data replication, no sync jobs. Cache aggressively (30s token state, 5min analytics) to survive API hiccups.

## Critical Path

1. API routes that proxy Bags API calls (server-side, with caching)
2. Landing page with pre-seeded creator grid (real data)
3. Creator page with live token stats
4. Buy flow: sign in → fund wallet → execute trade (one smooth UX)
5. Pre-seed demo data before submission

## Top Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Bags API downtime during judging | App completely broken | Aggressive caching, stale data fallback |
| Privy Solana funding not working | Can't demo fiat onramp | Pre-fund wallets, show button exists |
| Over-engineering | Nothing polished | Focus on one flow: land → creator → buy |
| Empty states | Judge bounces | Pre-seed 5-10 creators with real trades |
| Token launch cost (0.2 SOL each) | Expensive testing | Launch demo tokens once, reuse |

## What to Build First
Focus on the "happy path" that a judge will experience:
1. Landing page with creator grid (static feel, dynamic data)
2. Creator page with buy button
3. Buy flow (Google login → wallet → trade)
4. Everything else is polish
