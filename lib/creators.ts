import { getBagsSDK } from "@/lib/bags";
import { cache } from "@/lib/cache";
import type { BagsTokenLeaderBoardItem } from "@bagsfm/bags-sdk";

export interface CreatorCardData {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  priceUsd: number | null;
  holderCount: number | null;
  tokenMint: string;
}

export const CURATED_CREATORS = [
  "elonmusk",
  "MrBeast",
  "ninja",
  "pokabornt",
  "timthetatman",
];

/**
 * Strip leading `@` and remove non-alphanumeric/underscore characters.
 */
export function sanitizeHandle(raw: string): string {
  return raw.replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "");
}

/**
 * Extract card-friendly data from a raw SDK leaderboard item.
 */
export function extractCardData(item: BagsTokenLeaderBoardItem): CreatorCardData {
  return {
    handle:
      item.creators?.[0]?.twitterUsername ??
      item.creators?.[0]?.username ??
      "unknown",
    displayName:
      item.tokenInfo?.name ?? item.creators?.[0]?.username ?? "Unknown",
    avatarUrl: item.creators?.[0]?.pfp ?? item.tokenInfo?.icon ?? null,
    priceUsd: item.tokenLatestPrice?.priceUSD ?? null,
    holderCount: item.tokenInfo?.holderCount ?? null,
    tokenMint: item.token,
  };
}

const CACHE_KEY = "landing:creators";
const CACHE_TTL_MS = 30_000;

/**
 * Fetch top creators from Bags SDK, filter by curated list, transform to
 * card-ready data, and cache with 30s TTL.
 */
export async function getCreatorsForGrid(): Promise<CreatorCardData[]> {
  const cached = cache.get<CreatorCardData[]>(CACHE_KEY);
  if (cached) return cached;

  try {
    const sdk = getBagsSDK();
    const items = await sdk.state.getTopTokensByLifetimeFees();
    const allCards = items.map(extractCardData);

    // Filter to curated creators (case-insensitive)
    const curatedLower = CURATED_CREATORS.map((c) => c.toLowerCase());
    const filtered = allCards.filter((card) =>
      curatedLower.includes(card.handle.toLowerCase()),
    );

    // Use filtered if non-empty, otherwise fall back to all results
    const result = filtered.length > 0 ? filtered : allCards;

    cache.set(CACHE_KEY, result, CACHE_TTL_MS);
    return result;
  } catch (error) {
    console.error("Failed to fetch creators for grid:", error);
    return [];
  }
}
