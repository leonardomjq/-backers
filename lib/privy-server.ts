import { PrivyClient } from "@privy-io/node";
import type { NextRequest } from "next/server";

let privyClient: PrivyClient | null = null;

export function getPrivyClient(): PrivyClient {
  if (!privyClient) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    if (!appId) throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
    const appSecret = process.env.PRIVY_APP_SECRET;
    if (!appSecret) throw new Error("PRIVY_APP_SECRET is not set");

    privyClient = new PrivyClient({
      appId,
      appSecret,
    });
  }
  return privyClient;
}

export async function verifyAuth(
  request: NextRequest,
): Promise<{ userId: string }> {
  const token = request.cookies.get("privy-token")?.value;
  if (!token) {
    throw new Error("Not authenticated");
  }

  const client = getPrivyClient();
  const claims = await client.utils().auth().verifyAccessToken(token);
  return { userId: claims.user_id };
}
