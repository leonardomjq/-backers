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
  getCreatorsForGrid,
  extractCardData,
  sanitizeHandle,
  CURATED_CREATORS,
} from "@/lib/creators";
import type { CreatorCardData } from "@/lib/creators";
import { getBagsSDK } from "@/lib/bags";
import { cache } from "@/lib/cache";

const mockGetBagsSDK = getBagsSDK as ReturnType<typeof vi.fn>;
const mockCacheGet = cache.get as ReturnType<typeof vi.fn>;
const mockCacheSet = cache.set as ReturnType<typeof vi.fn>;

// Helper to build a mock BagsTokenLeaderBoardItem
function makeMockItem(overrides: Record<string, unknown> = {}) {
  return {
    token: "tokenMint123",
    lifetimeFees: "1000",
    tokenInfo: {
      id: "id1",
      name: "TestCreator",
      symbol: "TC",
      holderCount: 42,
      usdPrice: 0.05,
      icon: "https://example.com/icon.png",
      ...(overrides.tokenInfo as Record<string, unknown> | undefined),
    },
    creators: [
      {
        username: "testuser",
        pfp: "https://example.com/pfp.png",
        twitterUsername: "testhandle",
        royaltyBps: 500,
        isCreator: true,
        wallet: "walletabc",
        provider: "twitter" as const,
        providerUsername: "testhandle",
      },
      ...(Array.isArray(overrides.extraCreators)
        ? overrides.extraCreators
        : []),
    ],
    tokenSupply: null,
    tokenLatestPrice: {
      price: 0.001,
      priceUSD: 0.05,
      priceSOL: 0.0003,
      tokenAddress: "tokenMint123",
      blockTime: "2026-01-01T00:00:00Z",
      ...(overrides.tokenLatestPrice as Record<string, unknown> | undefined),
    },
    ...Object.fromEntries(
      Object.entries(overrides).filter(
        ([k]) =>
          !["tokenInfo", "tokenLatestPrice", "extraCreators"].includes(k),
      ),
    ),
  };
}

describe("getCreatorsForGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns cached data when cache has 'landing:creators' key (SDK not called)", async () => {
    const cachedData: CreatorCardData[] = [
      {
        handle: "cached",
        displayName: "Cached",
        avatarUrl: null,
        priceUsd: 1.0,
        holderCount: 10,
        tokenMint: "mint1",
      },
    ];
    mockCacheGet.mockReturnValue(cachedData);

    const result = await getCreatorsForGrid();

    expect(result).toEqual(cachedData);
    expect(mockGetBagsSDK).not.toHaveBeenCalled();
    expect(mockCacheGet).toHaveBeenCalledWith("landing:creators");
  });

  it("calls SDK when cache misses and caches result with 30s TTL", async () => {
    mockCacheGet.mockReturnValue(null);
    const mockItems = [makeMockItem()];
    mockGetBagsSDK.mockReturnValue({
      state: {
        getTopTokensByLifetimeFees: vi.fn().mockResolvedValue(mockItems),
      },
    });

    const result = await getCreatorsForGrid();

    expect(result.length).toBeGreaterThan(0);
    expect(mockCacheSet).toHaveBeenCalledWith(
      "landing:creators",
      expect.any(Array),
      30_000,
    );
  });

  it("returns empty array when SDK throws", async () => {
    mockCacheGet.mockReturnValue(null);
    mockGetBagsSDK.mockReturnValue({
      state: {
        getTopTokensByLifetimeFees: vi
          .fn()
          .mockRejectedValue(new Error("API down")),
      },
    });

    const result = await getCreatorsForGrid();

    expect(result).toEqual([]);
  });

  it("returns CreatorCardData[] (transformed, not raw SDK items)", async () => {
    mockCacheGet.mockReturnValue(null);
    const mockItems = [makeMockItem()];
    mockGetBagsSDK.mockReturnValue({
      state: {
        getTopTokensByLifetimeFees: vi.fn().mockResolvedValue(mockItems),
      },
    });

    const result = await getCreatorsForGrid();

    expect(result.length).toBeGreaterThan(0);
    const item = result[0];
    expect(item).toHaveProperty("handle");
    expect(item).toHaveProperty("displayName");
    expect(item).toHaveProperty("avatarUrl");
    expect(item).toHaveProperty("priceUsd");
    expect(item).toHaveProperty("holderCount");
    expect(item).toHaveProperty("tokenMint");
    // Should NOT have raw SDK properties
    expect(item).not.toHaveProperty("lifetimeFees");
    expect(item).not.toHaveProperty("tokenInfo");
    expect(item).not.toHaveProperty("creators");
  });

  it("filters results to items whose creator handle matches a CURATED_CREATORS entry (case-insensitive)", async () => {
    mockCacheGet.mockReturnValue(null);
    const curatedHandle = CURATED_CREATORS[0]; // e.g. "elonmusk"
    const mockItems = [
      makeMockItem({
        token: "curated1",
        creators: [
          {
            username: "elon",
            pfp: "https://example.com/elon.png",
            twitterUsername: curatedHandle.toUpperCase(), // Different case
            royaltyBps: 500,
            isCreator: true,
            wallet: "wallet1",
            provider: "twitter",
            providerUsername: curatedHandle,
          },
        ],
      }),
      makeMockItem({
        token: "notcurated",
        creators: [
          {
            username: "randomguy",
            pfp: "https://example.com/random.png",
            twitterUsername: "randomhandle",
            royaltyBps: 500,
            isCreator: true,
            wallet: "wallet2",
            provider: "twitter",
            providerUsername: "randomhandle",
          },
        ],
      }),
    ];
    mockGetBagsSDK.mockReturnValue({
      state: {
        getTopTokensByLifetimeFees: vi.fn().mockResolvedValue(mockItems),
      },
    });

    const result = await getCreatorsForGrid();

    expect(result.length).toBe(1);
    expect(result[0].handle.toLowerCase()).toBe(curatedHandle.toLowerCase());
  });

  it("returns all results when none match CURATED_CREATORS (graceful fallback)", async () => {
    mockCacheGet.mockReturnValue(null);
    const mockItems = [
      makeMockItem({
        token: "notcurated1",
        creators: [
          {
            username: "nobody1",
            pfp: "https://example.com/1.png",
            twitterUsername: "nobody1handle",
            royaltyBps: 500,
            isCreator: true,
            wallet: "w1",
            provider: "twitter",
            providerUsername: "nobody1handle",
          },
        ],
      }),
      makeMockItem({
        token: "notcurated2",
        creators: [
          {
            username: "nobody2",
            pfp: "https://example.com/2.png",
            twitterUsername: "nobody2handle",
            royaltyBps: 500,
            isCreator: true,
            wallet: "w2",
            provider: "twitter",
            providerUsername: "nobody2handle",
          },
        ],
      }),
    ];
    mockGetBagsSDK.mockReturnValue({
      state: {
        getTopTokensByLifetimeFees: vi.fn().mockResolvedValue(mockItems),
      },
    });

    const result = await getCreatorsForGrid();

    // Falls back to ALL results since no curated matches
    expect(result.length).toBe(2);
  });
});

