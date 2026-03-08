# Pitfalls Research

## SocialFi Platform Risks

### Cold Start Problem
- Empty platforms look dead — judges will bounce in seconds
- **Mitigation:** Pre-seed 5-10 creators with active tokens, execute real trades before submission
- Never show empty states as default — always have data ready

### Bonding Curve / Price Volatility
- Token prices can swing wildly, especially pre-graduation
- Small liquidity = large price impact on trades
- **Mitigation:** Display clear price impact warnings before trades, show slippage estimates

### Fiat Onramp Friction
- MoonPay/Coinbase Pay KYC can take minutes to hours
- Not all countries supported
- Minimum purchase amounts may be too high for casual users
- **Mitigation:** Demo with pre-funded wallets. Fiat is "nice to have" for hackathon, not the critical path. Show the button exists but demo with SOL.

### Privy Solana Embedded Wallet Risks
- Privy's Solana support is newer than EVM
- `useFundWallet` for Solana needs runtime verification
- Wallet export/recovery UX may confuse non-crypto users
- **Mitigation:** Test funding flow early. Have fallback plan (manual SOL transfer) if MoonPay doesn't work for Solana.

## Hackathon-Specific Pitfalls

### Async Judging (60-Second Window)
- Judge visits URL cold — no explanation, no demo walkthrough
- If landing page is slow, confusing, or empty → immediate bounce
- **Mitigation:**
  - Landing page must load in <2s with real data
  - Value prop clear in first viewport (no scrolling)
  - Pre-populated creator grid (not empty state)
  - Clear CTA that works without signup

### Onchain Proof Requirements
- Judges may verify onchain activity
- Fake/test data on devnet won't impress
- **Mitigation:** All demo trades on mainnet with real SOL. Small amounts ($1-5 per trade). Document onchain tx hashes.

### Over-Engineering
- Building too many features = nothing polished
- **Mitigation:** Focus on one perfect flow: land → pick creator → buy shares. Polish this to perfection. Everything else is secondary.

## Technical Pitfalls

### Bags API Dependency
- If Bags API goes down during judging, app is completely broken
- Rate limits on API calls unknown — could hit limits with traffic
- **Mitigation:** Cache aggressively. Show cached data with staleness indicator rather than errors. Test rate limits early.

### Token Launch Failures
- 0.2 SOL cost means testing is expensive
- Launch can fail if wallet has insufficient SOL
- Fee share config is set at launch — can't change later
- **Mitigation:** Launch demo tokens once, don't test repeatedly. Have backup tokens ready.

### Transaction Signing UX
- Privy embedded wallet signing should be seamless but may show popups
- Transaction simulation failures can block trades
- **Mitigation:** Test full buy/sell flow end-to-end before submission. Understand exactly what the user sees at each step.

### `force-dynamic` Performance Hit
- Current scaffold forces SSR on every page including landing
- Landing page with pre-seeded data could be ISR/SSG
- **Mitigation:** Remove `force-dynamic` from root layout, set per-route as needed.

## What Competitors Get Wrong
- Requiring creator signup (limits supply of pages)
- Complex onboarding flows (more than 2 clicks to first action)
- Showing crypto jargon to mainstream users (wallet addresses, gas fees, slippage)
- Empty states on first visit
- No mobile responsiveness
