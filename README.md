# Backers

**Support creators you believe in. Earn when they grow.**

Backers lets fans support creators with a credit card and earn when they grow — no wallets, no seed phrases, no crypto knowledge. Sign in with Google, pick a creator, buy shares. Every transaction flows through the Bags API as a real token trade, generating onchain volume, creator fees, and partner revenue. Backers opens the Bags ecosystem to mainstream audiences who will never download a crypto wallet.

## How It Works

1. A creator gets a Backers page — anyone can create one, same as Bags' permissionless model
2. Fans visit the page and sign in with Google — Privy creates an embedded Solana wallet invisibly
3. Fans buy shares with a credit card — fiat converts to SOL, SOL trades for the creator's Bags token, all in one flow
4. The creator earns 1% on every trade forever — Bags' native fee mechanic, no extra setup
5. Fans hold, sell, or buy more through a simple UI that never mentions blockchain or wallets

Every share purchase is a real Bags token trade. Every transaction generates onchain volume, creator fees, and partner revenue.

## Why It Works

The model is already proven. A veteran developer earned nearly $300K in creator fees on Bags from a token his community launched without his knowledge. Bags has reached over $1B in monthly trading volume at peak. The infrastructure delivers real money to real creators.

Backers takes that same infrastructure and makes it accessible to the $200B+ creator economy — fans who want to support creators with financial upside, not just donations.

## Why This Is Different

**From Patreon:** Patreon is a donation. You give $5/month and get nothing back financially. Backers gives fans financial upside — if the creator grows, early supporters benefit.

**From friend.tech:** friend.tech had creator earnings tied to key trading that dried up quickly once speculation faded, and required ETH with no path for non-crypto users. Backers runs on Bags' 1% perpetual fee mechanic and uses Privy to eliminate crypto friction entirely.

## Revenue Model

Partner fees on every transaction executed through the platform. One revenue stream, fully onchain, fully verifiable.

## Bags API Integration

**Core dependency — Backers cannot function without the Bags API.**

| Module | Usage |
|--------|-------|
| Token Launch | Creating tokens for new creator pages |
| Trade | Every share purchase and sale |
| Analytics | Creator earnings, lifetime fees, claim data |
| State | Token discovery, pool data, pricing |
| Fee Share | Configuring creator fee splits |
| Partner | Platform revenue tracking |
| Fee Claiming | Creator earnings management |

7 API modules used. Bags is not a feature of Backers — it's the engine.

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | Next.js + Vercel |
| Auth & Wallets | Privy embedded wallets |
| RPC | Helius |
| Database | Supabase |
| Core Infrastructure | Bags API + SDK |

Three hackathon partner tools: Bags, Privy, and Helius.

## Builder

**Leonardo MJQ** — IT Project Lead with international frontend development background in React and TypeScript. Experience shipping AI-assisted products and open source tools. Building in public.

- X: [@leonardomjq](https://x.com/leonardomjq)
- Email: leonardomjq@gmail.com

## Category

Social Finance · Bags API

## Status

In development.

---

*Built for the [Bags Hackathon](https://bags.fm/hackathon)*
