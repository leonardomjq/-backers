# Phase 1: Foundation -- API Routes & Auth - Research

**Researched:** 2026-03-07
**Domain:** Next.js 15 API Routes, Privy Authentication, Bags SDK Integration, Caching, Error Handling
**Confidence:** HIGH

## Summary

Phase 1 establishes the server-side infrastructure for the Backers app: API route handlers that proxy Bags SDK calls (keeping the API key server-side), Privy-based authentication with Google login and embedded Solana wallet creation, middleware for route protection, error boundaries, and environment variable validation.

The Bags SDK (`@bagsfm/bags-sdk` v latest, currently installed) provides a typed TypeScript interface with services for `state`, `trade`, `tokenLaunch`, `partner`, `fee`, and `config`. The SDK takes an API key and a Solana `Connection` object, and all calls go through `https://public-api-v2.bags.fm/api/v1`. The key operation for Phase 1 is `state.getLaunchWalletV2(username, 'twitter')` which returns token state for a Twitter handle, and `state.getTopTokensByLifetimeFees()` for the creators list.

Privy v2.25.0 is installed with `@privy-io/react-auth`. Server-side token verification requires installing `@privy-io/node` (the current package -- `@privy-io/server-auth` is deprecated). Privy stores an auth token in a `privy-token` cookie that can be verified server-side. The existing `PrivyProvider` config already sets `createOnLogin: 'all-users'` for Solana embedded wallets and configures Google + email login methods.

**Primary recommendation:** Build 4 API route handlers (creators, creator/[handle], trade, launch), add `@privy-io/node` for server-side auth verification, create `middleware.ts` for route protection, add `instrumentation.ts` for env validation, and use a simple in-memory Map-based cache with TTL (no external deps needed for hackathon).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | API routes proxy all Bags API calls server-side with API key | Bags SDK singleton (`getBagsSDK()`) already in `lib/bags.ts`. Create route handlers in `app/api/` that call SDK services. SDK exports `state`, `trade`, `tokenLaunch` services with typed params/responses. |
| INFRA-02 | Token state data cached (30s TTL) to reduce API calls | Use simple in-memory Map cache with TTL in a `lib/cache.ts` utility. Next.js 15 `unstable_cache` is being replaced by `use cache` -- avoid both for hackathon simplicity. |
| INFRA-03 | Error boundaries and loading states on all routes | Next.js App Router `error.tsx` (client component), `loading.tsx`, `not-found.tsx`, and `global-error.tsx` file conventions. Error boundaries catch errors in child segments but NOT in same-segment layouts. |
| INFRA-04 | Environment variable validation at startup | Next.js 15 `instrumentation.ts` with `register()` function is stable. Runs once before server accepts requests. Use Zod (available as transitive dep via Privy) for schema validation. |
| AUTH-01 | User can sign in with Google via Privy | Already configured: `loginMethods: ['google', 'email']` in `lib/privy.ts`. Privy modal handles the flow. Use `useLogin` hook for programmatic triggers. |
| AUTH-02 | Privy creates embedded Solana wallet on first login | Already configured: `embeddedWallets.solana.createOnLogin: 'all-users'` in `lib/privy.ts`. Wallet accessible via `useSolanaWallets()` from `@privy-io/react-auth/solana`. |
| AUTH-03 | User session persists across browser refresh | Privy handles session persistence via `privy-token` cookie and refresh tokens automatically. `usePrivy().authenticated` reflects current state. No extra work needed. |
| AUTH-04 | Auth-gated routes redirect to login | Create `middleware.ts` at project root. Check `privy-token` cookie existence for protected routes. Full token verification in API routes via `@privy-io/node`. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@bagsfm/bags-sdk` | latest (installed) | Bags API client -- state, trade, launch | Only SDK for Bags platform. Server-side only. |
| `@privy-io/react-auth` | 2.25.0 (installed) | Client-side auth, login UI, wallet hooks | Already configured. Provides Google login + embedded Solana wallets. |
| `@privy-io/node` | latest (NEEDS INSTALL) | Server-side token verification | Replaces deprecated `@privy-io/server-auth`. Required for API route auth. |
| `next` | 15.5.12 (installed) | Framework -- API routes, middleware, error boundaries | Already the project framework. |
| `zod` | 3.25.x (transitive via Privy) | Env var validation, request validation | Already in node_modules. Add as direct dependency for clarity. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@solana/web3.js` | ^1 (installed) | Solana types (PublicKey, Connection) | Used by Bags SDK. Already installed. |
| `helius-sdk` | ^1 (installed) | Solana RPC connection | Already configured in `lib/helius.ts`. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| In-memory cache | Redis / Upstash | Overkill for hackathon; in-memory TTL map is sufficient for single-instance deployment |
| In-memory cache | `unstable_cache` / `use cache` | `unstable_cache` is deprecated; `use cache` requires `dynamicIO` experimental flag; too risky for hackathon |
| Zod for env validation | Manual checks | Zod provides typed output, clear error messages, and is already a transitive dep |
| `@privy-io/node` | Manual JWT verification | Privy SDK handles key rotation, claim validation; manual is error-prone |

