# Directory Structure

## Layout

```
backers-bags/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (Providers wrapper, metadata)
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles (Tailwind v4)
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard (placeholder)
│   └── creator/
│       └── [handle]/
│           └── page.tsx        # Dynamic creator profile (placeholder)
├── components/
│   └── providers.tsx           # Client-side provider wrapper (Privy)
├── lib/
│   ├── privy.ts                # Privy client config
│   ├── bags.ts                 # Bags SDK singleton
│   ├── helius.ts               # Helius/Solana connection singleton
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       └── server.ts           # Server Supabase client (cookie-aware)
├── types/
│   └── index.ts                # Creator, Campaign interfaces + DB types
├── next.config.ts              # Next.js config (image domains)
├── tsconfig.json               # TypeScript config (strict, path aliases)
├── package.json                # Dependencies and scripts
├── .env.example                # Required env vars template
└── .env.local                  # Local environment variables (gitignored)
```

## Key Locations

| What | Where |
|------|-------|
| Pages/Routes | `app/` |
| Shared components | `components/` |
| Service clients & config | `lib/` |
| Database client | `lib/supabase/` |
| Type definitions | `types/index.ts` |
| Styles | `app/globals.css` |
| Next.js config | `next.config.ts` |

## Naming Conventions

- **Files:** kebab-case for directories, camelCase for lib files (`bags.ts`, `helius.ts`)
- **Components:** PascalCase exports (`Providers`, `HomePage`)
- **Pages:** Default exports, `page.tsx` convention (Next.js App Router)
- **Path aliases:** `@/*` maps to project root
- **Types:** PascalCase interfaces (`Creator`, `Campaign`, `Database`)

## Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing page |
| `/dashboard` | `app/dashboard/page.tsx` | User dashboard |
| `/creator/[handle]` | `app/creator/[handle]/page.tsx` | Creator profile |
