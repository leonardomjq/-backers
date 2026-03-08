import { NextResponse } from "next/server";
import { getBagsSDK } from "@/lib/bags";
import { cache } from "@/lib/cache";

export async function GET() {
  const cacheKey = "creators:top";
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const sdk = getBagsSDK();
    const data = await sdk.state.getTopTokensByLifetimeFees();
    cache.set(cacheKey, data, 30_000);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch creators:", error);
    return NextResponse.json(
      { error: "Failed to fetch creators" },
      { status: 502 },
    );
  }
}
