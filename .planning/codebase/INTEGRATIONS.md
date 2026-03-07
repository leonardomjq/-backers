# External Integrations

**Analysis Date:** 2026-03-07

## APIs & External Services

**Blockchain (Solana):**
- Helius - Enhanced Solana RPC provider
  - SDK/Client: `helius-sdk` 1.5.3 and `@solana/web3.js` `Connection`
  - Auth: `HELIUS_API_KEY` (server-side), `NEXT_PUBLIC_HELIUS_RPC_URL` (client + server)
  - Client singleton: `lib/helius.ts` — `getHeliusConnection()` returns a cached `Connection` instance
  - Used by: Bags SDK initialization, Privy wallet configuration

- Bags.fm - Creator token platform SDK
  - SDK/Client: `@bagsfm/bags-sdk` 1.3.1
  - Auth: `BAGS_API_KEY` (server-side only)
  - Client singleton: `lib/bags.ts` — `getBagsSDK()` returns a cached `BagsSDK` instance
  - Depends on: Helius `Connection` (passed to `BagsSDK` constructor)
  - Purpose: Creator token operations (buy/sell/query Bags tokens)

## Data Storage

**Database:**
- Supabase (PostgreSQL)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Service role: `SUPABASE_SERVICE_ROLE_KEY` (for elevated access)
  - Browser client: `lib/supabase/client.ts` — `createClient()` using `@supabase/ssr` `createBrowserClient`
  - Server client: `lib/supabase/server.ts` — `createClient()` using `@supabase/ssr` `createServerClient` with cookie-based auth
  - Type-safe: Both clients typed with `Database` generic from `types/index.ts`
  - Migration: `supabase/migrations/001_initial_schema.sql`

**Database Schema:**
- `public.creators` table:
  - `id` (uuid, PK), `twitter_handle` (text, unique), `token_mint` (text), `display_name` (text), `avatar_url` (text), `bags_data` (jsonb), `created_at`, `updated_at`
  - Auto `updated_at` trigger via `handle_updated_at()` function
  - RLS enabled: public read access policy
  - Index: `idx_creators_twitter_handle`

- `public.campaigns` table:
  - `id` (uuid, PK), `creator_id` (uuid, FK to creators), `champion_wallet` (text), `status` (text, default 'active'), `amount_sol` (numeric), `created_at`
  - RLS enabled: public read access policy
  - Indexes: `idx_campaigns_creator_id`, `idx_campaigns_champion_wallet`

**File Storage:**
- Not explicitly configured; Supabase storage available (remote image pattern `*.supabase.co` configured in `next.config.ts`)

**Caching:**
- None configured; SDK clients use in-memory singleton pattern (module-level variables in `lib/bags.ts`, `lib/helius.ts`)

## Authentication & Identity

**Auth Provider:**
- Privy - Web3 authentication service
  - SDK/Client: `@privy-io/react-auth` 2.25.0
  - Auth: `NEXT_PUBLIC_PRIVY_APP_ID` (client-side), `PRIVY_APP_SECRET` (server-side)
  - Provider wrapper: `components/providers.tsx` — wraps app in `PrivyProvider`
  - Config: `lib/privy.ts` — `privyConfig` object
  - Login methods: Google, Email
  - Embedded wallets: Solana wallets auto-created for all users on login
  - Solana cluster: mainnet-beta via Helius RPC URL (falls back to public RPC)
  - Theme: dark

## Monitoring & Observability

**Error Tracking:**
- None configured

**Logs:**
- No logging framework; standard `console` and `throw new Error()` patterns in `lib/` modules

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from `.vercel` in `.gitignore`, Next.js conventions)

**CI Pipeline:**
- None configured (no `.github/workflows/`, no CI config files detected)

## Environment Configuration

**Required env vars (from `.env.example`):**

| Variable | Scope | Used In |
|----------|-------|---------|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Client | `components/providers.tsx` |
| `PRIVY_APP_SECRET` | Server | Not yet used (available for server-side Privy verification) |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | `lib/supabase/client.ts`, `lib/supabase/server.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | `lib/supabase/client.ts`, `lib/supabase/server.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Not yet used (available for admin-level DB operations) |
| `HELIUS_API_KEY` | Server | Not yet directly used (for Helius REST API calls) |
| `NEXT_PUBLIC_HELIUS_RPC_URL` | Client + Server | `lib/helius.ts`, `lib/privy.ts` |
| `BAGS_API_KEY` | Server | `lib/bags.ts` |

**Secrets location:**
- Local: `.env` file (gitignored)
- Production: Vercel environment variables (assumed)

## Webhooks & Callbacks

**Incoming:**
- None configured (no API routes defined yet)

**Outgoing:**
- None configured

## Integration Architecture

**Client-side integrations:**
- Privy (auth UI, wallet management) — runs in browser via `PrivyProvider`
- Supabase browser client — direct DB queries from client components

**Server-side integrations:**
- Supabase server client — DB queries with cookie-based auth in Server Components/Route Handlers
- Bags SDK — creator token operations (server-only, requires API key)
- Helius Connection — Solana RPC calls (server-only singleton)

**Singleton Pattern:**
All server-side SDK clients use a lazy-initialized module-level singleton pattern:
```typescript
// Pattern used in lib/bags.ts, lib/helius.ts
let instance: Type | null = null;
export function getInstance(): Type {
  if (!instance) {
    instance = new Type(/* config */);
  }
  return instance;
}
```

---

*Integration audit: 2026-03-07*
