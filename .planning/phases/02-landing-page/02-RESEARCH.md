# Phase 2: Landing Page - Research

**Researched:** 2026-03-08
**Domain:** Next.js 15 Server Components, Tailwind v4 responsive grid, Bags SDK data fetching, Next.js Image optimization, client-side search navigation
**Confidence:** HIGH

## Summary

Phase 2 transforms the placeholder landing page (`app/page.tsx`) into a compelling creator discovery grid backed by live Bags API data. The existing `/api/creators` route already returns `Array<BagsTokenLeaderBoardItem>` from `sdk.state.getTopTokensByLifetimeFees()` with full token info, creator profiles, prices, and supply data. The landing page needs to fetch this data server-side, render a responsive grid of creator cards, provide a search bar for navigating to any Twitter handle's creator page, and display a clear value proposition above the fold.

The primary technical decisions are: (1) use the landing page as a Server Component that fetches from the internal `/api/creators` route (or calls the Bags SDK directly server-side to avoid the HTTP hop), (2) use `next/image` with the already-configured `pbs.twimg.com` remote pattern for optimized avatar delivery, (3) keep the search bar as a small client component island that uses `useRouter().push()` from `next/navigation` for handle-based navigation, and (4) use Tailwind v4 responsive grid classes for mobile-first layout. For LAND-05 (sub-2-second load), the key strategy is server-side rendering with the 30-second in-memory cache already in place, ensuring no client-side waterfall for initial data.

A critical decision is the pre-seeded creator list. The existing `getTopTokensByLifetimeFees()` endpoint returns tokens ranked by lifetime fees -- this may or may not include the specific creators wanted for demo. The research recommends a hybrid approach: use a hardcoded curated list of Twitter handles in a config file, fetch their data via `getLaunchWalletV2Bulk()` (which accepts an array of `{username, provider}` items and returns platform data + wallet for each), and fall back to `getTopTokensByLifetimeFees()` if the bulk fetch fails. This gives control over which creators appear while still showing live data.

**Primary recommendation:** Build the landing page as a Server Component that directly calls the Bags SDK (skipping the API route HTTP hop for speed). Use a curated handle list fetched via `getLaunchWalletV2Bulk()` for the creator grid. Keep the search bar as a tiny `"use client"` island. Use `next/image` for avatars. Target mobile-first responsive grid with Tailwind v4.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LAND-01 | Creator grid displays 5-10 pre-seeded creators with live data | Use `getLaunchWalletV2Bulk()` with curated handle list for controlled display. Falls back to `getTopTokensByLifetimeFees()`. Both return live on-chain data. Cache with 30s TTL via existing `lib/cache.ts`. |
| LAND-02 | Each creator card shows avatar, name, token price, backer count | `BagsGetFeeShareWalletV2BulkStateItem` provides `platformData.avatar_url`, `platformData.display_name`, `platformData.username`. For price/backer count, need `getTopTokensByLifetimeFees()` which returns `tokenLatestPrice.priceUSD` and `tokenInfo.holderCount`. Combine both data sources. |
| LAND-03 | Search bar allows typing any Twitter handle to find/create creator page | Client component using `useRouter().push('/creator/${handle}')` from `next/navigation`. Strip `@` prefix, validate alphanumeric + underscore. |
| LAND-04 | Clear value proposition visible in first viewport without scrolling | Hero section above the grid. Server Component -- no hydration delay. Use Tailwind responsive utilities for mobile/desktop viewport fitting. |
| LAND-05 | Page loads in under 2 seconds with pre-cached data | Server Component renders on server (no client JS waterfall). In-memory cache (30s TTL) serves repeat requests instantly. `next/image` lazy-loads avatars below fold. Small client island (search bar only) minimizes JS bundle. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 15.x (installed) | Server Components for data fetching, `next/image` for avatars, `next/link` for navigation | Already the project framework. Server Components eliminate client-side data fetching waterfalls. |
| `@bagsfm/bags-sdk` | latest (installed) | `getTopTokensByLifetimeFees()`, `getLaunchWalletV2Bulk()` for creator data | Only SDK for Bags platform. Already integrated in `lib/bags.ts`. |
| `tailwindcss` | 4.x (installed) | Responsive grid, card styling, dark theme | Already configured with custom theme tokens in `globals.css`. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next/image` | (built-in) | Optimized avatar images with lazy loading | Every creator card avatar. `pbs.twimg.com` already in `next.config.ts` remote patterns. |
| `next/link` | (built-in) | Client-side navigation to creator pages | Creator card click-through to `/creator/[handle]`. |
| `next/navigation` | (built-in) | `useRouter` for programmatic search navigation | Search bar form submission. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Direct SDK call in Server Component | Fetch from `/api/creators` route | Internal HTTP hop adds latency; direct SDK call is faster for server-rendered pages. Keep API route for client-side refetching if needed. |
| Hardcoded curated list | Supabase table of curated creators | Adds DB dependency and migration for a simple config. Hardcoded array of handles is sufficient for hackathon (5-10 items). |
| `getLaunchWalletV2Bulk()` for curated creators | Individual `getLaunchWalletV2()` calls | Bulk endpoint is single HTTP request vs N sequential calls. Much faster. |
| Tailwind grid | CSS Grid manual or Flexbox wrap | Tailwind utilities are already the project standard. No benefit to manual CSS. |

**Installation:**
```bash
# No new packages needed. All dependencies are already installed.
```

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)
```
app/
  page.tsx                    # Landing page (Server Component) - MODIFY
