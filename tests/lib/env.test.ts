import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateEnv } from "@/lib/env";

describe("validateEnv", () => {
  const VALID_ENV = {
    BAGS_API_KEY: "test-bags-key",
    NEXT_PUBLIC_PRIVY_APP_ID: "test-privy-app-id",
    PRIVY_APP_SECRET: "test-privy-secret",
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-supabase-anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "test-supabase-role-key",
    HELIUS_API_KEY: "test-helius-key",
    NEXT_PUBLIC_HELIUS_RPC_URL: "https://rpc.helius.xyz",
  };

  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // Clear all relevant env vars
    Object.keys(VALID_ENV).forEach((key) => {
      delete process.env[key];
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws with descriptive message when BAGS_API_KEY is missing", () => {
    const { BAGS_API_KEY, ...envWithoutBagsKey } = VALID_ENV;
    Object.assign(process.env, envWithoutBagsKey);

    expect(() => validateEnv()).toThrow("BAGS_API_KEY");
  });

  it("throws listing ALL missing vars, not just the first one", () => {
    // Set no env vars at all -- all should be missing
    try {
      validateEnv();
      expect.fail("Should have thrown");
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toContain("BAGS_API_KEY");
      expect(message).toContain("NEXT_PUBLIC_PRIVY_APP_ID");
      expect(message).toContain("PRIVY_APP_SECRET");
      expect(message).toContain("HELIUS_API_KEY");
    }
  });

  it("returns typed Env object when all vars present", () => {
    Object.assign(process.env, VALID_ENV);

    const result = validateEnv();

    expect(result.BAGS_API_KEY).toBe("test-bags-key");
    expect(result.NEXT_PUBLIC_SUPABASE_URL).toBe("https://test.supabase.co");
    expect(result.HELIUS_API_KEY).toBe("test-helius-key");
  });

  it("rejects NEXT_PUBLIC_SUPABASE_URL that is not a valid URL", () => {
    Object.assign(process.env, {
      ...VALID_ENV,
      NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
    });

    expect(() => validateEnv()).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });
});
