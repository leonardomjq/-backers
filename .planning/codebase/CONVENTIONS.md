# Coding Conventions

**Analysis Date:** 2026-03-07

## Naming Patterns

**Files:**
- React page components: `page.tsx` (Next.js App Router convention)
- React layout components: `layout.tsx`
- Client components: PascalCase function name inside lowercase file (e.g., `components/providers.tsx` exports `Providers`)
- Library modules: lowercase kebab-style filenames (e.g., `lib/bags.ts`, `lib/helius.ts`, `lib/privy.ts`)
- Type definitions: barrel file at `types/index.ts`
- SQL migrations: numbered prefix with snake_case (`001_initial_schema.sql`)

**Functions:**
- Use camelCase for all functions: `getBagsSDK()`, `getHeliusConnection()`, `createClient()`
- React components use PascalCase: `Providers`, `HomePage`, `DashboardPage`, `CreatorPage`
- Page components are named `{Route}Page` (e.g., `HomePage`, `DashboardPage`, `CreatorPage`)
- Factory/getter functions prefixed with `get` or `create`: `getBagsSDK()`, `createClient()`

**Variables:**
- camelCase for all variables: `cookieStore`, `rpcUrl`, `apiKey`
- Module-level singletons use `let` with `null` initial value: `let sdk: BagsSDK | null = null`
- Environment variables accessed via `process.env.UPPER_SNAKE_CASE`

**Types:**
- PascalCase for interfaces and types: `Creator`, `Campaign`, `Database`
- Use `interface` for data shapes, `type` for utility types and unions
- Supabase `Database` type follows the Supabase generated types shape with `Row`, `Insert`, `Update` variants
- Union literals for status enums: `"active" | "completed" | "cancelled"`

## Code Style

**Formatting:**
- No Prettier config file detected; relies on default ESLint/Next.js formatting
- Double quotes for strings (consistent across all files)
- 2-space indentation
- Semicolons used consistently
- Trailing commas in multi-line structures

**Linting:**
- ESLint 9 with `eslint-config-next` (v15)
- No custom ESLint config file found; uses Next.js defaults via `next lint` script
- Lint command: `npm run lint` (runs `next lint`)

**TypeScript:**
- Strict mode enabled in `tsconfig.json`
- Target: ES2017
- Module resolution: `bundler`
- `noEmit: true` (Next.js handles compilation)
- `skipLibCheck: true`

## Import Organization

**Order:**
1. Framework/library imports (`next`, `react`, `@supabase/*`, `@privy-io/*`)
2. Internal imports using `@/` path alias
3. Relative imports (used sparingly, e.g., `./helius` in `lib/bags.ts`)

**Path Aliases:**
- `@/*` maps to project root (`./`), configured in `tsconfig.json`
- Use `@/components/...` for components
- Use `@/lib/...` for library utilities
- Use `@/types` for type imports

**Import Style:**
- Use `import type` for type-only imports: `import type { Metadata } from "next"`
- Named imports preferred over default imports (except for page/layout default exports)
- Example: `import { PrivyProvider } from "@privy-io/react-auth"`

## Error Handling

**Patterns:**
- Throw descriptive `Error` for missing environment variables: `throw new Error("BAGS_API_KEY is not set")`
- Silent catch for expected failures in server contexts: `catch { // setAll called from Server Component — safe to ignore }`
- No global error boundary or error handling middleware detected yet
- Non-null assertion (`!`) used for env vars in client-side code where Privy/Supabase requires them: `process.env.NEXT_PUBLIC_PRIVY_APP_ID!`

**Guidelines for new code:**
- Always validate required environment variables with a descriptive error message before use in server-side code
- Use non-null assertion (`!`) only for `NEXT_PUBLIC_*` env vars in client code where build-time validation is expected
- Use empty `catch` blocks only when the failure is genuinely safe to ignore (document why with a comment)

## Logging

**Framework:** None configured (use `console` for now)

**Patterns:**
- No structured logging framework in place
- No logging calls observed in current codebase

## Comments

**When to Comment:**
- Comments explain *why*, not *what*: `// setAll called from Server Component — safe to ignore`
- Stub/placeholder comments document future work: `// Stub for Supabase generated types — replace with...`
- SQL migrations include section headers: `-- Creators table`, `-- Indexes`, `-- RLS`

**JSDoc/TSDoc:**
- Not used in current codebase
- PostCSS config uses JSDoc type annotation: `/** @type {import('postcss-load-config').Config} */`

## Function Design

**Size:** Functions are small and focused, typically under 15 lines

**Parameters:**
- Inline destructured props for React components: `{ children }: { children: React.ReactNode }`
- Next.js 15 async params pattern: `{ params }: { params: Promise<{ handle: string }> }`
- No parameter objects or option bags observed

**Return Values:**
- Library functions return SDK/client instances directly
- React components return JSX
- No Result/Either pattern; errors are thrown

## Module Design

**Exports:**
- Named exports for utility functions and components: `export function Providers`, `export function getBagsSDK`
- Default exports only for Next.js page/layout components (required by framework)
- One export per file (single responsibility)

**Barrel Files:**
- `types/index.ts` serves as a barrel for type exports
- No barrel files for `lib/` or `components/` directories

**Singleton Pattern:**
- Used for SDK and connection instances in `lib/bags.ts` and `lib/helius.ts`
- Pattern: module-level `let` variable, lazy initialization in getter function, null check guard

## Component Patterns

**Server vs Client Components:**
- Pages are Server Components by default (no `"use client"` directive)
- Client components marked explicitly with `"use client"` at file top: `components/providers.tsx`
- Providers wrapper component encapsulates all client-side context providers

**Page Structure:**
- All pages use `<main>` as root element with consistent Tailwind classes: `flex min-h-screen flex-col items-center justify-center`
- Placeholder pages follow pattern: heading + muted description text

**Styling:**
- Tailwind CSS v4 with `@import "tailwindcss"` syntax (not v3 `@tailwind` directives)
- Custom theme tokens defined in `globals.css` via `@theme {}` block
- Semantic color tokens: `background`, `foreground`, `primary`, `primary-foreground`, `muted`, `muted-foreground`, `accent`, `border`
- Utility-first approach; no CSS modules or styled-components
- Dark mode as default (hardcoded `className="dark"` on `<html>`)

## Database Conventions

**Naming:**
- Table names: plural snake_case (`creators`, `campaigns`)
- Column names: snake_case (`twitter_handle`, `token_mint`, `created_at`)
- Index names: `idx_{table}_{column}` pattern
- Trigger names: `set_{table}_updated_at` pattern

**Standards:**
- UUID primary keys with `gen_random_uuid()`
- `created_at` and `updated_at` timestamps with `timestamptz` and `default now()`
- Automatic `updated_at` via trigger function `handle_updated_at()`
- Row Level Security (RLS) enabled on all tables
- Foreign keys with `on delete cascade`

---

*Convention analysis: 2026-03-07*
