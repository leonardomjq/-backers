# Technology Stack

**Analysis Date:** 2026-03-07

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (`app/`, `lib/`, `components/`, `types/`)
- SQL - Database migrations (`supabase/migrations/`)

**Secondary:**
- CSS - Tailwind v4 styles (`app/globals.css`)

## Runtime

**Environment:**
- Node.js 24.11.1

**Package Manager:**
- npm 11.6.2
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 15.5.12 - Full-stack React framework (App Router)
- React 19.2.4 - UI library
- React DOM 19.2.4 - DOM rendering

**Styling:**
- Tailwind CSS 4.2.1 - Utility-first CSS framework (v4 with `@import "tailwindcss"` syntax)
- PostCSS 8.x - CSS processing via `@tailwindcss/postcss` plugin

**Testing:**
- Not configured - No test framework installed

**Linting:**
- ESLint 9.39.4 - Linting via `next lint`
- eslint-config-next 15.x - Next.js ESLint rules

**Build/Dev:**
- Next.js built-in bundler (Turbopack available via `next dev --turbopack`)
- TypeScript compiler (noEmit, bundler module resolution)

## Key Dependencies

**Critical:**
- `@privy-io/react-auth` 2.25.0 - Web3 authentication (Google, email login with embedded Solana wallets)
- `@supabase/supabase-js` 2.98.0 - Supabase client for database access
- `@supabase/ssr` 0.9.0 - Server-side Supabase client with cookie-based auth for Next.js
- `@bagsfm/bags-sdk` 1.3.1 - Bags.fm SDK for creator token operations
- `@solana/web3.js` 1.98.4 - Solana blockchain interaction (RPC connection)
- `helius-sdk` 1.5.3 - Helius RPC/API for enhanced Solana data

**Infrastructure:**
- `@tailwindcss/postcss` 4.x - Tailwind CSS PostCSS integration
- `@types/node` 22.x - Node.js type definitions
- `@types/react` 19.x - React type definitions
- `@types/react-dom` 19.x - React DOM type definitions

## Configuration

**TypeScript:** `tsconfig.json`
- Target: ES2017
- Strict mode: enabled
- Module resolution: bundler
- Path alias: `@/*` maps to project root (`./`)
- JSX: preserve (handled by Next.js)
- Incremental compilation: enabled

**Next.js:** `next.config.ts`
- Image remote patterns: `pbs.twimg.com` (Twitter avatars), `*.supabase.co` (Supabase storage)
- No custom webpack configuration
- No middleware configured

**PostCSS:** `postcss.config.mjs`
- Single plugin: `@tailwindcss/postcss`

**Tailwind:** `app/globals.css`
- v4 CSS-based config (no `tailwind.config.js`)
- Custom theme tokens: `--color-background`, `--color-foreground`, `--color-primary`, `--color-primary-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-accent`, `--color-border`
- Font: Inter (sans-serif)
- Dark theme by default (`<html className="dark">`)

**Environment:**
- `.env.example` present with required variable names
- `.env` and `.env*.local` in `.gitignore`
- Required env vars listed in INTEGRATIONS.md

**Build Commands:**
```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Platform Requirements

**Development:**
- Node.js >= 24.x (based on installed version)
- npm >= 11.x
- `.env` file with all required environment variables (see `.env.example`)

**Production:**
- Vercel (`.vercel` in `.gitignore`, Next.js standard deployment)
- Supabase project for database
- Privy app for authentication
- Helius API key for Solana RPC
- Bags API key for Bags SDK

---

*Stack analysis: 2026-03-07*
