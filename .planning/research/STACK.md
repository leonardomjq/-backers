# Stack Research

## Bags API

### Base URL & Auth
- Base: `https://public-api-v2.bags.fm/api/v1/`
- Auth: `x-api-key` header with partner API key
- All token operations go through this API

### 7 Modules
1. **Token Launch** — Create and launch tokens (0.2 SOL cost). `CreateTokenInfoParams`, `CreateLaunchTransactionParams`. Status enum: `PRE_LAUNCH`, `PRE_GRAD`, `MIGRATING`, `MIGRATED`.
2. **Trade** — Execute buy/sell trades on launched tokens. Partner key earns fee share on every trade.
3. **Analytics** — Token performance data, volume, price history.
4. **State** — Current token state: price, market cap, holder count, graduation status.
5. **Fee Share** — Configure fee distribution on token launch via `CreateFeeShareConfigParams`.
6. **Partner** — Partner registration, revenue tracking, API key management. Partners earn 25% (2500 bps) of fees from tokens launched via their key.
7. **Fee Claiming** — Claim accumulated fees from Virtual Pool (pre-graduation) and DAMM V2 Pool (post-graduation).

### Fee Types
- **Virtual Pool Fees** — Pre-graduation bonding curve fees
- **DAMM V2 Pool Fees** — Post-graduation AMM fees
- **Custom Fee Vault V1/V2** — Configurable fee vaults

### SDK Integration
- `@bags/sdk` package, singleton pattern in `lib/bags.ts`
- Server-side only (no `NEXT_PUBLIC_` prefix on API key)
- Lazy-initialized via `getBagsClient()` helper

## Privy

### Auth Capabilities
- Google + email login (no crypto knowledge needed)
- Embedded Solana wallets created automatically on signup
- `@privy-io/react-auth` and `@privy-io/react-auth/solana` packages

### Fiat Onramp
- Built-in MoonPay and Coinbase Pay integration
- `useFundWallet` hook from `@privy-io/react-auth/solana`
- Usage: `fundWallet({address, options: {card: {preferredProvider: 'moonpay'}}})`
- Privy handles KYC, compliance, and payment processing
- Solana support confirmed but needs runtime verification

### Config
- Hardcoded to `mainnet-beta` in `lib/privy.ts`
- No devnet toggle — constraint for development

## Supabase
- `@supabase/ssr` for server/client split
- Server client uses cookie-aware pattern for SSR
- Manual type stubs in `types/index.ts` (should use `supabase gen types`)
- No schema or migrations exist yet

## Helius RPC
- Solana RPC provider via `@helius/sdk` or direct connection
- Singleton in `lib/helius.ts`
- Used for onchain state reads, transaction confirmation

## Next.js 15 + Tailwind v4
- App Router with server components by default
- `force-dynamic` on root layout (all pages SSR)
- Tailwind v4 (CSS-first config)
- Path aliases: `@/*` maps to project root