**Installation:**
```bash
npm install @privy-io/node zod
```

## Architecture Patterns

### Recommended Project Structure (Phase 1 additions)
```
app/
  api/
    creators/
      route.ts              # GET: list curated creators with token data
    creator/
      [handle]/
        route.ts            # GET: token state for a specific creator
    trade/
      buy/
        route.ts            # POST: build buy transaction (Phase 4 uses this)
      sell/
        route.ts            # POST: build sell transaction (Phase 4 uses this)
    launch/
      route.ts              # POST: build launch transaction (Phase 5 uses this)
  error.tsx                 # Root error boundary
  loading.tsx               # Root loading state
  not-found.tsx             # Root 404 page
  global-error.tsx          # Catches layout-level errors
  dashboard/
    error.tsx               # Dashboard error boundary
    loading.tsx             # Dashboard loading state
  creator/
    [handle]/
      error.tsx             # Creator page error boundary
      loading.tsx           # Creator page loading state
lib/
  cache.ts                  # In-memory TTL cache utility
  env.ts                    # Zod env schema + validated env object
  privy-server.ts           # PrivyClient for server-side auth
middleware.ts               # Route protection (cookie check)
instrumentation.ts          # Env validation at startup
```

### Pattern 1: API Route Handler with Bags SDK
**What:** Server-side route handler that proxies Bags API calls
**When to use:** Every API endpoint that needs Bags data
**Example:**
```typescript
// app/api/creator/[handle]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBagsSDK } from '@/lib/bags';
import { cache } from '@/lib/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const cacheKey = `creator:${handle}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const sdk = getBagsSDK();
    const data = await sdk.state.getLaunchWalletV2(handle, 'twitter');
    cache.set(cacheKey, data, 30_000); // 30s TTL
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch creator data' },
      { status: 500 }
    );
  }
}
```

### Pattern 2: In-Memory TTL Cache
**What:** Simple Map-based cache with expiration
**When to use:** All Bags API responses that can tolerate stale data
**Example:**
```typescript
// lib/cache.ts
type CacheEntry<T> = { data: T; expiresAt: number };

const store = new Map<string, CacheEntry<unknown>>();