describe("extractCardData", () => {
  it("extracts handle from creators[0].twitterUsername, falls back to username, then 'unknown'", () => {
    // With twitterUsername
    const withTwitter = extractCardData(
      makeMockItem({
        creators: [
          {
            username: "user1",
            pfp: "pfp.png",
            twitterUsername: "twitterHandle",
            royaltyBps: 500,
            isCreator: true,
            wallet: "w",
            provider: "twitter",
            providerUsername: "twitterHandle",
          },
        ],
      }) as any,
    );
    expect(withTwitter.handle).toBe("twitterHandle");

    // Without twitterUsername, falls back to username
    const withUsername = extractCardData(
      makeMockItem({
        creators: [
          {
            username: "fallbackUser",
            pfp: "pfp.png",
            royaltyBps: 500,
            isCreator: true,
            wallet: "w",
            provider: "twitter",
            providerUsername: null,
          },
        ],
      }) as any,
    );
    expect(withUsername.handle).toBe("fallbackUser");

    // No creators at all
    const noCreators = extractCardData(
      makeMockItem({ creators: null }) as any,
    );
    expect(noCreators.handle).toBe("unknown");
  });

  it("returns null for priceUsd when tokenLatestPrice is null", () => {
    const result = extractCardData(
      makeMockItem({ tokenLatestPrice: null }) as any,
    );
    expect(result.priceUsd).toBeNull();
  });

  it("returns null for holderCount when tokenInfo is null", () => {
    const result = extractCardData(
      makeMockItem({
        tokenInfo: null,
      }) as any,
    );
    expect(result.holderCount).toBeNull();
  });
});

describe("sanitizeHandle", () => {
  it('sanitizeHandle("@ElonMusk") returns "ElonMusk"', () => {
    expect(sanitizeHandle("@ElonMusk")).toBe("ElonMusk");
  });

  it('sanitizeHandle("hello world!@#") returns "helloworld"', () => {
    expect(sanitizeHandle("hello world!@#")).toBe("helloworld");
  });

  it('sanitizeHandle("valid_handle_123") returns "valid_handle_123"', () => {
    expect(sanitizeHandle("valid_handle_123")).toBe("valid_handle_123");
  });

  it('sanitizeHandle("@") returns ""', () => {
    expect(sanitizeHandle("@")).toBe("");
  });

  it('sanitizeHandle("") returns ""', () => {
    expect(sanitizeHandle("")).toBe("");
  });
});
