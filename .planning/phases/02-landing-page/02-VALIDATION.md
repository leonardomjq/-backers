---
phase: 2
slug: landing-page
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | LAND-01 | unit | `npx vitest run tests/lib/creators.test.ts -x` | No — W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | LAND-02 | unit | `npx vitest run tests/components/creator-card.test.ts -x` | No — W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | LAND-03 | unit | `npx vitest run tests/components/search-bar.test.ts -x` | No — W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | LAND-04 | manual-only | Manual: verify hero above fold | N/A | ⬜ pending |
| 02-01-05 | 01 | 1 | LAND-05 | manual-only | Manual: lighthouse audit | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/lib/creators.test.ts` — tests curated creator data fetching + cache behavior (LAND-01)
- [ ] `tests/components/creator-card.test.ts` — tests card prop rendering with null safety (LAND-02)
- [ ] `tests/components/search-bar.test.ts` — tests handle sanitization and navigation (LAND-03)

*Component tests mock Bags SDK following `vi.mock` pattern from `tests/api/creators.test.ts`.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Value prop visible in first viewport | LAND-04 | Visual layout verification requires browser viewport | Load page on desktop (1280px) and mobile (375px), confirm hero section is fully visible without scrolling |
| Page loads in under 2 seconds | LAND-05 | Performance timing requires real browser environment | Run Lighthouse audit or check Network tab waterfall; verify TTFB + LCP < 2s with warm cache |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
