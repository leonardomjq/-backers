import { z } from "zod";

const envSchema = z.object({
  BAGS_API_KEY: z.string().min(1, "BAGS_API_KEY is required"),
  NEXT_PUBLIC_PRIVY_APP_ID: z.string().min(1, "NEXT_PUBLIC_PRIVY_APP_ID is required"),
  PRIVY_APP_SECRET: z.string().min(1, "PRIVY_APP_SECRET is required"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  HELIUS_API_KEY: z.string().min(1, "HELIUS_API_KEY is required"),
  NEXT_PUBLIC_HELIUS_RPC_URL: z.string().url("NEXT_PUBLIC_HELIUS_RPC_URL must be a valid URL"),
});

export type Env = z.infer<typeof envSchema>;

const devDefaults: Record<string, string> = {
  BAGS_API_KEY: "dev-placeholder",
  NEXT_PUBLIC_PRIVY_APP_ID: "dev-placeholder",
  PRIVY_APP_SECRET: "dev-placeholder",
  NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "dev-placeholder",
  SUPABASE_SERVICE_ROLE_KEY: "dev-placeholder",
  HELIUS_API_KEY: "dev-placeholder",
  NEXT_PUBLIC_HELIUS_RPC_URL: "http://localhost:8899",
};

export function validateEnv(): Env {
  const isDev = process.env.NODE_ENV === "development";

  const envWithDefaults = isDev
    ? { ...devDefaults, ...process.env }
    : process.env;

  const result = envSchema.safeParse(envWithDefaults);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Environment validation failed:\n${formatted}`);
  }
  return result.data;
}
