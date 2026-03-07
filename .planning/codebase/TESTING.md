# Testing Patterns

**Analysis Date:** 2026-03-07

## Test Framework

**Runner:**
- No test framework is currently installed or configured
- No test runner config files found (no `jest.config.*`, `vitest.config.*`, or similar)
- No `test` script in `package.json`

**Available Lint Check:**
```bash
npm run lint                # Runs `next lint` (ESLint with Next.js rules)
```

## Test File Organization

**Location:**
- No test files exist in the codebase

**Current State:**
- Zero test files detected across the entire project
- No `__tests__/` directories
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` files

## Recommended Setup

Based on the stack (Next.js 15, React 19, TypeScript 5), the recommended test setup is:

**Framework:** Vitest (preferred for Next.js + TypeScript projects)

**Installation:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

**Config file:** Create `vitest.config.ts` at project root:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

**Add to `package.json` scripts:**
```json
{
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage"
}
```

## Recommended Test Structure

**Location Pattern:** Co-located tests alongside source files, or a top-level `tests/` directory:
```
tests/
├── setup.ts              # Global test setup
├── lib/
│   ├── bags.test.ts      # Unit tests for lib/bags.ts
│   ├── helius.test.ts    # Unit tests for lib/helius.ts
│   └── supabase/
│       ├── client.test.ts
│       └── server.test.ts
├── components/
│   └── providers.test.tsx
└── app/
    └── page.test.tsx
```

**Naming Convention (recommended):**
- `{module}.test.ts` for utility/library tests
- `{component}.test.tsx` for React component tests
- Match directory structure with source code

## Recommended Test Patterns

**Suite Organization:**
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("getBagsSDK", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("throws when BAGS_API_KEY is not set", () => {
    // test implementation
  });

  it("returns a BagsSDK instance when configured", () => {
    // test implementation
  });

  it("returns the same instance on subsequent calls (singleton)", () => {
    // test implementation
  });
});
```

## Recommended Mocking Patterns

**Environment Variables:**
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("lib/helius", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_HELIUS_RPC_URL", "https://test-rpc.example.com");
  });

  it("creates a Connection with the configured RPC URL", async () => {
    const { getHeliusConnection } = await import("@/lib/helius");
    const connection = getHeliusConnection();
    expect(connection).toBeDefined();
  });
});
```

**External SDKs:**
```typescript
vi.mock("@bagsfm/bags-sdk", () => ({
  BagsSDK: vi.fn().mockImplementation(() => ({
    // mock SDK methods as needed
  })),
}));
```

**Supabase Client:**
```typescript
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn(),
  })),
  createServerClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
  })),
}));
```

**What to Mock:**
- External SDK clients (`@bagsfm/bags-sdk`, `@solana/web3.js`, `helius-sdk`)
- Supabase client creation (`@supabase/ssr`)
- `next/headers` for server component tests (cookies)
- Environment variables via `vi.stubEnv()`

**What NOT to Mock:**
- Type definitions (`types/index.ts`)
- Pure utility functions (when added)
- Privy config object (`lib/privy.ts` — it's a static config, test it directly)

## Coverage

**Requirements:** None enforced (no test framework installed)

**Priority areas for test coverage (when tests are added):**
1. `lib/bags.ts` - Singleton initialization, env var validation
2. `lib/helius.ts` - Connection creation, env var validation
3. `lib/supabase/server.ts` - Cookie handling, server client creation
4. `lib/supabase/client.ts` - Browser client creation
5. `types/index.ts` - Type exports (compile-time only, no runtime tests needed)

## Test Types

**Unit Tests:**
- Target: Library modules in `lib/` directory
- Focus on singleton initialization, environment variable validation, error throwing

**Component Tests:**
- Target: React components in `components/` and `app/`
- Use `@testing-library/react` for rendering and assertions
- Test that `Providers` wraps children with required context providers

**Integration Tests:**
- Not applicable yet (minimal application logic)
- Will be needed when API routes and data fetching are added

**E2E Tests:**
- Not configured
- Consider Playwright when user flows are implemented (login, creator page, dashboard)

## Current Gaps

- **No test framework installed** — zero test infrastructure exists
- **No CI test pipeline** — `npm run lint` is the only quality check
- **No test script in `package.json`** — need to add `test`, `test:run`, `test:coverage`
- **Singleton modules are hard to test** — `lib/bags.ts` and `lib/helius.ts` use module-level mutable state; consider `vi.resetModules()` between tests

---

*Testing analysis: 2026-03-07*