components/
  hero.tsx                    # Hero section with value prop (Server Component)
  creator-grid.tsx            # Creator grid container (Server Component)
  creator-card.tsx            # Individual creator card (Server Component)
  search-bar.tsx              # Search input + navigation ("use client")
lib/
  creators.ts                 # Curated creator list config + data fetching
```

### Pattern 1: Server Component Data Fetching (No API Route Hop)
**What:** Call the Bags SDK directly in a Server Component instead of fetching from an internal API route.
**When to use:** Initial page load where the component is server-rendered. The SDK singleton and cache are available server-side.
**Example:**
```typescript
// lib/creators.ts
import { getBagsSDK } from "@/lib/bags";
import { cache } from "@/lib/cache";
import type { BagsTokenLeaderBoardItem } from "@bagsfm/bags-sdk";

// Curated creator handles for landing page
export const CURATED_CREATORS = [
  "elonmusk",
  "mr_beast",
  "ninja",
  "pokimanelol",
  "timthetatman",
  // Add 5-10 handles with active Bags tokens
];

export async function getCreatorsForGrid(): Promise<BagsTokenLeaderBoardItem[]> {
  const cacheKey = "landing:creators";
  const cached = cache.get<BagsTokenLeaderBoardItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const sdk = getBagsSDK();
    const data = await sdk.state.getTopTokensByLifetimeFees();
    cache.set(cacheKey, data, 30_000);
    return data;
  } catch (error) {
    console.error("Failed to fetch creators for grid:", error);
    return [];
  }
}
```

### Pattern 2: Client Island for Search Bar
**What:** Minimal `"use client"` component that handles form input and programmatic navigation.
**When to use:** Search bar needs `useState` for input and `useRouter` for navigation -- both require client-side JS.
**Example:**
```typescript
// components/search-bar.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const [handle, setHandle] = useState("");
  const router = useRouter();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const sanitized = handle.replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "");
    if (sanitized) {
      router.push(`/creator/${sanitized}`);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2">
      <input
        type="text"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        placeholder="Search by Twitter handle..."
        className="flex-1 rounded-lg border border-border bg-muted px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Search
      </button>
    </form>
  );
}
```

### Pattern 3: Creator Card with next/image
**What:** Server Component that renders a card with optimized avatar, name, price, and backer count.
**When to use:** Each item in the creator grid.
**Example:**
```typescript
// components/creator-card.tsx
import Image from "next/image";
import Link from "next/link";

interface CreatorCardProps {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  priceUsd: number | null;
  holderCount: number | null;
}

