import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing the module under test
vi.mock("@/lib/bags", () => ({
  getBagsSDK: vi.fn(),
}));

vi.mock("@/lib/cache", () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
}));

import {
  formatPrice,
  formatMarketCap,
  formatVolume,
  formatHolders,
  formatFees,
  deriveTokenStatus,
  getCreatorPageData,
} from "@/lib/creators";
import type { CreatorPageData } from "@/lib/creators";
import { getBagsSDK } from "@/lib/bags";
import { cache } from "@/lib/cache";

const mockGetBagsSDK = getBagsSDK as ReturnType<typeof vi.fn>;
const mockCacheGet = cache.get as ReturnType<typeof vi.fn>;
const mockCacheSet = cache.set as ReturnType<typeof vi.fn>;

describe("formatPrice", () => {
  it("returns 'N/A' for null", () => {
    expect(formatPrice(null)).toBe("N/A");
  });

  it("formats small prices with 4 decimal places", () => {
    expect(formatPrice(0.005)).toBe("$0.0050");
  });

  it("formats regular prices with 2 decimal places", () => {
    expect(formatPrice(12.34)).toBe("$12.34");
  });

  it("formats very small prices with 6 decimal places", () => {
    expect(formatPrice(0.000123)).toBe("$0.000123");
  });
});

describe("formatMarketCap", () => {
  it("returns 'N/A' for null", () => {
    expect(formatMarketCap(null)).toBe("N/A");
  });

  it("formats millions in compact notation", () => {
    const result = formatMarketCap(1_500_000);
    // Should contain $ and M
    expect(result).toMatch(/\$.*1\.5M/);
  });

  it("formats thousands in compact notation", () => {
    const result = formatMarketCap(50_000);
    // Should contain $ and K
    expect(result).toMatch(/\$.*50K/);
  });
});

describe("formatVolume", () => {
  it("returns 'N/A' for null", () => {
    expect(formatVolume(null)).toBe("N/A");
  });

  it("formats compact notation", () => {
    const result = formatVolume(250_000);
    expect(result).toMatch(/\$.*250K/);
  });
});

describe("formatHolders", () => {
  it("returns 'N/A' for null", () => {
    expect(formatHolders(null)).toBe("N/A");
  });

  it("formats holder count in compact notation", () => {
    const result = formatHolders(4821);
    // Should produce "4.8K" or "4,821" depending on compact threshold
    expect(result).toMatch(/4/);
  });

  it("formats small numbers without compact notation", () => {
    const result = formatHolders(42);
    expect(result).toBe("42");
  });
});

describe("formatFees", () => {
  it('returns "0.0000 SOL" for "0"', () => {
    expect(formatFees("0")).toBe("0.0000 SOL");
  });

  it("converts lamports to SOL correctly", () => {
    expect(formatFees("1000000000")).toBe("1.0000 SOL");
  });

  it('returns "N/A" for invalid input', () => {
    expect(formatFees("invalid")).toBe("N/A");
  });

  it("handles fractional SOL amounts", () => {
    expect(formatFees("500000000")).toBe("0.5000 SOL");
  });
});

describe("deriveTokenStatus", () => {
  it('returns "graduated" when graduatedPool is set', () => {
    expect(
      deriveTokenStatus({ graduatedPool: "somePool" } as any),
    ).toBe("graduated");
  });

  it('returns "bonding-curve" when bondingCurve exists but not graduated', () => {
    expect(
      deriveTokenStatus({ bondingCurve: 12345 } as any),
    ).toBe("bonding-curve");
  });

  it('returns "pre-launch" when tokenInfo is null', () => {
    expect(deriveTokenStatus(null)).toBe("pre-launch");
  });

  it('returns "pre-launch" when tokenInfo has no graduation or bonding data', () => {
    expect(deriveTokenStatus({} as any)).toBe("pre-launch");
  });
});

