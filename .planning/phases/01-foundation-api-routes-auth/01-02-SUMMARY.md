---
phase: 01-foundation-api-routes-auth
plan: 02
subsystem: api
tags: [next-api-routes, bags-sdk, privy, middleware, caching, solana]

# Dependency graph
requires:
  - phase: 01-foundation-api-routes-auth
    provides: "lib/cache.ts TTL cache utility, lib/env.ts validation, vitest config"
provides:
  - "GET /api/creators — proxied Bags leaderboard with 30s cache"
  - "GET /api/creator/[handle] — proxied Bags creator lookup with handle sanitization and 30s cache"
  - "POST /api/trade/buy, /api/trade/sell — 501 stubs for Phase 4"
  - "POST /api/launch — 501 stub for Phase 5"
  - "lib/privy-server.ts — PrivyClient singleton with verifyAuth()"
  - "middleware.ts — privy-token cookie check for /dashboard protection"
affects: [02-landing-page, 03-creator-page, 04-trading, 05-token-launch, 06-portfolio]

# Tech tracking
tech-stack:
  added: ["@privy-io/node"]
  patterns: ["API route handler with Bags SDK proxy", "cookie-based middleware route protection", "PublicKey to base58 serialization"]

key-files:
  created:
    - "app/api/creators/route.ts"
    - "app/api/creator/[handle]/route.ts"
    - "app/api/trade/buy/route.ts"
    - "app/api/trade/sell/route.ts"
    - "app/api/launch/route.ts"
    - "lib/privy-server.ts"
    - "middleware.ts"
    - "tests/api/creators.test.ts"
    - "tests/api/creator-handle.test.ts"
    - "tests/middleware.test.ts"
  modified:
    - "app/layout.tsx"

key-decisions:
  - "PrivyClient uses utils().auth().verifyAccessToken() not deprecated verifyAuthToken()"
  - "Middleware does cookie-existence check only, no full token verification (Edge runtime limitation)"
  - "Creator detail serializes wallet PublicKey to base58 string for JSON transport"

patterns-established:
  - "API route pattern: cache check -> SDK call -> cache set -> JSON response -> 502 on error"
  - "Handle sanitization: strip non-alphanumeric/underscore, return 400 if empty"
  - "Middleware pattern: cookie check for protected routes, redirect to / if missing"

requirements-completed: [INFRA-01, AUTH-04]

# Metrics
duration: 4min
completed: 2026-03-08
---

# Phase 1 Plan 02: API Routes & Auth Summary

**5 API route handlers (2 functional with Bags SDK proxy and 30s caching, 3 stubs), Privy server-side auth singleton, and middleware route protection for /dashboard**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-08T02:04:06Z
- **Completed:** 2026-03-08T02:08:11Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- GET /api/creators proxies `getTopTokensByLifetimeFees()` with 30s in-memory cache
- GET /api/creator/[handle] proxies `getLaunchWalletV2()` with handle sanitization, wallet base58 serialization, and 30s cache
- Trade buy/sell and launch API stubs return 501 for future phase implementation
- Middleware protects /dashboard (and sub-paths) by checking `privy-token` cookie existence
- Server-side Privy auth module provides `getPrivyClient()` singleton and `verifyAuth()` for API route protection
- Removed global `force-dynamic` from root layout -- pages with dynamic APIs auto-detect
- All 25 tests passing (16 new + 9 from Plan 01), TypeScript clean

## Task Commits

Each task was committed atomically:

1. **Task 1: API route handlers (RED)** - `7783355` (test)
2. **Task 1: API route handlers (GREEN)** - `5a6dcd4` (feat)
3. **Task 2: Middleware & Privy auth (RED)** - `5846d11` (test)
4. **Task 2: Middleware & Privy auth (GREEN)** - `65843cc` (feat)

_TDD tasks each have two commits (test -> feat)_

## Files Created/Modified
- `app/api/creators/route.ts` - GET handler for creators list with 30s cache
- `app/api/creator/[handle]/route.ts` - GET handler for single creator with handle sanitization and wallet serialization
- `app/api/trade/buy/route.ts` - POST stub returning 501 (Phase 4)
- `app/api/trade/sell/route.ts` - POST stub returning 501 (Phase 4)
- `app/api/launch/route.ts` - POST stub returning 501 (Phase 5)
- `lib/privy-server.ts` - PrivyClient singleton with verifyAuth() using privy-token cookie
- `middleware.ts` - Route protection for /dashboard via cookie check
- `app/layout.tsx` - Removed `export const dynamic = "force-dynamic"` line
- `tests/api/creators.test.ts` - 4 tests for creators route (success, cache, error)
- `tests/api/creator-handle.test.ts` - 7 tests for creator detail route (success, validation, cache, error, wallet)
- `tests/middleware.test.ts` - 5 tests for middleware (redirect, passthrough, sub-paths)

## Decisions Made
- Used `utils().auth().verifyAccessToken()` instead of deprecated `verifyAuthToken()` on PrivyClient -- the new API is the recommended approach for `@privy-io/node`
- Middleware performs cookie-existence check only (no full token verification) due to Edge runtime limitations and CVE-2025-29927 guidance
- Creator detail endpoint serializes Solana `PublicKey` to base58 string (or null) for JSON transport safety

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected PrivyClient API usage**
- **Found during:** Task 2 (Privy server auth)
- **Issue:** Plan suggested `getPrivyClient().verifyAuthToken(token)` but actual `@privy-io/node` API uses `client.utils().auth().verifyAccessToken(token)` and the deprecated `verifyAuthToken` has a different signature
- **Fix:** Used the correct non-deprecated API path `utils().auth().verifyAccessToken()`
- **Files modified:** `lib/privy-server.ts`
- **Verification:** TypeScript type check passes, types align with `@privy-io/node` v0.10.1
- **Committed in:** `65843cc`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Corrected API call to match actual library types. No scope creep.

## Issues Encountered
None -- all tests passed on first run after implementation.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All API routes ready for client-side consumption in Phases 2-5
- Middleware protects /dashboard, ready for authenticated features
- Trade/launch stubs ready to be implemented when those phases execute
- Full test suite (25 tests) provides regression safety

## Self-Check: PASSED

All 11 created/modified files verified present. All 4 commit hashes verified in git log.

---
*Phase: 01-foundation-api-routes-auth*
*Completed: 2026-03-08*
