# Phase 3: Creator Page - Research

**Researched:** 2026-03-08
**Domain:** Next.js dynamic pages, Bags SDK state/fee APIs, component composition
**Confidence:** HIGH

## Summary

Phase 3 replaces the existing placeholder creator page with a full profile page displaying live token data from the Bags SDK. The core challenge is data assembly: the existing `/api/creator/[handle]` route only fetches `platformData` (avatar, username) and `wallet` via `getLaunchWalletV2`. It does NOT currently return token stats (price, market cap, volume, holders) or fee earnings. The API route must be expanded to also search for the creator's token in the leaderboard data (matching by `creators[].twitterUsername`) and return the full `BagsTokenLeaderBoardItem` data alongside the platform profile.

The existing codebase provides strong foundations: the `CreatorCard` component establishes avatar/styling patterns, `GridSkeleton` demonstrates the skeleton pulse pattern, `lib/bags.ts` has the SDK singleton with null-safe fallback, and `lib/cache.ts` provides in-memory TTL caching. The page should be a Server Component that fetches data directly, with client interactivity only for the Buy/Sell/Launch buttons (toast on click).

**Primary recommendation:** Expand the `/api/creator/[handle]` API route to return both profile data and token data (stats + fees) in a single response, then build the creator page as a Server Component that consumes this enriched endpoint. Detect the "no token" state from the API response (wallet is null or no matching token in leaderboard) and conditionally render the launch CTA.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Hero banner + content below structure
- Clean centered layout -- avatar centered, name + handle below, status badge beneath
- Max-width container (~max-w-2xl) for content, consistent with landing page centered aesthetic
- Back arrow/link at top-left to return to landing page
- Horizontal stat row: Price, Market Cap, Volume, Holders -- label above, value below
- Collapses to 2x2 grid on mobile
- Stat values use teal accent color (#14b8a6), labels in muted-foreground
- Skeleton pulse loading state while data fetches (consistent with existing GridSkeleton pattern)
- Separate section below token stats row for Fee Earnings with lifetime value
- Same page layout for no-token state (hero with avatar + handle preserved)
- Stats section replaced with launch prompt: "No token yet. Be the first to back @handle!"
- Launch Token button in primary purple (#6d28d9)
- Launch button shows "Coming soon" toast on click (Phase 5 wires it up)
- Cost hint visible: "(0.2 SOL)"
- Buy/Sell buttons below stats and fee earnings
- Buy/Sell show "Coming soon" toast on click (Phase 4 wires up actual trade logic)

### Claude's Discretion
- Exact avatar size on creator page (larger than CreatorCard's 80px)
- Status badge component design and graduation state labels
- Exact spacing, typography, and section dividers
- Error state handling for API failures
- Mobile responsive breakpoints for stat row collapse

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CREA-01 | Creator page displays token stats from Bags State API (price, market cap, holders) | `BagsTokenLeaderBoardItem.tokenInfo` provides `usdPrice`, `mcap`, `holderCount`; `tokenLatestPrice` provides `volumeUSD`. Expand API route to search leaderboard by handle. |
| CREA-02 | Creator page shows fee earnings data (lifetime fees) | `BagsTokenLeaderBoardItem.lifetimeFees` (string) available on leaderboard items. Also `state.getTokenLifetimeFees(tokenMint)` as standalone call. |
| CREA-03 | Launch status badge shows token graduation state | `TokenLaunchStatus` enum: `PRE_LAUNCH`, `PRE_GRAD`, `MIGRATING`, `MIGRATED`. Available via `tokenInfo.graduatedPool`/`graduatedAt` or bonding curve status on `JupiterToken`. |
| CREA-04 | "Buy Shares" button initiates purchase flow | UI-only in Phase 3. Button renders, shows "Coming soon" toast. Phase 4 wires trade logic. |
| CREA-05 | "Sell Shares" button visible when user holds tokens | UI-only in Phase 3. Both Buy and Sell always visible (no holdings check until Phase 4). Show "Coming soon" toast. |
| CREA-06 | Creator page works for any Twitter handle (permissionless) | `getLaunchWalletV2(handle, "twitter")` works for any handle. Returns `platformData` even if no token exists. No-token state handled gracefully. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^15 | App Router, Server Components, dynamic routes | Already in project, `app/creator/[handle]/page.tsx` exists |
| @bagsfm/bags-sdk | latest | Token state, fees, leaderboard data | Sole data source, already integrated via `lib/bags.ts` |
| Tailwind CSS | ^4 | Styling with semantic color tokens | Already configured with dark mode, purple primary, teal accent |
| React | ^19 | UI rendering | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/image | (built-in) | Twitter avatar rendering | `unoptimized` prop for external `pbs.twimg.com` images |
| next/link | (built-in) | Back navigation to landing page | Back arrow link |
| next/navigation | (built-in) | Client-side routing (useRouter for toast pattern) | Only if needed for toast |

### No New Dependencies
This phase requires NO new npm packages. All needed capabilities exist in the current stack. The "Coming soon" toast can be implemented as a simple browser `alert()` or a minimal custom toast component using existing Tailwind classes -- no toast library needed for a hackathon.

## Architecture Patterns

### Recommended Project Structure
```
app/
  creator/
    [handle]/
      page.tsx          # Server Component - data fetch + render (REPLACE existing placeholder)
      loading.tsx        # Already exists - skeleton loading state (UPDATE for new layout)
      error.tsx          # Already exists - error boundary (keep as-is)
app/
  api/
    creator/
      [handle]/
        route.ts         # Expand to return enriched data (profile + token stats + fees)
components/
  creator-profile.tsx    # Hero section: avatar, name, handle, status badge
  token-stats.tsx        # Horizontal stat row (Price, Market Cap, Volume, Holders)
  fee-earnings.tsx       # Fee earnings section
  status-badge.tsx       # Graduation status badge component
  trade-buttons.tsx      # Buy/Sell buttons ("use client" for toast interaction)
  launch-prompt.tsx      # No-token state with launch CTA ("use client" for toast)
lib/
  creators.ts            # Add CreatorPageData type and data extraction helpers
```

### Pattern 1: Enriched API Route
**What:** Expand the existing `/api/creator/[handle]/route.ts` to return all data the creator page needs in a single request.
**When to use:** Always -- the creator page makes one fetch to get everything.
**Example:**
```typescript
// Source: Bags SDK types (node_modules/@bagsfm/bags-sdk/dist/types/api.d.ts)
// The API route should:
// 1. Call getLaunchWalletV2(handle, "twitter") for profile + wallet
// 2. Call getTopTokensByLifetimeFees() and find matching token by creators[].twitterUsername
// 3. Return combined response

export interface CreatorPageResponse {
  // From getLaunchWalletV2
  profile: {
    provider: string;
    platformData: {
      id: string;
      username: string;
      display_name: string;
      avatar_url: string;
    };
    wallet: string | null;  // base58 or null
  };
  // From leaderboard search (null if no token)
  token: {
    mint: string;
    price: number | null;          // tokenLatestPrice.priceUSD
    marketCap: number | null;      // tokenInfo.mcap
    volume: number | null;         // tokenLatestPrice.volumeUSD
    holders: number | null;        // tokenInfo.holderCount
    lifetimeFees: string;          // lifetimeFees
    graduated: boolean;            // !!tokenInfo.graduatedPool
    graduatedAt: string | null;    // tokenInfo.graduatedAt
    status: string;                // derived from graduated/bondingCurve
    name: string;
    symbol: string;
    icon: string | null;
  } | null;
}
```

### Pattern 2: Server Component with Client Islands
**What:** The page.tsx is a Server Component that fetches data and passes it to presentation components. Only interactive components (buttons) are client components.
**When to use:** Default pattern for this project (established in Phase 2).
**Example:**
```typescript
// app/creator/[handle]/page.tsx (Server Component)
export default async function CreatorPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/creator/${handle}`, {
    cache: 'no-store',  // Always fresh data
  });
  // OR: call the data function directly (server-side, no fetch needed)
  const data = await getCreatorPageData(handle);

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8">
      <CreatorProfile profile={data.profile} token={data.token} />
      {data.token ? (
        <>
          <TokenStats token={data.token} />
          <FeeEarnings lifetimeFees={data.token.lifetimeFees} />
          <TradeButtons handle={handle} />
        </>
      ) : (
        <LaunchPrompt handle={handle} />
      )}
    </main>
  );
}
```

### Pattern 3: Direct Server-Side Data Fetch (Preferred)
**What:** Instead of fetching from the API route, call SDK functions directly in the Server Component or a shared lib function. This avoids the self-fetch anti-pattern in Next.js.
**When to use:** Preferred approach. The API route can also use the same lib function for external consumers.
**Example:**
```typescript
// lib/creators.ts - add a new function
export async function getCreatorPageData(handle: string): Promise<CreatorPageResponse> {
  const sanitized = sanitizeHandle(handle);
  const cacheKey = `creator-page:${sanitized}`;
  const cached = cache.get<CreatorPageResponse>(cacheKey);
  if (cached) return cached;

  const sdk = getBagsSDK();
  if (!sdk) return getMockCreatorPageData(sanitized);

  // Parallel fetches for speed
  const [walletData, leaderboard] = await Promise.all([
    sdk.state.getLaunchWalletV2(sanitized, "twitter"),
    sdk.state.getTopTokensByLifetimeFees(),
  ]);

  // Find token by matching twitter username in creators array
  const tokenItem = leaderboard.find(item =>
    item.creators?.some(c =>
      c.twitterUsername?.toLowerCase() === sanitized.toLowerCase()
    )
  );

  const result = { profile: serializeProfile(walletData), token: tokenItem ? extractTokenData(tokenItem) : null };
  cache.set(cacheKey, result, 30_000);
  return result;
}
```

### Pattern 4: Graduation Status Derivation
**What:** Derive the token graduation status from `JupiterToken` fields rather than a separate API call.
**When to use:** For the status badge component.
**Example:**
```typescript
// Source: Bags SDK types - TokenLaunchStatus enum + JupiterToken fields
// TokenLaunchStatus: PRE_LAUNCH | PRE_GRAD | MIGRATING | MIGRATED
// JupiterToken has: graduatedPool?: string, graduatedAt?: string, bondingCurve?: number

