---
phase: 02-landing-page
plan: 01
subsystem: ui
tags: [bags-sdk, tailwind, next-image, react, server-components, client-components, caching]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "getBagsSDK() from lib/bags.ts, cache utility from lib/cache.ts, vitest test infrastructure"
provides:
  - "CreatorCardData type and getCreatorsForGrid() data fetcher with 30s cache"
  - "extractCardData() transforms raw SDK items to card-ready shape"
  - "sanitizeHandle() input sanitization for search bar"
  - "CURATED_CREATORS list for landing page filtering"
  - "Hero, CreatorCard, GridSkeleton, SearchBar UI components"
affects: [02-landing-page, 03-creator-page, 07-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: [server-component-cards, client-component-forms, curated-filtering-with-fallback, sdk-data-transformation]

key-files:
  created:
    - lib/creators.ts
    - components/hero.tsx
    - components/creator-card.tsx
    - components/grid-skeleton.tsx
    - components/search-bar.tsx
    - tests/lib/creators.test.ts
  modified: []

key-decisions:
  - "Used unoptimized prop on next/image for creator avatars from unknown hosts"
  - "Curated filtering falls back to all results when no matches found (never empty grid)"

patterns-established:
  - "SDK data transformation: raw SDK types -> card-ready interfaces via extractCardData pattern"
  - "Curated filtering with graceful fallback: filter by list, fall back to all if empty"
  - "Input sanitization extracted to shared lib (not inline in components)"

requirements-completed: [LAND-01, LAND-02, LAND-03, LAND-04, LAND-05]

# Metrics
duration: 3min
completed: 2026-03-08
---

# Phase 02 Plan 01: Data Layer & Components Summary

**Creator data layer with Bags SDK integration, curated filtering with fallback, and 4 landing page UI components (Hero, CreatorCard, GridSkeleton, SearchBar)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-08T16:01:33Z
- **Completed:** 2026-03-08T16:05:01Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Data layer fetches top creators from Bags SDK, transforms to card-ready shape, and caches with 30s TTL
- Curated creator filtering ensures landing page shows recognizable handles with fallback to all results
- sanitizeHandle() strips @ prefix and non-alphanumeric characters for safe URL navigation
- 4 UI components (Hero, CreatorCard, GridSkeleton, SearchBar) ready for page.tsx composition
- 14 unit tests covering data fetching, caching, extraction, filtering, and sanitization
- Full test suite (39 tests) passes with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Data layer -- lib/creators.ts with tests** (TDD)
   - `888b2ec` (test: add failing tests for creator data layer)
   - `94e2523` (feat: implement creator data layer with caching and curated filtering)
2. **Task 2: UI components -- Hero, CreatorCard, GridSkeleton, SearchBar** - `756f6a8` (feat)

## Files Created/Modified
- `lib/creators.ts` - CreatorCardData type, getCreatorsForGrid(), extractCardData(), sanitizeHandle(), CURATED_CREATORS
- `components/hero.tsx` - Server component with value proposition heading and subtitle
- `components/creator-card.tsx` - Server component displaying avatar, name, handle, price, backer count
- `components/grid-skeleton.tsx` - 8 animated placeholder cards for loading state
- `components/search-bar.tsx` - Client component with handle input, sanitization, and navigation
- `tests/lib/creators.test.ts` - 14 tests for data layer and sanitization logic

## Decisions Made
- Used `unoptimized` prop on next/image for creator avatars since they come from unknown hosts (not just pbs.twimg.com). Acceptable for 80px avatars where optimization gains are minimal.
- Curated filtering uses case-insensitive comparison and falls back to all results when no curated handles match, ensuring the grid is never empty due to curation misses.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test helper makeMockItem override handling for null values**
- **Found during:** Task 1 (TDD GREEN phase)
- **Issue:** Test helper used spread operator on override values, which silently ignored null overrides for tokenInfo and tokenLatestPrice, causing 2 test failures
- **Fix:** Rewrote helper to use explicit null checks with `"key" in overrides` pattern before applying defaults
- **Files modified:** tests/lib/creators.test.ts
- **Verification:** All 14 tests pass
- **Committed in:** 94e2523 (Task 1 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 bug in test helper)
**Impact on plan:** Test helper fix was necessary for correct null-value testing. No scope creep.

## Issues Encountered
- Vitest v4 does not support `-x` flag (changed to `--bail 1` for fail-fast behavior) -- not a code issue, just CLI difference.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All components and data layer ready for Plan 02 to wire into page.tsx
- getCreatorsForGrid() provides the data, Hero/CreatorCard/GridSkeleton/SearchBar provide the UI
- No blockers for page composition

## Self-Check: PASSED

All 7 files verified present. All 3 commits verified in git log.

---
*Phase: 02-landing-page*
*Completed: 2026-03-08*
