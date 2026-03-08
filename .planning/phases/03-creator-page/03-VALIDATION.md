---
phase: 3
slug: creator-page
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.0.18 |
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
| 03-01-01 | 01 | 0 | CREA-01, CREA-02, CREA-06 | unit | `npx vitest run tests/api/creator-handle.test.ts -x` | Partial | ⬜ pending |
| 03-01-02 | 01 | 0 | CREA-03 | unit | `npx vitest run tests/lib/creator-page.test.ts -x` | No | ⬜ pending |
| 03-02-01 | 02 | 1 | CREA-01 | unit | `npx vitest run tests/api/creator-handle.test.ts -t "returns token stats" -x` | ⬜ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | CREA-02 | unit | `npx vitest run tests/api/creator-handle.test.ts -t "returns fee earnings" -x` | ⬜ W0 | ⬜ pending |
| 03-02-03 | 02 | 1 | CREA-06 | unit | `npx vitest run tests/api/creator-handle.test.ts -t "unknown handle" -x` | ⬜ W0 | ⬜ pending |
| 03-03-01 | 03 | 1 | CREA-03 | unit | `npx vitest run tests/lib/creator-page.test.ts -t "status badge" -x` | ⬜ W0 | ⬜ pending |
| 03-03-02 | 03 | 1 | CREA-04, CREA-05 | manual | Visual inspection | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/api/creator-handle.test.ts` — expand existing tests to cover enriched response (token stats, fees, no-token state)
- [ ] `tests/lib/creator-page.test.ts` — covers data extraction helpers (formatPrice, formatMarketCap, deriveTokenStatus)
- [ ] Component tests optional for hackathon (trade-buttons are UI-only placeholders)

*Existing infrastructure (Vitest) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Buy button renders and shows toast | CREA-04 | UI-only placeholder, no logic to test | Click Buy button, verify "Coming soon" toast appears |
| Sell button renders and shows toast | CREA-05 | UI-only placeholder, no logic to test | Click Sell button, verify "Coming soon" toast appears |
| Layout collapses to 2x2 grid on mobile | CREA-01 | CSS responsive behavior | Resize browser to <640px, verify stat row becomes 2x2 grid |
| No-token state shows launch CTA | CREA-06 | Visual verification | Navigate to `/creator/unknownhandle`, verify launch prompt appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