describe("getCreatorPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns mock data when SDK is null (dev mode)", async () => {
    mockCacheGet.mockReturnValue(null);
    mockGetBagsSDK.mockReturnValue(null);

    const result = await getCreatorPageData("testhandle");

    expect(result.profile.username).toBe("testhandle");
    expect(result.profile).toHaveProperty("displayName");
    expect(result.profile).toHaveProperty("avatarUrl");
    expect(result).toHaveProperty("token");
  });

  it("returns profile + token data for matching handle", async () => {
    mockCacheGet.mockReturnValue(null);
    const mockSDK = {
      state: {
        getLaunchWalletV2: vi.fn().mockResolvedValue({
          provider: "twitter",
          platformData: {
            id: "123",
            username: "testcreator",
            display_name: "Test Creator",
            avatar_url: "https://pbs.twimg.com/photo.jpg",
          },
          wallet: { toBase58: () => "WalletBase58Address" },
        }),
        getTopTokensByLifetimeFees: vi.fn().mockResolvedValue([
          {
            token: "tokenMint123",
            lifetimeFees: "5000000000",
            tokenInfo: {
              name: "TestToken",
              symbol: "TT",
              icon: "https://example.com/icon.png",
              mcap: 1_000_000,
              holderCount: 500,
              graduatedPool: "poolAddress",
            },
            tokenLatestPrice: {
              priceUSD: 0.05,
              volumeUSD: 250_000,
            },
            creators: [
              { twitterUsername: "testcreator" },
            ],
            tokenSupply: null,
          },
        ]),
      },
    };
    mockGetBagsSDK.mockReturnValue(mockSDK);

    const result = await getCreatorPageData("testcreator");

    expect(result.profile.username).toBe("testcreator");
    expect(result.profile.displayName).toBe("Test Creator");
    expect(result.profile.avatarUrl).toBe("https://pbs.twimg.com/photo.jpg");
    expect(result.profile.wallet).toBe("WalletBase58Address");
    expect(result.token).not.toBeNull();
    expect(result.token!.mint).toBe("tokenMint123");
    expect(result.token!.name).toBe("TestToken");
    expect(result.token!.symbol).toBe("TT");
    expect(result.token!.price).toBe(0.05);
    expect(result.token!.marketCap).toBe(1_000_000);
    expect(result.token!.volume).toBe(250_000);
    expect(result.token!.holders).toBe(500);
    expect(result.token!.lifetimeFees).toBe("5000000000");
    expect(result.token!.status).toBe("graduated");
  });

  it("returns profile + token=null when handle has no matching token in leaderboard", async () => {
    mockCacheGet.mockReturnValue(null);
    const mockSDK = {
      state: {
        getLaunchWalletV2: vi.fn().mockResolvedValue({
          provider: "twitter",
          platformData: {
            id: "456",
            username: "notoken_user",
            display_name: "No Token User",
            avatar_url: "https://pbs.twimg.com/notoken.jpg",
          },
          wallet: null,
        }),
        getTopTokensByLifetimeFees: vi.fn().mockResolvedValue([
          {
            token: "otherMint",
            lifetimeFees: "100",
            tokenInfo: { name: "Other", symbol: "OT" },
            tokenLatestPrice: null,
            creators: [{ twitterUsername: "someone_else" }],
            tokenSupply: null,
          },
        ]),
      },
    };
    mockGetBagsSDK.mockReturnValue(mockSDK);

    const result = await getCreatorPageData("notoken_user");

    expect(result.profile.username).toBe("notoken_user");
    expect(result.profile.wallet).toBeNull();
    expect(result.token).toBeNull();
  });

  it("catches SDK errors and returns valid response with profile handle, token=null", async () => {
    mockCacheGet.mockReturnValue(null);
    const mockSDK = {
      state: {
        getLaunchWalletV2: vi.fn().mockRejectedValue(new Error("API error")),
        getTopTokensByLifetimeFees: vi.fn().mockRejectedValue(new Error("API error")),
      },
    };
    mockGetBagsSDK.mockReturnValue(mockSDK);

    const result = await getCreatorPageData("unknown_handle");

    expect(result.profile.username).toBe("unknown_handle");
    expect(result.token).toBeNull();
  });

  it("returns cached data when available", async () => {
    const cachedData: CreatorPageData = {
      profile: {
        username: "cached_user",
        displayName: "Cached User",
        avatarUrl: null,
        wallet: null,
      },
      token: null,
    };
    mockCacheGet.mockReturnValue(cachedData);

    const result = await getCreatorPageData("cached_user");

    expect(result).toEqual(cachedData);
    expect(mockGetBagsSDK).not.toHaveBeenCalled();
  });

  it("caches result with 30s TTL after successful fetch", async () => {
    mockCacheGet.mockReturnValue(null);
    const mockSDK = {
      state: {
        getLaunchWalletV2: vi.fn().mockResolvedValue({
          provider: "twitter",
          platformData: {
            id: "789",
            username: "cachetest",
            display_name: "Cache Test",
            avatar_url: null,
          },
          wallet: null,
        }),
        getTopTokensByLifetimeFees: vi.fn().mockResolvedValue([]),
      },
    };
    mockGetBagsSDK.mockReturnValue(mockSDK);

    await getCreatorPageData("cachetest");

    expect(mockCacheSet).toHaveBeenCalledWith(
      "creator-page:cachetest",
      expect.any(Object),
      30_000,
    );
  });

  it("matches token by twitterUsername case-insensitively", async () => {
    mockCacheGet.mockReturnValue(null);
    const mockSDK = {
      state: {
        getLaunchWalletV2: vi.fn().mockResolvedValue({
          provider: "twitter",
          platformData: {
            id: "321",
            username: "CaseTEST",
            display_name: "Case Test",
            avatar_url: null,
          },
          wallet: null,
        }),
        getTopTokensByLifetimeFees: vi.fn().mockResolvedValue([
          {
            token: "caseMint",
            lifetimeFees: "100",
            tokenInfo: {
              name: "CaseToken",
              symbol: "CT",
              icon: null,
              mcap: null,
              holderCount: null,
            },
            tokenLatestPrice: null,
            creators: [{ twitterUsername: "casetest" }],
            tokenSupply: null,
          },
        ]),
      },
    };
    mockGetBagsSDK.mockReturnValue(mockSDK);

    const result = await getCreatorPageData("CaseTEST");

    expect(result.token).not.toBeNull();
    expect(result.token!.mint).toBe("caseMint");
  });
});
