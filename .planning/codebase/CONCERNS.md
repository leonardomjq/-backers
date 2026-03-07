# Concerns

## Scaffold State

This is an early scaffold — most pages are placeholders. The concerns below are about the foundation, not missing features.

## Security

| Concern | Severity | Location | Notes |
|---------|----------|----------|-------|
| Non-null assertions on env vars | Medium | `components/providers.tsx:9`, `lib/supabase/client.ts:5`, `lib/supabase/server.ts:8` | `process.env.NEXT_PUBLIC_*!` will crash at runtime if vars missing. Consider validation at startup. |
| No middleware for route protection | Medium | Missing `middleware.ts` | Dashboard and creator pages are publicly accessible. No auth guards. |
| `BAGS_API_KEY` exposed risk | Low | `lib/bags.ts` | Server-only (no `NEXT_PUBLIC_` prefix) — safe, but no validation that it's only called server-side. |
| Stub Database types | Low | `types/index.ts:22` | Manual type stubs instead of `supabase gen types` — will drift from actual schema. |

## Technical Debt

| Item | Impact | Location |
|------|--------|----------|
| `force-dynamic` on root layout | All pages SSR'd even if they could be static (landing page) | `app/layout.tsx:5` |
| No error boundaries | Unhandled errors crash entire app | Missing `error.tsx` files |
| No loading states | No `loading.tsx` files for suspense boundaries | Missing in `app/` |
| No `not-found.tsx` | Default 404 page | Missing in `app/` |

## Performance

| Concern | Impact | Notes |
|---------|--------|-------|
| `force-dynamic` everywhere | Prevents ISR/SSG optimization | Should be per-route, not global |
| No caching strategy | Every page re-renders server-side | Consider `unstable_cache` or React cache for Bags SDK calls |
| Singleton SDK on server | Connection persists across requests in dev but may not in production (serverless) | May need connection pooling strategy |

## Missing Infrastructure

- No API routes (`app/api/`)
- No middleware (`middleware.ts`)
- No database migrations or schema
- No error tracking (Sentry, etc.)
- No analytics
- No CI/CD pipeline
- No test setup

## Fragile Areas

- **Supabase types** (`types/index.ts`) — Manual stubs will break when schema changes. Should use `supabase gen types typescript`.
- **Privy config** (`lib/privy.ts`) — Hardcoded to `mainnet-beta`. No devnet/testnet toggle for development.
- **Image domains** (`next.config.ts`) — Only `pbs.twimg.com` and `*.supabase.co`. Will need updates as more image sources are added.
