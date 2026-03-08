import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Import after mocks are set up
import { middleware } from "@/middleware";

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects /dashboard request without privy-token cookie to /", async () => {
    const request = new NextRequest(
      new URL("/dashboard", "http://localhost:3000"),
    );

    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("passes through /dashboard request with privy-token cookie", async () => {
    const request = new NextRequest(
      new URL("/dashboard", "http://localhost:3000"),
      {
        headers: {
          cookie: "privy-token=some-valid-token",
        },
      },
    );

    const response = middleware(request);

    // NextResponse.next() returns a 200 response
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("passes through / (unprotected) regardless of cookie", async () => {
    const request = new NextRequest(new URL("/", "http://localhost:3000"));

    const response = middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("passes through /creator/handle (unprotected) regardless of cookie", async () => {
    const request = new NextRequest(
      new URL("/creator/elonmusk", "http://localhost:3000"),
    );

    const response = middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects /dashboard/settings without privy-token cookie to /", async () => {
    const request = new NextRequest(
      new URL("/dashboard/settings", "http://localhost:3000"),
    );

    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });
});
