import { NextRequest, NextResponse } from "next/server";
import { getBagsSDK } from "@/lib/bags";
import { cache } from "@/lib/cache";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const sanitized = handle.replace(/[^a-zA-Z0-9_]/g, "");
  if (!sanitized) {
    return NextResponse.json({ error: "Invalid handle" }, { status: 400 });
  }

  const cacheKey = `creator:${sanitized}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const sdk = getBagsSDK();
    const data = await sdk.state.getLaunchWalletV2(sanitized, "twitter");
    const serialized = {
      provider: data.provider,
      platformData: data.platformData,
      wallet: data.wallet?.toBase58() ?? null,
    };
    cache.set(cacheKey, serialized, 30_000);
    return NextResponse.json(serialized);
  } catch (error) {
    console.error(`Failed to fetch creator data for ${sanitized}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch creator data" },
      { status: 502 },
    );
  }
}
