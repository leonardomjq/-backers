import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// Mock dependencies before importing the route handler
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

import { GET } from "@/app/api/creators/route";
import { getBagsSDK } from "@/lib/bags";
import { cache } from "@/lib/cache";

const mockGetBagsSDK = getBagsSDK as ReturnType<typeof vi.fn>;
const mockCacheGet = cache.get as ReturnType<typeof vi.fn>;
const mockCacheSet = cache.set as ReturnType<typeof vi.fn>;

const mockTokenData = [
  {
    token: "token1",
    lifetimeFees: 1000,
    tokenInfo: { name: "Creator1", symbol: "CR1" },
    creators: ["creator1"],
    tokenSupply: 1000000,
    tokenLatestPrice: 0.5,
  },
  {
    token: "token2",
    lifetimeFees: 500,
    tokenInfo: { name: "Creator2", symbol: "CR2" },
    creators: ["creator2"],
    tokenSupply: 500000,
    tokenLatestPrice: 0.25,
  },
];

describe("GET /api/creators", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with array of token data", async () => {
    mockCacheGet.mockReturnValue(null);
    mockGetBagsSDK.mockReturnValue({
      state: {
        getTopTokensByLifetimeFees: vi.fn().mockResolvedValue(mockTokenData),
      },
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockTokenData);
  });

  it("returns cached data on second call without hitting SDK", async () => {
    mockCacheGet.mockReturnValue(mockTokenData);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockTokenData);
    expect(mockGetBagsSDK).not.toHaveBeenCalled();
  });

  it("caches data with 30s TTL after successful SDK call", async () => {
    mockCacheGet.mockReturnValue(null);
    mockGetBagsSDK.mockReturnValue({
      state: {
        getTopTokensByLifetimeFees: vi.fn().mockResolvedValue(mockTokenData),
      },
    });

    await GET();

    expect(mockCacheSet).toHaveBeenCalledWith(
      "creators:top",
      mockTokenData,
      30_000,
    );
  });

  it("returns 502 with error message when SDK throws", async () => {
    mockCacheGet.mockReturnValue(null);
    mockGetBagsSDK.mockReturnValue({
      state: {
        getTopTokensByLifetimeFees: vi
          .fn()
          .mockRejectedValue(new Error("API down")),
      },
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data).toEqual({ error: "Failed to fetch creators" });
  });
});
