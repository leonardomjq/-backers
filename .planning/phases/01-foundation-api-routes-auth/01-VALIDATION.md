---
phase: 1
slug: foundation-api-routes-auth
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-07
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (to be installed in Wave 0) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | INFRA-04 | unit | `npx vitest run tests/lib/env.test.ts` | No — W0 | pending |
| 1-01-02 | 01 | 0 | INFRA-02 | unit | `npx vitest run tests/lib/cache.test.ts` | No — W0 | pending |
| 1-02-01 | 02 | 1 | INFRA-01 | integration | `npx vitest run tests/api/creators.test.ts` | No — W0 | pending |
| 1-02-02 | 02 | 1 | AUTH-04 | integration | `npx vitest run tests/middleware.test.ts` | No — W0 | pending |
| 1-03-01 | 03 | 1 | INFRA-03 | manual-only | Manual: trigger API error, verify error UI | N/A | pending |
| 1-03-02 | 03 | 1 | AUTH-01 | manual-only | Manual: click Google login | N/A | pending |
| 1-03-03 | 03 | 1 | AUTH-02 | manual-only | Manual: verify embedded wallet after login | N/A | pending |
| 1-03-04 | 03 | 1 | AUTH-03 | manual-only | Manual: refresh page, verify session | N/A | pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@vitejs/plugin-react` — install dev dependencies
- [ ] `vitest.config.ts` — Vitest config with path aliases matching tsconfig
- [ ] `tests/lib/env.test.ts` — env validation unit tests
- [ ] `tests/lib/cache.test.ts` — TTL cache unit tests
- [ ] `tests/api/creators.test.ts` — API route integration tests (mocked SDK)
- [ ] `tests/middleware.test.ts` — middleware redirect tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google login via Privy | AUTH-01 | Requires browser + OAuth redirect | Click login, select Google, verify callback |
| Embedded wallet creation | AUTH-02 | Requires Privy runtime + Solana | Login, check `useSolanaWallets()` returns wallet |
| Session persistence | AUTH-03 | Requires browser state | Login, refresh page, verify still authenticated |
| Error boundary renders | INFRA-03 | Requires visual verification | Trigger API error, verify error.tsx renders |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
