# Phase 3: Creator Page - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Dynamic creator profile page displaying live Bags token data (price, market cap, volume, holders), fee earnings, launch status badge, and trade entry points (Buy/Sell buttons — UI only, trade logic in Phase 4). Handles "no token found" state with a launch CTA. Works for any Twitter handle via `/creator/[handle]`.

</domain>

<decisions>
## Implementation Decisions

### Page layout
- Hero banner + content below structure
- Clean centered layout — avatar centered, name + handle below, status badge beneath
- Max-width container (~max-w-2xl) for content, consistent with landing page centered aesthetic
- Back arrow/link at top-left to return to landing page

### Token stats display
- Horizontal stat row: Price, Market Cap, Volume, Holders — label above, value below
- Collapses to 2x2 grid on mobile
- Stat values use teal accent color (#14b8a6), labels in muted-foreground
- Skeleton pulse loading state while data fetches (consistent with existing GridSkeleton pattern)

### Fee earnings
- Separate section below token stats row, visually distinct from token metrics
- Own labeled section ("Fee Earnings") with lifetime value

### No-token state
- Same page layout (hero with avatar + handle preserved)
- Stats section replaced with launch prompt
- Encouraging/action-oriented copy: "No token yet. Be the first to back @handle!"
- Launch Token button in primary purple (#6d28d9)
- Button is a placeholder — shows "Coming soon" toast on click (Phase 5 wires it up)
- Cost hint visible: "(0.2 SOL)"

### Trade buttons
- Buy/Sell buttons below stats and fee earnings
- UI only — show "Coming soon" toast on click (same pattern as Launch CTA)
- Phase 4 wires up actual trade logic

### Claude's Discretion
- Exact avatar size on creator page (larger than CreatorCard's 80px)
- Status badge component design and graduation state labels
- Exact spacing, typography, and section dividers
- Error state handling for API failures
- Mobile responsive breakpoints for stat row collapse

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/creator-card.tsx`: CreatorCard with avatar + price + holders pattern — extract shared styling
- `components/grid-skeleton.tsx`: GridSkeleton for landing page — skeleton pulse pattern reusable
- `lib/creators.ts`: `CreatorCardData` type, `sanitizeHandle()`, `extractCardData()` — reuse for creator page data
- `lib/bags.ts`: `getBagsSDK()` singleton with null-safe pattern — already handles dev-mode gracefully
- `lib/cache.ts`: In-memory TTL cache — already used by API routes

### Established Patterns
- Server Components by default, `"use client"` only when needed
- Tailwind CSS v4 with semantic color tokens (background, foreground, primary, accent, muted, border)
- Dark mode default, purple primary (#6d28d9), teal accent (#14b8a6)
- `unoptimized` prop on next/image for external Twitter avatars
- Dev-mode mock data fallback when SDK returns null

### Integration Points
- `app/creator/[handle]/page.tsx` — existing placeholder, will be replaced
- `app/api/creator/[handle]/route.ts` — existing API route fetches `getLaunchWalletV2`, may need expansion for market cap/volume/fees
- `app/creator/[handle]/error.tsx` and `loading.tsx` — error boundary and loading already exist
- Navigation from CreatorCard links (`/creator/${handle}`) already wired

</code_context>

<specifics>
## Specific Ideas

- Layout should feel like a clean social profile — avatar centered, stats below, not a cluttered dashboard
- The no-token state should frame the visitor as a "champion" / pioneer — encouraging, not apologetic
- Buy/Sell and Launch buttons all use the same "Coming soon" toast pattern for consistency in Phase 3

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-creator-page*
*Context gathered: 2026-03-08*
