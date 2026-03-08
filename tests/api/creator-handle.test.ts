import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

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

import { GET } from "@/app/api/creator/[handle]/route";
import { getBagsSDK } from "@/lib/bags";
import { cache } from "@/lib/cache";

const mockGetBagsSDK = getBagsSDK as ReturnType<typeof vi.fn>;
const mockCacheGet = cache.get as ReturnType<typeof vi.fn>;
const mockCacheSet = cache.set as ReturnType<typeof vi.fn>;

const mockCreatorData = {
  provider: "twitter",
  platformData: {
    username: "elonmusk",
    displayName: "Elon Musk",
    avatarUrl: "https://pbs.twimg.com/photo.jpg",
  },
  wallet: {
    toBase58: () => "So11111111111111111111111111111111111111112",
  },
};

const mockCreatorDataNoWallet = {
  provider: "twitter",
  platformData: {
    username: "notoken_user",
    displayName: "No Token User",
    avatarUrl: null,
  },
  wallet: null,
};

function makeRequest(handle: string) {
  const request = new NextRequest(
    new URL(`http://localhost:3000/api/creator/${handle}`),
  );
  const params = Promise.resolve({ handle });
  return { request, params };
}

describe("GET /api/creator/[handle]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with creator data for valid handle", async () => {
    const { request, params } = makeRequest("elonmusk");
    mockCacheGet.mockReturnValue(null);
    mockGetBagsSDK.mockReturnValue({
      state: {
        getLaunchWalletV2: vi.fn().mockResolvedValue(mockCreatorData),
      },
    });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.provider).toBe("twitter");
    expect(data.platformData.username).toBe("elonmusk");
    expect(data.wallet).toBe("So11111111111111111111111111111111111111112");
  });

  it("returns 400 for handle with only special characters", async () => {
    const { request, params } = makeRequest("@#$%^&*");
    mockCacheGet.mockReturnValue(null);

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid handle" });
  });

  it("returns cached data within TTL", async () => {
    const { request, params } = makeRequest("cached_user");
    const cachedData = {
      provider: "twitter",
      platformData: { username: "cached_user" },
      wallet: "SomeBase58Address",
    };
    mockCacheGet.mockReturnValue(cachedData);

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(cachedData);
    expect(mockGetBagsSDK).not.toHaveBeenCalled();
  });

  it("returns 502 when SDK throws", async () => {
    const { request, params } = makeRequest("error_user");
    mockCacheGet.mockReturnValue(null);
    mockGetBagsSDK.mockReturnValue({
      state: {
        getLaunchWalletV2: vi
          .fn()
          .mockRejectedValue(new Error("SDK error")),
      },
    });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data).toEqual({ error: "Failed to fetch creator data" });
  });

  it("returns wallet as base58 string when wallet exists", async () => {
    const { request, params } = makeRequest("has_wallet");
    mockCacheGet.mockReturnValue(null);
    mockGetBagsSDK.mockReturnValue({
      state: {
        getLaunchWalletV2: vi.fn().mockResolvedValue(mockCreatorData),
      },
    });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(typeof data.wallet).toBe("string");
    expect(data.wallet).toBe("So11111111111111111111111111111111111111112");
  });

  it("returns wallet as null when creator has no token", async () => {
    const { request, params } = makeRequest("no_token");
    mockCacheGet.mockReturnValue(null);
    mockGetBagsSDK.mockReturnValue({
      state: {
        getLaunchWalletV2: vi.fn().mockResolvedValue(mockCreatorDataNoWallet),
      },
    });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(data.wallet).toBeNull();
  });

  it("caches data with 30s TTL after successful SDK call", async () => {
    const { request, params } = makeRequest("cache_test");
    mockCacheGet.mockReturnValue(null);
    mockGetBagsSDK.mockReturnValue({
      state: {
        getLaunchWalletV2: vi.fn().mockResolvedValue(mockCreatorDataNoWallet),
      },
    });

    await GET(request, { params });

    expect(mockCacheSet).toHaveBeenCalledWith(
      "creator:cache_test",
      expect.any(Object),
      30_000,
    );
  });
});