export function CreatorCard({
  handle,
  displayName,
  avatarUrl,
  priceUsd,
  holderCount,
}: CreatorCardProps) {
  return (
    <Link
      href={`/creator/${handle}`}
      className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-muted p-6 transition-colors hover:border-primary/50 hover:bg-muted/80"
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={displayName}
          width={80}
          height={80}
          className="rounded-full"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="text-center">
        <p className="font-semibold text-foreground group-hover:text-primary">
          {displayName}
        </p>
        <p className="text-sm text-muted-foreground">@{handle}</p>
      </div>
      <div className="flex gap-4 text-sm">
        <span className="text-accent">
          {priceUsd != null ? `$${priceUsd.toFixed(4)}` : "N/A"}
        </span>
        <span className="text-muted-foreground">
          {holderCount != null ? `${holderCount} backers` : ""}
        </span>
      </div>
    </Link>
  );
}
```

### Pattern 4: Responsive Grid with Tailwind v4
**What:** Mobile-first responsive grid using Tailwind utility classes.
**When to use:** Creator grid layout.
**Example:**
```typescript
// Grid container
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {creators.map((creator) => (
    <CreatorCard key={creator.token} {...creatorProps} />
  ))}
</div>
```

### Anti-Patterns to Avoid
- **Fetching data client-side on the landing page:** This creates a waterfall -- HTML loads, JS loads, then data fetches. Use Server Components for initial data. The landing page MUST NOT use `useEffect` + `fetch` for the creator grid.
- **Creating a new API route just for the landing page:** The existing `/api/creators` works, but for server-rendered pages, calling the SDK directly is faster (no HTTP round-trip to yourself).
- **Using `"use client"` on the entire page:** Only the search bar needs interactivity. Keep the page, hero, and grid as Server Components. The search bar is a small client island.
- **Unsized `next/image` without width/height:** Always provide explicit width and height (or use `fill` with a sized container) to prevent layout shift.
- **Forgetting avatar fallback:** Not all creators have profile pictures. Always render a fallback (initial letter, placeholder icon).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Custom image proxy/resize | `next/image` component | Automatic WebP conversion, lazy loading, size optimization, CDN caching |
| Responsive breakpoints | Custom media queries in CSS | Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) | Consistent with project, no custom CSS needed |
| Client-side navigation | `window.location.href = ...` | `useRouter().push()` from `next/navigation` | SPA navigation (no full page reload), prefetching, scroll restoration |
| Data caching | Custom fetch wrapper with cache | Existing `lib/cache.ts` TTL cache | Already built and tested in Phase 1 |
| Number formatting (prices) | Manual string formatting | `Intl.NumberFormat` or simple `toFixed()` | Handles locale, decimals, currency symbols |
| Avatar placeholder | Complex SVG generation | CSS initial letter fallback (div with first char) | Simple, no dependency, consistent styling |

**Key insight:** Phase 2 is a UI phase. All infrastructure (SDK, cache, API routes, error boundaries) was built in Phase 1. The work here is composing Server Components with clean Tailwind styling. No new libraries needed.

## Common Pitfalls

### Pitfall 1: Data Shape Mismatch Between Two Bags SDK Endpoints
**What goes wrong:** The landing page needs avatar, name, price, AND holder count per creator. But these come from different SDK methods with different response shapes.
**Why it happens:** `getTopTokensByLifetimeFees()` returns `BagsTokenLeaderBoardItem` with `tokenInfo` (which has `holderCount`, `usdPrice`, `icon`, `name`) and `creators` array (which has `pfp`, `username`). `getLaunchWalletV2Bulk()` returns `platformData` (which has `avatar_url`, `display_name`, `username`) but no price/holder data.
**How to avoid:** Use `getTopTokensByLifetimeFees()` as the primary data source since it contains the most complete data (price, holders, token info, AND creator info). The `creators` array on each item has `pfp` (profile picture) and `username`. The `tokenInfo` has `holderCount` and `usdPrice`. This single endpoint provides everything LAND-02 requires.
**Warning signs:** Making two separate API calls when one suffices; showing "N/A" for prices on the landing page.

### Pitfall 2: `tokenInfo` or `tokenLatestPrice` Being Null
**What goes wrong:** `BagsTokenLeaderBoardItem` has `tokenInfo: JupiterToken | null` and `tokenLatestPrice: TokenLatestPrice | null`. Accessing `.holderCount` or `.priceUSD` on null crashes the page.
**Why it happens:** Tokens that are pre-launch or recently created may not have Jupiter index data yet.
**How to avoid:** Always null-check before accessing nested properties. Use optional chaining: `item.tokenInfo?.holderCount ?? 0`. Render "N/A" or a dash for missing data rather than crashing.
**Warning signs:** Runtime errors like "Cannot read properties of null" in server component rendering.

### Pitfall 3: Twitter Avatar URL Variability
**What goes wrong:** The `avatar_url` from Bags `platformData` or the `pfp` from `creators` array may use different Twitter CDN URL patterns. Some may use `pbs.twimg.com`, others might use different subdomains or have expired URLs.
**Why it happens:** Twitter/X has changed their image CDN patterns. The Bags API returns whatever URL it has cached from the social platform.
**How to avoid:** The `next.config.ts` already allows `pbs.twimg.com`. For the `icon` field on `JupiterToken`, that likely points to a different host. Add a fallback: if `next/image` fails to load (using `onError` would require client component), use a CSS fallback. Simpler approach: wrap avatar in a container with background color, so if image fails the container is still visible. Or use a regular `<img>` tag for the avatar if optimized loading is not critical for 80px images.
**Warning signs:** Broken images showing alt text or nothing; `next/image` errors about unconfigured hostnames.

### Pitfall 4: Empty Creator Grid on First Deploy
**What goes wrong:** `getTopTokensByLifetimeFees()` returns whatever the Bags API considers "top" -- this might not include recognizable creators, or could be empty if the API has issues.
**Why it happens:** The Bags API returns real-time leaderboard data. Before demo seeding (Phase 7), the returned creators may not be compelling for a hackathon demo.
**How to avoid:** Filter/limit the response to show only items where `tokenInfo` is not null and `creators` has at least one entry. Accept that before Phase 7 seeding, the landing page may show generic token data. The important thing is that the UI works and looks good with whatever data is available.
**Warning signs:** Landing page showing tokens with no recognizable names or profile pictures.

### Pitfall 5: Search Bar Handling Edge Cases
**What goes wrong:** Users type `@handle` (with @ prefix), full URLs like `twitter.com/handle`, or handles with special characters. The navigation fails or goes to a broken page.
**Why it happens:** Users copy-paste from Twitter/X in various formats.
**How to avoid:** Strip `@` prefix, extract handle from URL patterns, and sanitize to only alphanumeric + underscore (matching the existing API route sanitization in `app/api/creator/[handle]/route.ts`).
**Warning signs:** 404s or error pages when users search with the `@` symbol.

### Pitfall 6: Server Component Rendering Blocks on Slow API
**What goes wrong:** If the Bags API takes 3+ seconds to respond, the entire landing page is blocked because the Server Component awaits the data before sending HTML.
**Why it happens:** Server Components render synchronously from the server's perspective. A slow external API blocks the HTML response.
**How to avoid:** Use React `Suspense` around the data-fetching component. The hero section and search bar render immediately (static), while the creator grid shows a loading skeleton wrapped in `<Suspense fallback={<GridSkeleton />}>`. This sends the above-the-fold content instantly while streaming the grid data as it becomes available.
**Warning signs:** Blank page for several seconds before anything appears; TTFB > 2 seconds.

## Code Examples

Verified patterns from the actual codebase and SDK type definitions:

### Data Extraction from BagsTokenLeaderBoardItem
```typescript
// Source: @bagsfm/bags-sdk dist/types/api.d.ts (inspected locally)

