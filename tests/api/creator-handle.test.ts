import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock lib/creators instead of bags SDK directly — the route is now thin
vi.mock("@/lib/creators", () => ({
  sanitizeHandle: vi.fn(),
  getCreatorPageData: vi.fn(),
}));

import { GET } from "@/app/api/creator/[handle]/route";
import { sanitizeHandle, getCreatorPageData } from "@/lib/creators";
import type { CreatorPageData } from "@/lib/creators";

const mockSanitizeHandle = sanitizeHandle as ReturnType<typeof vi.fn>;
const mockGetCreatorPageData = getCreatorPageData as ReturnType<typeof vi.fn>;

const mockCreatorPageData: CreatorPageData = {
  profile: {
    username: "elonmusk",
    displayName: "Elon Musk",
    avatarUrl: "https://pbs.twimg.com/photo.jpg",
    wallet: "So11111111111111111111111111111111111111112",
  },
  token: {
    mint: "tokenMint123",
    name: "ElonToken",
    symbol: "ELON",
    icon: "https://example.com/icon.png",
    price: 0.05,
    marketCap: 1_000_000,
    volume: 250_000,
    holders: 500,
    lifetimeFees: "5000000000",
    status: "graduated",
  },
};

const mockCreatorNoToken: CreatorPageData = {
  profile: {
    username: "notoken_user",
    displayName: "No Token User",
    avatarUrl: null,
    wallet: null,
  },
  token: null,
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

  it("returns 200 with CreatorPageData shape for valid handle", async () => {
    const { request, params } = makeRequest("elonmusk");
    mockSanitizeHandle.mockReturnValue("elonmusk");
    mockGetCreatorPageData.mockResolvedValue(mockCreatorPageData);

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.profile.username).toBe("elonmusk");
    expect(data.profile.displayName).toBe("Elon Musk");
    expect(data.profile.wallet).toBe("So11111111111111111111111111111111111111112");
    expect(data.token).not.toBeNull();
    expect(data.token.mint).toBe("tokenMint123");
    expect(data.token.price).toBe(0.05);
    expect(data.token.marketCap).toBe(1_000_000);
    expect(data.token.volume).toBe(250_000);
    expect(data.token.holders).toBe(500);
    expect(data.token.lifetimeFees).toBe("5000000000");
    expect(data.token.status).toBe("graduated");
  });

  it("returns 400 for handle with only special characters", async () => {
    const { request, params } = makeRequest("@#$%^&*");
    mockSanitizeHandle.mockReturnValue("");

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid handle" });
    expect(mockGetCreatorPageData).not.toHaveBeenCalled();
  });

  it("calls getCreatorPageData with sanitized handle", async () => {
    const { request, params } = makeRequest("@ElonMusk");
    mockSanitizeHandle.mockReturnValue("ElonMusk");
    mockGetCreatorPageData.mockResolvedValue(mockCreatorPageData);

    await GET(request, { params });

    expect(mockSanitizeHandle).toHaveBeenCalledWith("@ElonMusk");
    expect(mockGetCreatorPageData).toHaveBeenCalledWith("ElonMusk");
  });

  it("returns CreatorPageData with token=null for creator without a token", async () => {
    const { request, params } = makeRequest("notoken_user");
    mockSanitizeHandle.mockReturnValue("notoken_user");
    mockGetCreatorPageData.mockResolvedValue(mockCreatorNoToken);

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.profile.username).toBe("notoken_user");
    expect(data.token).toBeNull();
  });

  it("returns 200 even when SDK errors occur (getCreatorPageData handles errors)", async () => {
    const { request, params } = makeRequest("error_user");
    mockSanitizeHandle.mockReturnValue("error_user");
    // getCreatorPageData always returns valid data, even on SDK errors
    mockGetCreatorPageData.mockResolvedValue({
      profile: {
        username: "error_user",
        displayName: "error_user",
        avatarUrl: null,
        wallet: null,
      },
      token: null,
    });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.profile.username).toBe("error_user");
    expect(data.token).toBeNull();
  });

  it("strips leading @ from handle via sanitizeHandle", async () => {
    const { request, params } = makeRequest("@testuser");
    mockSanitizeHandle.mockReturnValue("testuser");
    mockGetCreatorPageData.mockResolvedValue(mockCreatorNoToken);

    await GET(request, { params });

    expect(mockSanitizeHandle).toHaveBeenCalledWith("@testuser");
  });

  it("returns enriched token data with all stat fields", async () => {
    const { request, params } = makeRequest("creator_with_stats");
    mockSanitizeHandle.mockReturnValue("creator_with_stats");
    mockGetCreatorPageData.mockResolvedValue(mockCreatorPageData);

    const response = await GET(request, { params });
    const data = await response.json();

    // Verify all enriched fields are present
    expect(data.token).toHaveProperty("mint");
    expect(data.token).toHaveProperty("name");
    expect(data.token).toHaveProperty("symbol");
    expect(data.token).toHaveProperty("icon");
    expect(data.token).toHaveProperty("price");
    expect(data.token).toHaveProperty("marketCap");
    expect(data.token).toHaveProperty("volume");
    expect(data.token).toHaveProperty("holders");
    expect(data.token).toHaveProperty("lifetimeFees");
    expect(data.token).toHaveProperty("status");
  });
});
