# Features Research

## Core User Flows

### Flow 1: Fan Discovers Creator
1. Fan visits landing page → sees grid of creators with live data
2. Clicks a creator → sees creator page with token stats
3. Clicks "Buy Shares" → prompted to sign in (Google)
4. Privy creates embedded Solana wallet automatically
5. Fan funds wallet (SOL transfer or MoonPay fiat onramp)
6. Fan executes buy → Bags Trade API processes onchain swap
7. Fan sees holdings in portfolio/dashboard

### Flow 2: Champion Launches Token
1. User types any Twitter handle in search
2. System checks Bags State API for existing token
3. If no token: show "Be the first to back [creator]" with launch button
4. Champion pays 0.2 SOL → Token Launch API creates token
5. Champion configures fee share split
6. Champion gets early shares + fee share cut (incentive)
7. Creator page now shows live data

### Flow 3: Fan Sells Shares
1. Fan visits dashboard → sees portfolio with holdings
2. Clicks "Sell" on a position
3. Confirms amount → Bags Trade API executes sell
4. SOL returned to embedded wallet

## Landing Page Requirements
- Creator grid with cards showing:
  - Creator avatar (Twitter profile image)
  - Handle/name
  - Token price (from State API)
  - 24h price change
  - Total backers (holder count)
  - Total creator earnings (fees)
- Search bar for finding/creating creator pages
- Clear CTA: "Back your favorite creator"

## Creator Page Requirements
- Creator info (pulled from Bags API, not our DB)
- Token stats: price, market cap, 24h volume, holder count
- Fee earnings: lifetime fees, recent claims
- Launch status badge (PRE_LAUNCH → PRE_GRAD → MIGRATING → MIGRATED)
- Buy/Sell interface
- Holder list (top backers)

## Dashboard/Portfolio Requirements
- Holdings list with current value and P&L
- Transaction history
- Total portfolio value
- Wallet balance (SOL)
- Fund wallet button (triggers Privy MoonPay flow)

## Permissionless Model
- No creator registration required
- Any Twitter handle can have a page
- Data sourced from Bags API (not internal DB)
- Creator pages are views into Bags ecosystem data
- Reduces cold-start problem — pages exist before creators know about platform

## Pre-seeded Demo Strategy
- 5-10 creators with active Bags tokens pre-selected
- Demo wallets pre-funded with SOL
- Real trades executed for onchain proof
- $BACKERS platform token launched with activity
- Ensures judges see live, populated app
