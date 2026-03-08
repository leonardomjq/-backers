# Architecture Research

## Recommended Architecture

### Data Strategy: API-First, DB-Light
- Primary data source: Bags API (token state, analytics, fees)
- Supabase used only for:
  - Caching token data (reduce API calls, improve load times)
  - Storing curated creator list for landing page
  - User preferences (if any)
- No need to replicate Bags data — query on demand, cache briefly

### API Routes Needed
All Bags API calls must go through Next.js API routes (server-side) because:
- API key is server-only (security)
- Can add caching layer
- Can batch/transform responses for frontend

Suggested routes:
```
app/api/
├── creators/
│   └── route.ts          # GET: list curated creators with cached data
├── creator/
│   └── [handle]/
│       └── route.ts      # GET: fetch token data from Bags State API
├── trade/
│   ├── buy/
│   │   └── route.ts      # POST: create buy transaction via Trade API
│   └── sell/
│       └── route.ts      # POST: create sell transaction via Trade API
├── launch/
│   └── route.ts          # POST: create token launch transaction
├── portfolio/
│   └── route.ts          # GET: user holdings from Bags Analytics
└── fund/
    └── route.ts          # POST: initiate wallet funding (if needed)
```

### Transaction Flow
1. Frontend requests transaction from API route
2. API route calls Bags API to build transaction
3. Bags API returns serialized transaction
4. Frontend deserializes and signs with Privy embedded wallet
5. Frontend submits signed transaction to Solana (via Helius RPC)
6. Frontend confirms transaction status

### Caching Strategy
- Creator list: Cache in Supabase, refresh every 5 min
- Token state (price, holders): Cache 30s (stale-while-revalidate)
- Analytics data: Cache 2-5 min
- Use Next.js `unstable_cache` or React `cache()` for request dedup

### Error Handling
- Bags API down: Show cached data with "data may be stale" indicator
- Transaction failure: Clear error message, retry button
- Wallet not funded: Direct to funding flow
- Token not found: Show launch CTA

## Security Considerations
- All Bags API calls server-side only
- Privy handles wallet security (embedded wallets)
- No private keys stored or managed by our app
- Rate limiting on API routes (prevent abuse)
- Input validation on Twitter handles (sanitize)

## Performance Priorities for Hackathon
1. Landing page loads fast with pre-cached creator data
2. Creator page shows data within 1-2 seconds
3. Buy flow completes in single interaction
4. No loading spinners longer than 2 seconds
