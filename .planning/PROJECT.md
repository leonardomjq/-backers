# Backers

## What This Is

A platform that lets mainstream fans support creators by buying shares (Bags tokens) with no crypto knowledge required. Sign in with Google, pick a creator, buy shares — every transaction is a real onchain token trade through the Bags API, generating creator fees and partner revenue. Built for the Bags Hackathon.

## Core Value

A non-crypto fan can visit a creator's page, sign in with Google, and buy shares in one flow — with every trade generating real onchain volume and creator earnings through Bags.

## Requirements

### Validated

- ✓ Next.js 15 + Tailwind v4 scaffold — existing
- ✓ Privy auth integration (Google + email, embedded Solana wallets) — existing
- ✓ Supabase client/server setup — existing
- ✓ Bags SDK + Helius RPC connection — existing
- ✓ Creator page route structure (`/creator/[handle]`) — existing
- ✓ Dashboard route structure — existing

### Active

- [ ] Landing page with creator grid showing live token data (price, fees, backers)
- [ ] Creator page displaying live Bags API data (token stats, fee earnings, holder count)
- [ ] "Buy Shares" flow — Google login via Privy → embedded wallet → Bags Trade API execution
- [ ] Sell shares flow through same simple UI
- [ ] Permissionless creator page creation — type a Twitter handle, page created from Bags API data
- [ ] Champion token launch — launch Bags token for creators without one (0.2 SOL, Token Launch API)
- [ ] Privy embedded wallet funding via built-in MoonPay/Coinbase Pay onramp
- [ ] Portfolio view — fan sees their holdings, value, and P&L
- [ ] Creator earnings display — lifetime fees, claim data from Analytics API
- [ ] Partner revenue tracking via Bags Partner API
- [ ] Fee Share configuration on token launch
- [ ] Pre-seeded creator pages (5-10 creators with active Bags tokens) for hackathon demo
- [ ] Real onchain trades executed through partner key for verifiable activity

### Out of Scope

- Creator self-registration / gated onboarding — contradicts permissionless model
- Custom fiat payment integration (Stripe, custom MoonPay) — Privy handles this natively
- Mobile app — web-first
- Notifications system — not needed for hackathon
- Admin dashboard — not needed for hackathon
- Social features (comments, follows) — not the product
- Content creation tools — Backers is about financial backing, not content

## Context

- **Hackathon:** Bags Hackathon, async judging (no stage demo). Judge visits live URL for ~60 seconds.
- **Bags API:** Core dependency — 7 modules (Token Launch, Trade, Analytics, State, Fee Share, Partner, Fee Claiming). Backers is a frontend for the Bags engine.
- **Champion model:** Page creator who launches a token is incentivized to promote it (early shares + fee share cut). Solves cold-start distribution.
- **Existing codebase:** Early scaffold with auth, DB, and SDK wired up. Pages are placeholders.
- **Privy Solana support:** Newer feature — verify that funding flow (MoonPay/Coinbase Pay) works for Solana embedded wallets specifically, not just EVM.
- **Demo strategy:** Pre-seed 5-10 creators with active Bags tokens. Pre-fund demo wallets with SOL. Execute real trades for onchain proof. $BACKERS platform token launched with activity.

## Constraints

- **Timeline**: 1-2 weeks to hackathon submission
- **Fiat onramp**: Depends on Privy's built-in MoonPay/Coinbase Pay supporting Solana wallets — needs verification
- **Token launch cost**: 0.2 SOL per launch — cannot auto-launch for all creators
- **Bags API**: All trading, token data, and revenue flows through Bags — if API is down, app is down
- **Judging format**: Async review of live URL + onchain metrics — app must work standalone without explanation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Permissionless creator pages | Mirrors Bags' native model, no distribution dependency on creators knowing about us | — Pending |
| Privy for auth + wallets | Embedded Solana wallets, built-in fiat onramp, Google login — eliminates crypto friction | — Pending |
| Champion model for token launches | Incentivizes page creator to promote (early shares + fee share), avoids 0.2 SOL cost absorption | — Pending |
| Privy built-in MoonPay (not custom) | ~1 hour config vs 3-5 days custom integration, good enough for hackathon | — Pending |
| Pre-seeded demo data | Judges see live data immediately, not an empty app | — Pending |
| SOL-only trading with fiat onramp option | Core flow uses SOL in embedded wallet, fiat is available but not the primary demo path | — Pending |

---
*Last updated: 2026-03-07 after initialization*