export const cache = {
  get<T>(key: string): T | null {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.data;
  },
  set<T>(key: string, data: T, ttlMs: number): void {
    store.set(key, { data, expiresAt: Date.now() + ttlMs });
  },
  clear(): void {
    store.clear();
  },
};
```

### Pattern 3: Middleware for Auth-Gated Routes
**What:** Next.js middleware that checks for Privy auth cookie
**When to use:** Protecting `/dashboard` and other auth-required routes
**Example:**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (isProtected) {
    const privyToken = request.cookies.get('privy-token');
    if (!privyToken?.value) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

### Pattern 4: Environment Validation with Instrumentation
**What:** Validate all env vars at startup using Zod + `instrumentation.ts`
**When to use:** Always -- catches misconfig before first request
**Example:**
```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  BAGS_API_KEY: z.string().min(1, 'BAGS_API_KEY is required'),
  NEXT_PUBLIC_PRIVY_APP_ID: z.string().min(1, 'NEXT_PUBLIC_PRIVY_APP_ID is required'),
  PRIVY_APP_SECRET: z.string().min(1, 'PRIVY_APP_SECRET is required'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  HELIUS_API_KEY: z.string().min(1, 'HELIUS_API_KEY is required'),
  NEXT_PUBLIC_HELIUS_RPC_URL: z.string().url('NEXT_PUBLIC_HELIUS_RPC_URL must be a valid URL'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.issues
      .map(issue => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${formatted}`);
  }
  return result.data;
}

// instrumentation.ts
export async function register() {
  const { validateEnv } = await import('@/lib/env');
  validateEnv();
}
```

### Pattern 5: Error Boundary (Client Component)
**What:** `error.tsx` file that catches runtime errors in a route segment
**When to use:** Every route segment that can fail
**Example:**
```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
```

### Pattern 6: Server-Side Auth Verification in API Routes
**What:** Verify Privy access token in API route handlers that require auth
**When to use:** Trade and launch API routes (mutation endpoints)
**Example:**
```typescript
// lib/privy-server.ts
import { PrivyClient } from '@privy-io/node';

let privyClient: PrivyClient | null = null;

export function getPrivyClient(): PrivyClient {
  if (!privyClient) {
    privyClient = new PrivyClient({
      appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
      appSecret: process.env.PRIVY_APP_SECRET!,
    });
  }
  return privyClient;
}

// Usage in API route:
import { cookies } from 'next/headers';

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('privy-token')?.value;
  if (!token) throw new Error('Not authenticated');

  const privy = getPrivyClient();
  const claims = await privy.verifyAuthToken(token);
  return claims; // { userId, appId, ... }
}
```

### Anti-Patterns to Avoid
- **Exposing BAGS_API_KEY to client:** Never use `NEXT_PUBLIC_BAGS_API_KEY`. All Bags SDK calls must go through API routes.
- **Using `unstable_cache`:** Deprecated in Next.js 15. Will be removed. Use simple in-memory cache instead.
- **Global `force-dynamic`:** Currently set on root layout. Remove it; set `export const dynamic = 'force-dynamic'` only on routes that need it (API routes inherently are dynamic).
- **Relying solely on middleware for auth:** Middleware cookie check is a UX convenience (redirect). Always verify the token server-side in API routes for security. (CVE-2025-29927 showed middleware can be bypassed.)
- **Full token verification in middleware:** Middleware runs on the Edge; `@privy-io/node` may not work there. Use cookie existence check only in middleware, full verification in API routes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth token verification | Custom JWT parsing | `@privy-io/node` `verifyAuthToken()` | Handles key rotation, claim validation, token expiry |
| Env validation | Manual `if (!process.env.X)` checks | Zod schema in `instrumentation.ts` | Type-safe, comprehensive error messages, validates format |
| Bags API HTTP calls | Raw `fetch()` to Bags endpoints | `@bagsfm/bags-sdk` services | Typed params/responses, auth header handling, error types |
| Solana wallet creation | Manual keypair generation | Privy `createOnLogin: 'all-users'` | Secure enclave storage, recovery, no key management |
| Route protection redirect | Custom auth check in every page | `middleware.ts` cookie check | Runs before page rendering, single location |

**Key insight:** For a hackathon, every hand-rolled solution is a bug surface. The SDK ecosystem (Bags SDK + Privy + Next.js conventions) handles the hard parts. Focus implementation time on wiring them together, not reimplementing them.

## Common Pitfalls

### Pitfall 1: Bags SDK Singleton in Serverless
**What goes wrong:** The singleton in `lib/bags.ts` works in dev (persistent Node process) but in Vercel serverless, each function invocation may cold-start, re-creating the SDK instance.
**Why it happens:** Serverless functions are ephemeral. Module-level variables persist within a warm instance but reset on cold start.
**How to avoid:** The singleton pattern is actually fine -- it just means the cache resets on cold starts. For the hackathon (single Vercel deployment, low traffic), this is acceptable. The in-memory cache will also reset, but 30s TTL means re-fetching is not expensive.
**Warning signs:** Seeing more Bags API calls than expected in production logs.

### Pitfall 2: Next.js 15 Params are Promises
**What goes wrong:** Route handlers and pages in Next.js 15 receive `params` as a `Promise`, not a plain object. Accessing `params.handle` directly causes a type error or returns a Promise object.
**Why it happens:** Next.js 15 made this change for async layouts. The codebase already handles this correctly in `creator/[handle]/page.tsx` with `await params`.
**How to avoid:** Always `const { handle } = await params;` in route handlers and pages.
**Warning signs:** TypeScript errors about `Promise<{ handle: string }>` vs `{ handle: string }`.

### Pitfall 3: Error Boundary Does Not Catch Layout Errors
**What goes wrong:** An `error.tsx` in `app/` catches errors from `app/page.tsx` but NOT from `app/layout.tsx`. If the Providers component (PrivyProvider) crashes, the error boundary is useless.
**Why it happens:** Error boundaries in React wrap children, not siblings. `error.tsx` sits inside the layout, so it cannot catch layout errors.
**How to avoid:** Add `global-error.tsx` at the app root. This replaces the entire HTML shell and catches layout-level errors. It must define its own `<html>` and `<body>` tags.
**Warning signs:** White screen with no error UI when PrivyProvider fails to initialize.

### Pitfall 4: Privy Cookie Not Available in Middleware on First Load
**What goes wrong:** On the very first visit (no session), there is no `privy-token` cookie. Middleware correctly redirects to login. But after login, the cookie may not be immediately available for a server-side redirect back.
**Why it happens:** Privy sets the cookie client-side after authentication completes. The middleware only sees it on subsequent requests.
**How to avoid:** Redirect logic in middleware should be simple (no cookie = redirect to `/`). After login, use client-side navigation (`router.push('/dashboard')`) rather than relying on server redirect.
**Warning signs:** User logs in but stays on the login page until manual refresh.

### Pitfall 5: `getLaunchWalletV2` Returns Data Even When No Token Exists
**What goes wrong:** Calling `sdk.state.getLaunchWalletV2(handle, 'twitter')` for a handle without a launched token may still return platform data (username, avatar) but with `wallet: null`.
**Why it happens:** The endpoint returns social platform data independently of token launch status.
**How to avoid:** Check the `wallet` field -- if null, the creator has no launched token. This is the signal to show "Launch Token" CTA instead of token stats.
**Warning signs:** Showing empty/zero token stats instead of the launch prompt.

### Pitfall 6: Removing `force-dynamic` Without Setting Route-Level Config
**What goes wrong:** If you remove `export const dynamic = 'force-dynamic'` from `app/layout.tsx` without adding it to routes that need SSR, Next.js 15 defaults to static rendering where possible. Pages that read cookies or use dynamic data will error at build time.
**Why it happens:** Next.js 15 changed caching defaults -- nothing is cached by default for fetches, but static rendering is still attempted for pages without dynamic signals.
**How to avoid:** Remove `force-dynamic` from root layout. API routes are dynamic by default. For pages that use `cookies()` or `headers()`, they automatically become dynamic. Only add `export const dynamic = 'force-dynamic'` explicitly if a page needs it but doesn't call a dynamic API.
**Warning signs:** Build errors saying "Dynamic server usage" in pages that should be static.

## Code Examples

Verified patterns from SDK type definitions and official docs:

### Creators List API Route
```typescript
// app/api/creators/route.ts
import { NextResponse } from 'next/server';
import { getBagsSDK } from '@/lib/bags';
import { cache } from '@/lib/cache';

export async function GET() {
  const cacheKey = 'creators:top';
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const sdk = getBagsSDK();
    // Returns Array<BagsTokenLeaderBoardItem> with token info, creators, prices
    const data = await sdk.state.getTopTokensByLifetimeFees();
    cache.set(cacheKey, data, 30_000);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch creators' },
      { status: 502 }
    );
  }
}
```

### Creator Detail API Route
```typescript
// app/api/creator/[handle]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBagsSDK } from '@/lib/bags';
import { cache } from '@/lib/cache';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const sanitized = handle.replace(/[^a-zA-Z0-9_]/g, '');
  if (!sanitized) {
    return NextResponse.json({ error: 'Invalid handle' }, { status: 400 });
  }

  const cacheKey = `creator:${sanitized}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const sdk = getBagsSDK();
    // Returns BagsGetFeeShareWalletV2State with platformData + wallet (PublicKey | null)
    const data = await sdk.state.getLaunchWalletV2(sanitized, 'twitter');
    cache.set(cacheKey, data, 30_000);
    return NextResponse.json({
      provider: data.provider,
      platformData: data.platformData,
      wallet: data.wallet?.toBase58() ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch creator data' },
      { status: 502 }
    );
  }
}
```

### Global Error Boundary
```typescript
// app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground">
            The app encountered an unexpected error.
          </p>
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
```

### Privy Auth Hooks (Client-Side)
```typescript
// Imports from main package
import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth';
// Imports from Solana subpath
import { useSolanaWallets, useFundWallet } from '@privy-io/react-auth/solana';

// Check auth state
const { authenticated, user, ready } = usePrivy();

// Programmatic login
const { login } = useLogin({
  onComplete: (user) => {
    // User logged in, wallet created automatically
    router.push('/dashboard');
  },
});

// Get Solana wallets
const { wallets } = useSolanaWallets();
const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `unstable_cache` for data caching | `use cache` directive (experimental) | Next.js 15 (Oct 2024) | For hackathon, use neither -- simple in-memory cache is more predictable |
| `@privy-io/server-auth` | `@privy-io/node` | 2025 | Must install the new package, not the deprecated one |
| Params as plain objects in route handlers | Params as `Promise` in Next.js 15 | Next.js 15 (Oct 2024) | Must `await params` in all route handlers and pages |
| `experimental.instrumentationHook` config flag | `instrumentation.ts` is stable | Next.js 15 (Oct 2024) | No config needed, just create the file |
| Fetch requests cached by default | Uncached by default in Next.js 15 | Next.js 15 (Oct 2024) | No need to opt out of caching; must opt in if desired |
| `force-dynamic` on root layout | Per-route dynamic config | Next.js 15 (Oct 2024) | Remove global, set per-route only when needed |

**Deprecated/outdated:**
- `@privy-io/server-auth`: Deprecated. Use `@privy-io/node` instead.
- `unstable_cache`: Being replaced by `use cache`. Avoid both for hackathon.
- Global `force-dynamic` on root layout: Anti-pattern. Remove and set per-route.

## Open Questions

1. **Bags SDK `getTopTokensByLifetimeFees()` response shape for curated list**
   - What we know: Returns `Array<BagsTokenLeaderBoardItem>` with `token`, `lifetimeFees`, `tokenInfo` (JupiterToken | null), `creators`, `tokenSupply`, `tokenLatestPrice`.
   - What's unclear: Whether this returns ALL tokens or just top ones. May need to filter/curate for the landing page.
   - Recommendation: Call it once, inspect the response, then decide if we need a curated list in Supabase or can use the API response directly. For Phase 1, implement the API route and cache the result.

2. **`@privy-io/node` PrivyClient constructor signature**
   - What we know: Takes `appId` and `appSecret`. Can optionally accept a `jwtVerificationKey` for offline verification.
   - What's unclear: The exact constructor API for the current version (docs show object config).
   - Recommendation: Install and check types. The pattern `new PrivyClient({ appId, appSecret })` should work per docs.

3. **Bags SDK error types**
   - What we know: The SDK uses Axios internally. Errors are `ApiError` with `url`, `method`, `status`, `data` fields.
   - What's unclear: Whether all SDK methods throw `ApiError` or if some return error objects.
   - Recommendation: Wrap all SDK calls in try/catch, check for `ApiError` type, and return appropriate HTTP status codes.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (to be installed) |
| Config file | none -- see Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | API routes proxy Bags API calls | integration | `npx vitest run tests/api/creators.test.ts -t "returns creator data"` | No -- Wave 0 |
| INFRA-02 | Cached responses return within 100ms | unit | `npx vitest run tests/lib/cache.test.ts -t "returns cached data within TTL"` | No -- Wave 0 |
| INFRA-03 | Error boundaries render on failure | manual-only | Manual: trigger API error, verify error UI renders | N/A |
| INFRA-04 | Missing env var crashes with clear message | unit | `npx vitest run tests/lib/env.test.ts -t "throws on missing env vars"` | No -- Wave 0 |
| AUTH-01 | Google login via Privy | manual-only | Manual: click Google login, verify redirect + callback | N/A |
| AUTH-02 | Embedded wallet created on login | manual-only | Manual: login, check `useSolanaWallets()` returns wallet | N/A |
| AUTH-03 | Session persists across refresh | manual-only | Manual: login, refresh, verify still authenticated | N/A |
| AUTH-04 | Auth-gated routes redirect | integration | `npx vitest run tests/middleware.test.ts -t "redirects unauthenticated"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- Vitest configuration with path aliases
- [ ] `tests/lib/cache.test.ts` -- TTL cache unit tests
- [ ] `tests/lib/env.test.ts` -- Env validation unit tests
- [ ] `tests/api/creators.test.ts` -- API route integration tests (mocked SDK)
- [ ] `tests/middleware.test.ts` -- Middleware redirect tests
- [ ] Install: `npm install -D vitest @vitejs/plugin-react`

## Sources

### Primary (HIGH confidence)
- `@bagsfm/bags-sdk` installed package -- `dist/client.d.ts`, `dist/services/*.d.ts`, `dist/types/*.d.ts` (full type definitions inspected)
- `@privy-io/react-auth` v2.25.0 installed package -- exports, hooks, subpath imports verified
- `lib/bags.ts`, `lib/privy.ts`, `lib/helius.ts`, `components/providers.tsx` -- existing codebase inspected
- [Next.js 15 Caching Docs](https://nextjs.org/docs/app/guides/caching) -- confirmed `unstable_cache` deprecation path
- [Next.js Error Handling](https://nextjs.org/docs/app/getting-started/error-handling) -- error.tsx, global-error.tsx conventions
- [Next.js Instrumentation](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation) -- stable in Next.js 15

### Secondary (MEDIUM confidence)
- [Privy Server Auth Verification](https://docs.privy.io/guide/server/authorization/verification) -- `verifyAuthToken` API, cookie name `privy-token`
- [Privy Solana Wallet Creation](https://docs.privy.io/guide/react/wallets/embedded/solana/creation) -- `createOnLogin` options
- [Privy Node.js Installation](https://docs.privy.io/basics/nodeJS/installation) -- `@privy-io/node` replaces `@privy-io/server-auth`
- [Privy Getting Started with Solana](https://docs.privy.io/recipes/solana/getting-started-with-privy-and-solana) -- hooks and config

### Tertiary (LOW confidence)
- [@privy-io/server-auth npm](https://www.npmjs.com/package/@privy-io/server-auth) -- confirmed deprecated status via web search
- [CVE-2025-29927 middleware bypass](https://workos.com/blog/nextjs-app-router-authentication-guide-2026) -- don't rely solely on middleware for auth

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages inspected locally, versions confirmed
- Architecture: HIGH -- patterns derived from SDK type definitions and Next.js 15 stable APIs
- Pitfalls: HIGH -- derived from codebase inspection (params as Promise, force-dynamic, error boundary scope) and known Next.js 15 changes
- Bags SDK API: MEDIUM -- types inspected but runtime behavior of `getLaunchWalletV2` and `getTopTokensByLifetimeFees` not tested
- Privy server-side: MEDIUM -- `@privy-io/node` constructor API needs verification after install

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (stable stack, 30-day validity)