function deriveTokenStatus(tokenInfo: JupiterToken | null): string {
  if (!tokenInfo) return 'unknown';
  if (tokenInfo.graduatedPool) return 'graduated';  // MIGRATED
  if (tokenInfo.bondingCurve !== undefined) return 'bonding-curve';  // PRE_GRAD
  return 'pre-launch';  // PRE_LAUNCH
}
```

### Anti-Patterns to Avoid
- **Self-fetch from Server Component:** Do NOT call your own `/api/creator/[handle]` route from the page.tsx Server Component. Next.js Server Components can call SDK functions directly. The API route exists for client-side fetches.
- **Fetching leaderboard on every request:** The leaderboard call (`getTopTokensByLifetimeFees`) returns all top tokens. Cache it aggressively (30s) since it's the same data for all creator pages.
- **Mixing client/server state:** Keep data fetching in Server Components. Only use `"use client"` for interactive elements (buttons with toast).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Number formatting | Custom format functions | `Intl.NumberFormat` | Handles currency, compact notation, locale-aware |
| Loading skeleton | Complex skeleton library | Tailwind `animate-pulse` + placeholder divs | Already established pattern in `GridSkeleton` |
| Toast notifications | Full toast system | Simple `alert()` or minimal inline state toast | Hackathon -- buttons will be replaced in Phase 4/5 anyway |
| Token data types | New type system | Extend existing `CreatorCardData` and SDK types | Types already defined in SDK |
| Image handling | Custom image loader | `next/image` with `unoptimized` prop | Already established for Twitter avatars |

**Key insight:** This phase is primarily about data assembly and presentation. All the hard work (SDK integration, caching, auth) was done in Phases 1-2. Phase 3 is "plumbing" -- connecting existing data sources to new UI components.

## Common Pitfalls

### Pitfall 1: getLaunchWalletV2 Throws for Unknown Handles
**What goes wrong:** If the handle has never been seen by Bags, `getLaunchWalletV2` may throw an `ApiError` rather than returning null.
**Why it happens:** The SDK wraps the API call and throws on failure: `throw new Error('Failed to get launch wallet for ${provider} user ${username}')`. The Bags API returns `{ success: false, error: "..." }` which the BagsApiClient converts to an `ApiError`.
**How to avoid:** Wrap the call in try/catch. Distinguish between "user exists but no token" (wallet is null) and "user not found" (API error). For "not found", still render the page with handle text and launch CTA.
**Warning signs:** 502 errors for unknown handles.

### Pitfall 2: Leaderboard May Not Contain the Requested Creator
**What goes wrong:** `getTopTokensByLifetimeFees()` only returns top tokens by fees. A creator with a token that has very low fees may not appear in this list.
**Why it happens:** It's a leaderboard, not a complete registry.
**How to avoid:** If the creator is not found in the leaderboard, try `getTokenLifetimeFees(tokenMint)` using the wallet from `getLaunchWalletV2` as a fallback. If even that fails, show what data we have (profile info) without token stats. Consider using the raw `bagsApiClient` for a direct token lookup if available.
**Warning signs:** Creator pages showing "no token" when the token actually exists but is low-volume.

### Pitfall 3: PublicKey Serialization
**What goes wrong:** `PublicKey` objects from the SDK are not JSON-serializable. Passing them to client components or caching them causes errors.
**Why it happens:** `PublicKey` is a class with internal buffer, not a plain string.
**How to avoid:** Always call `.toBase58()` at the API/data boundary. This pattern is already established in the existing API route.
**Warning signs:** `TypeError: Cannot serialize` errors, empty wallet values.

### Pitfall 4: Next.js Dynamic Route Params are Promises in v15
**What goes wrong:** Accessing `params.handle` directly throws because params is a Promise in Next.js 15.
**Why it happens:** Next.js 15 made route params async.
**How to avoid:** Always destructure with `const { handle } = await params;`. This pattern is already correct in the existing placeholder page.tsx.
**Warning signs:** `TypeError: Cannot read properties of Promise`.

### Pitfall 5: Missing NEXT_PUBLIC_APP_URL for Self-Fetch
**What goes wrong:** If you try to fetch from your own API route in a Server Component, you need the full URL (not relative path).
**Why it happens:** Server Components run on the server where relative URLs don't resolve.
**How to avoid:** Use the direct server-side data function pattern instead of self-fetching. This is the recommended approach anyway.
**Warning signs:** `TypeError: Failed to parse URL` or `ECONNREFUSED`.

### Pitfall 6: Token Data Fields May Be Null
**What goes wrong:** Assuming `tokenInfo`, `tokenLatestPrice`, `creators`, or `tokenSupply` fields exist on `BagsTokenLeaderBoardItem` causes crashes.
**Why it happens:** All these fields are typed as `| null` in the SDK types.
**How to avoid:** Use optional chaining (`?.`) and provide fallback values for display. Show "N/A" or "--" for unavailable data.
**Warning signs:** `TypeError: Cannot read properties of null`.

## Code Examples

### Number Formatting for Token Stats
```typescript
// Reusable formatters for the token stats display
export function formatPrice(usd: number | null): string {
  if (usd === null) return 'N/A';
  if (usd < 0.01) return `$${usd.toFixed(6)}`;
  if (usd < 1) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}