import type { BagsTokenLeaderBoardItem } from "@bagsfm/bags-sdk";

// Extracting card data from the leaderboard response
function extractCardData(item: BagsTokenLeaderBoardItem) {
  const creator = item.creators?.[0]; // Primary creator
  return {
    handle: creator?.twitterUsername ?? creator?.username ?? "unknown",
    displayName: item.tokenInfo?.name ?? creator?.username ?? "Unknown",
    avatarUrl: creator?.pfp ?? item.tokenInfo?.icon ?? null,
    priceUsd: item.tokenLatestPrice?.priceUSD ?? null,
    holderCount: item.tokenInfo?.holderCount ?? null,
    tokenMint: item.token,
    lifetimeFees: item.lifetimeFees,
  };
}
```

### Suspense Streaming Pattern for Landing Page
```typescript
// app/page.tsx
import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { CreatorGrid } from "@/components/creator-grid";
import { SearchBar } from "@/components/search-bar";
import { GridSkeleton } from "@/components/grid-skeleton";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-12 px-4 py-16">
      <Hero />
      <SearchBar />
      <Suspense fallback={<GridSkeleton />}>
        <CreatorGrid />
      </Suspense>
    </main>
  );
}
```

### Async Server Component for Creator Grid
```typescript
// components/creator-grid.tsx (Server Component)
import { getCreatorsForGrid } from "@/lib/creators";
import { CreatorCard } from "@/components/creator-card";

