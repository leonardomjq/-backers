# Architecture

## Pattern

**Next.js App Router** — Server-first architecture with React Server Components. Single-page app shell with file-based routing.

## Layers

| Layer | Location | Purpose |
|-------|----------|---------|
| Pages (UI) | `app/` | Route-level components, server components by default |
| Components | `components/` | Shared client components (e.g., Providers) |
| Libraries | `lib/` | Service clients, SDK wrappers, config |
| Types | `types/` | Shared TypeScript interfaces and DB types |

## Data Flow

```
User → Next.js App Router → Page Components
                                ↓
                          lib/ service layer
                         ↙     ↓        ↘
                   Privy    Supabase    Bags SDK
                  (Auth)     (DB)      (Solana/Tokens)
                                         ↓
                                    Helius RPC
                                    (Solana node)
```

## Entry Points

- `app/layout.tsx` — Root layout, wraps all pages in `<Providers>` (PrivyProvider)
- `app/page.tsx` — Landing page with CTA to dashboard
- `app/dashboard/page.tsx` — Dashboard (placeholder)
- `app/creator/[handle]/page.tsx` — Dynamic creator profile page (placeholder)

## Abstractions

- **Providers pattern** (`components/providers.tsx`) — Client component wrapping PrivyProvider around all children
- **Singleton SDK clients** (`lib/bags.ts`, `lib/helius.ts`) — Lazy-initialized singletons for Bags SDK and Helius connection
- **Supabase SSR pattern** (`lib/supabase/`) — Separate browser (`client.ts`) and server (`server.ts`) Supabase clients using `@supabase/ssr`

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| `force-dynamic` on root layout | Ensures SSR for all pages (no static generation) — needed for auth/cookie handling |
| Privy for auth (not Supabase Auth) | Privy provides embedded Solana wallets out of the box |
| Separate Supabase client/server | SSR best practice — server client accesses cookies for auth, browser client does not |
| Singleton pattern for SDK/connection | Avoid re-instantiating on every request |