export function formatMarketCap(mcap: number | null): string {
  if (mcap === null) return 'N/A';
  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(mcap);
}

export function formatVolume(volume: number | null): string {
  if (volume === null) return 'N/A';
  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(volume);
}

export function formatHolders(count: number | null): string {
  if (count === null) return 'N/A';
  return Intl.NumberFormat('en-US', { notation: 'compact' }).format(count);
}

export function formatFees(lamportsStr: string): string {
  // lifetimeFees is in lamports as a string
  const lamports = parseInt(lamportsStr, 10);
  if (isNaN(lamports)) return 'N/A';
  const sol = lamports / 1_000_000_000;
  return `${sol.toFixed(4)} SOL`;
}
```

### Status Badge Component Pattern
```typescript
// Source: Bags SDK types/token-launch.d.ts - TokenLaunchStatus enum
// PRE_LAUNCH | PRE_GRAD | MIGRATING | MIGRATED

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  'graduated': {
    label: 'Graduated',
    className: 'bg-accent/20 text-accent border-accent/30',
  },
  'bonding-curve': {
    label: 'Bonding Curve',
    className: 'bg-primary/20 text-primary-foreground border-primary/30',
  },
  'migrating': {
    label: 'Migrating',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  'pre-launch': {
    label: 'Pre-Launch',
    className: 'bg-muted text-muted-foreground border-border',
  },
};
```

### Toast Pattern (Minimal, No Library)
```typescript
// "use client" component for buttons
"use client";
import { useState } from "react";