export async function CreatorGrid() {
  const creators = await getCreatorsForGrid();

  if (creators.length === 0) {
    return (
      <p className="text-muted-foreground">No creators available yet.</p>
    );
  }

  return (
    <section className="w-full max-w-6xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {creators.map((item) => {
          const creator = item.creators?.[0];
          return (
            <CreatorCard
              key={item.token}
              handle={creator?.twitterUsername ?? creator?.username ?? "unknown"}
              displayName={item.tokenInfo?.name ?? creator?.username ?? "Unknown"}
              avatarUrl={creator?.pfp ?? item.tokenInfo?.icon ?? null}
              priceUsd={item.tokenLatestPrice?.priceUSD ?? null}
              holderCount={item.tokenInfo?.holderCount ?? null}
            />
          );
        })}
      </div>
    </section>
  );
}
```

### Tailwind v4 Theme Token Reference
```css
/* Source: app/globals.css (inspected locally) */
@theme {
  --color-background: #0a0a0a;
  --color-foreground: #ededed;
  --color-primary: #6d28d9;
  --color-primary-foreground: #f5f3ff;
  --color-muted: #1a1a2e;
  --color-muted-foreground: #a1a1aa;
  --color-accent: #14b8a6;
  --color-border: #27272a;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```
Use these tokens consistently: `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-muted`, `text-muted-foreground`, `text-accent`, `border-border`.

### next/image Configuration Reference
```typescript
// Source: next.config.ts (inspected locally)
// Already configured for Twitter avatars:
images: {
  remotePatterns: [
    { protocol: "https", hostname: "pbs.twimg.com" },
    { protocol: "https", hostname: "*.supabase.co" },
  ],
}
// May need to add more hostnames if tokenInfo.icon or creator.pfp
// points to other CDNs (e.g., Jupiter token icons, arweave).
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side `useEffect` + `fetch` for data | Server Components with `async` function bodies | Next.js 13+ (stable in 15) | No loading spinner on initial load; data arrives with HTML |
| `getServerSideProps` for SSR data | Async Server Components (App Router) | Next.js 13+ | Simpler mental model; component fetches its own data |
| Tailwind v3 `@tailwind base/components/utilities` | Tailwind v4 `@import "tailwindcss"` + `@theme {}` | Jan 2025 | CSS-first config, custom properties for theme tokens |
| Manual responsive images | `next/image` with automatic srcset/WebP | Stable since Next.js 10 | Automatic optimization, lazy loading, size hints |
| Full page client components | Server Components + small client islands | Next.js 13+ | Minimal JS bundle; most of landing page is zero-JS HTML |

**Deprecated/outdated:**
- `getServerSideProps` / `getStaticProps`: App Router uses async Server Components instead
- `@tailwind base`: Tailwind v4 uses `@import "tailwindcss"` syntax
- `unstable_cache`: Being replaced by `use cache`; project uses in-memory cache instead

## Open Questions

1. **Which hostnames do `creator.pfp` and `tokenInfo.icon` resolve to?**
   - What we know: `pbs.twimg.com` is configured. `pfp` likely comes from Twitter. `tokenInfo.icon` comes from Jupiter token metadata, which could be any CDN (arweave, IPFS gateways, custom domains).
   - What's unclear: The exact hostnames used by the Bags API for avatar/icon URLs.
   - Recommendation: After first data fetch, inspect actual URLs and add needed hostnames to `next.config.ts`. Alternatively, use a regular `<img>` tag for icons from unknown hosts (loses optimization but avoids config issues). For 80px avatars, the optimization benefit is minimal.

2. **Does `getTopTokensByLifetimeFees()` return enough recognizable creators?**
   - What we know: Returns tokens ranked by lifetime fees. Top tokens may be "generic" DeFi tokens rather than recognizable creator brands.
   - What's unclear: Whether the results include creators that would look compelling on a landing page.
   - Recommendation: Call the endpoint, inspect results. If not compelling, pivot to `getLaunchWalletV2Bulk()` with a handpicked list of Twitter handles known to have Bags tokens. This is a runtime decision the implementer can make.

3. **Should the search bar auto-complete or just navigate?**
   - What we know: Requirements say "Search bar allows typing any Twitter handle to find/create creator page" (LAND-03).
   - What's unclear: Whether autocomplete/suggestions are expected.
   - Recommendation: Simple form submission (type + enter/click) for hackathon. No autocomplete. Keep it minimal. The creator page handles the "not found" state if the handle has no token.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 (installed) |
| Config file | `vitest.config.ts` (exists, configured with path aliases) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LAND-01 | Creator grid fetches and displays 5+ creators | unit | `npx vitest run tests/components/creator-grid.test.ts -x` | No -- Wave 0 |
| LAND-02 | Card shows avatar, name, price, backer count | unit | `npx vitest run tests/components/creator-card.test.ts -x` | No -- Wave 0 |
| LAND-03 | Search bar sanitizes input and navigates | unit | `npx vitest run tests/components/search-bar.test.ts -x` | No -- Wave 0 |
| LAND-04 | Value prop visible in first viewport | manual-only | Manual: load page, verify hero is above fold on desktop and mobile | N/A |
| LAND-05 | Page loads in under 2 seconds | manual-only | Manual: lighthouse audit or network tab timing | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/components/creator-grid.test.ts` -- tests data fetching and rendering logic
- [ ] `tests/components/creator-card.test.ts` -- tests card prop rendering
- [ ] `tests/components/search-bar.test.ts` -- tests handle sanitization and navigation
- [ ] `tests/lib/creators.test.ts` -- tests curated creator data fetching + cache behavior

Note: Component tests will need to mock the Bags SDK (following the same `vi.mock` pattern established in `tests/api/creators.test.ts`). For React component tests, consider `@testing-library/react` if component behavior testing is needed, but for a hackathon, testing the data fetching functions in `lib/creators.ts` and the sanitization logic is higher value than rendering tests.

## Sources

### Primary (HIGH confidence)
- `@bagsfm/bags-sdk` installed package -- `dist/types/api.d.ts` inspected: `BagsTokenLeaderBoardItem`, `BagsGetFeeShareWalletV2BulkStateItem`, `TokenLaunchCreator`, `JupiterToken`, `TokenLatestPrice` type definitions
- `@bagsfm/bags-sdk` installed package -- `dist/services/state.d.ts` inspected: `getTopTokensByLifetimeFees()`, `getLaunchWalletV2Bulk()` method signatures
- `@bagsfm/bags-sdk` installed package -- `dist/client.d.ts` inspected: `BagsSDK` class with `state` service
- Existing codebase files inspected: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `lib/bags.ts`, `lib/cache.ts`, `types/index.ts`, `next.config.ts`, `app/api/creators/route.ts`, `app/api/creator/[handle]/route.ts`, `tests/api/creators.test.ts`
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) -- async Server Components, client islands
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image) -- remote patterns, width/height, lazy loading
- [Next.js Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating) -- useRouter from next/navigation for App Router

### Secondary (MEDIUM confidence)
- [Tailwind CSS v4 Grid Template Columns](https://tailwindcss.com/docs/grid-template-columns) -- responsive grid utilities
- [Next.js Adding Search and Pagination](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination) -- search bar with URL params pattern
- [Next.js Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data) -- Server Component data fetching best practices

### Tertiary (LOW confidence)
- None -- all findings verified against installed package types or official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new packages needed; all tools verified locally
- Architecture: HIGH -- patterns derived from installed SDK types, existing codebase patterns, and official Next.js 15 docs
- Data shape: HIGH -- `BagsTokenLeaderBoardItem` type definition inspected directly from `@bagsfm/bags-sdk/dist/types/api.d.ts`; contains all fields needed for LAND-01 and LAND-02
- Pitfalls: HIGH -- derived from actual SDK types (null fields), codebase patterns (avatar URL config), and Next.js Server Component streaming patterns
- Search bar: HIGH -- standard `useRouter().push()` pattern from official Next.js docs

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable stack, 30-day validity)