export function TradeButtons({ handle }: { handle: string }) {
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <div className="relative flex gap-3">
      <button
        onClick={() => showToast("Coming soon")}
        className="rounded-lg bg-accent px-6 py-3 font-semibold text-background"
      >
        Buy Shares
      </button>
      <button
        onClick={() => showToast("Coming soon")}
        className="rounded-lg border border-border px-6 py-3 font-semibold text-foreground"
      >
        Sell Shares
      </button>
      {toast && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
```

### Skeleton Loading for Creator Page
```typescript
// app/creator/[handle]/loading.tsx - update to match new layout
export default function CreatorLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl animate-pulse">
        {/* Avatar skeleton */}
        <div className="mx-auto h-24 w-24 rounded-full bg-border" />
        {/* Name skeleton */}
        <div className="mx-auto mt-4 h-6 w-40 rounded bg-border" />
        {/* Handle skeleton */}
        <div className="mx-auto mt-2 h-4 w-28 rounded bg-border" />
        {/* Badge skeleton */}
        <div className="mx-auto mt-3 h-6 w-24 rounded-full bg-border" />
        {/* Stats row skeleton */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-3 w-16 rounded bg-border" />
              <div className="h-5 w-20 rounded bg-border" />
            </div>
          ))}
        </div>
        {/* Fee earnings skeleton */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="h-3 w-24 rounded bg-border" />
          <div className="h-5 w-32 rounded bg-border" />
        </div>
        {/* Buttons skeleton */}
        <div className="mt-8 flex justify-center gap-3">
          <div className="h-12 w-32 rounded-lg bg-border" />
          <div className="h-12 w-32 rounded-lg bg-border" />
        </div>
      </div>
    </main>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getLaunchWalletForTwitterUsername` | `getLaunchWalletV2(username, provider)` | SDK current | V2 returns richer data (platformData with avatar, display_name) |
| Global `force-dynamic` | Per-route caching strategy | Phase 1 | Pages can use static/dynamic rendering as needed |
| Direct API key in client | Server-side SDK singleton via `lib/bags.ts` | Phase 1 | API key secured, null-safe getBagsSDK() pattern |

**Deprecated/outdated:**
- `getLaunchWalletForTwitterUsername`: Still exists but less useful than V2 (only returns PublicKey, no platform data)

## SDK Data Map for Creator Page

This is the critical reference for understanding which SDK call provides which data:

| Data Point | SDK Source | Field Path | Type |
|------------|-----------|------------|------|
| Avatar URL | `getLaunchWalletV2` | `platformData.avatar_url` | string |
| Display Name | `getLaunchWalletV2` | `platformData.display_name` | string |
| Username | `getLaunchWalletV2` | `platformData.username` | string |
| Wallet Address | `getLaunchWalletV2` | `wallet.toBase58()` | string or null |
| Token Price (USD) | `getTopTokensByLifetimeFees` | `item.tokenLatestPrice?.priceUSD` | number or null |
| Market Cap | `getTopTokensByLifetimeFees` | `item.tokenInfo?.mcap` | number or null |
| Volume (USD) | `getTopTokensByLifetimeFees` | `item.tokenLatestPrice?.volumeUSD` | number or null |
| Holder Count | `getTopTokensByLifetimeFees` | `item.tokenInfo?.holderCount` | number or null |
| Lifetime Fees | `getTopTokensByLifetimeFees` | `item.lifetimeFees` | string (lamports) |
| Graduated | `getTopTokensByLifetimeFees` | `item.tokenInfo?.graduatedPool` | string or undefined |
| Graduation Date | `getTopTokensByLifetimeFees` | `item.tokenInfo?.graduatedAt` | string or undefined |
| Token Mint | `getTopTokensByLifetimeFees` | `item.token` | string |
| Token Name | `getTopTokensByLifetimeFees` | `item.tokenInfo?.name` | string |
| Token Symbol | `getTopTokensByLifetimeFees` | `item.tokenInfo?.symbol` | string |

**Fallback for non-leaderboard tokens:** If a token exists but is not on the leaderboard, use `state.getTokenLifetimeFees(new PublicKey(tokenMint))` for fees and check if additional data endpoints exist. For the hackathon, the curated creators should all be on the leaderboard, so this fallback may be deprioritized.

## Open Questions

1. **How does getLaunchWalletV2 behave for handles with no Bags presence at all?**
   - What we know: The SDK wraps the call in try/catch and throws `Error('Failed to get launch wallet...')`. The API returns `{ success: false, error: "..." }`.
   - What's unclear: Does it return a 404-style error or a different error? Does `platformData` still come back for valid Twitter users without tokens?
   - Recommendation: Wrap in try/catch. On error, render page with just the handle text (no avatar), show launch CTA. Test with real API once credentials are available.

2. **Is there a direct handle-to-token lookup beyond the leaderboard?**
   - What we know: The SDK does not expose a direct `getTokenByHandle` method. Leaderboard is the primary source.
   - What's unclear: Whether the Bags API has an undocumented endpoint, or if we should match by wallet address.
   - Recommendation: Use leaderboard search (match by `creators[].twitterUsername`). For hackathon with curated creators, this is sufficient. Add a TODO comment for a more robust lookup if needed.

3. **Fee earnings unit: lamports or SOL?**
   - What we know: `lifetimeFees` is a string. `getTokenLifetimeFees` returns `parseInt(response)`. The SDK code does not convert units.
   - What's unclear: Whether the value is in lamports (9 decimals) or already in SOL.
   - Recommendation: Assume lamports (standard Solana convention), divide by 1e9 for display. Verify with real data once available.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CREA-01 | API returns token stats (price, mcap, holders) | unit | `npx vitest run tests/api/creator-handle.test.ts -t "returns token stats" -x` | Partial (existing tests cover basic route; need expansion) |
| CREA-02 | API returns fee earnings data | unit | `npx vitest run tests/api/creator-handle.test.ts -t "returns fee earnings" -x` | No -- Wave 0 |
| CREA-03 | Status derived correctly from token data | unit | `npx vitest run tests/lib/creator-page.test.ts -t "status badge" -x` | No -- Wave 0 |
| CREA-04 | Buy button renders and shows toast | unit | `npx vitest run tests/components/trade-buttons.test.ts -x` | No -- Wave 0 (may skip: UI-only, low logic) |
| CREA-05 | Sell button renders and shows toast | unit | Same as CREA-04 | No -- Wave 0 (may skip) |
| CREA-06 | API handles any handle including unknown ones | unit | `npx vitest run tests/api/creator-handle.test.ts -t "unknown handle" -x` | Partial (existing tests cover invalid handle; need unknown handle case) |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/api/creator-handle.test.ts` -- expand existing tests to cover enriched response (token stats, fees, no-token state)
- [ ] `tests/lib/creator-page.test.ts` -- covers data extraction helpers (formatPrice, formatMarketCap, deriveTokenStatus)
- [ ] Component tests optional for hackathon (trade-buttons are UI-only placeholders)

## Sources

### Primary (HIGH confidence)
- Bags SDK type definitions: `node_modules/@bagsfm/bags-sdk/dist/types/api.d.ts` -- all data types for leaderboard items, token info, launch wallet response
- Bags SDK state service: `node_modules/@bagsfm/bags-sdk/dist/services/state.d.ts` and `state.js` -- API methods, endpoints, error handling
- Bags SDK token-launch types: `node_modules/@bagsfm/bags-sdk/dist/types/token-launch.d.ts` -- `TokenLaunchStatus` enum
- Existing codebase: `app/api/creator/[handle]/route.ts`, `lib/bags.ts`, `lib/cache.ts`, `lib/creators.ts`, `components/creator-card.tsx`

### Secondary (MEDIUM confidence)
- `.planning/research/STACK.md` -- project stack decisions (API-first, caching strategy)
- `.planning/research/ARCHITECTURE.md` -- architecture patterns (server-side API calls, caching)

### Tertiary (LOW confidence)
- Fee earnings unit assumption (lamports vs SOL) -- needs verification with real API data

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all libraries already in project
- Architecture: HIGH -- extends established patterns (Server Components, SDK singleton, cache, existing API route)
- Pitfalls: HIGH -- derived from reading SDK source code and established codebase patterns
- Data mapping: MEDIUM -- leaderboard search by handle may not cover all edge cases (low-volume tokens not in leaderboard)
- Fee units: LOW -- assumed lamports based on Solana convention, needs runtime verification

**Research date:** 2026-03-08
**Valid until:** 2026-03-15 (stable -- no external dependency changes expected)
