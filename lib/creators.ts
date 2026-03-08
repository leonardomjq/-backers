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

const MOCK_CREATORS: CreatorCardData[] = [
  { handle: "elonmusk", displayName: "Elon Musk", avatarUrl: null, priceUsd: 12.34, holderCount: 4821, tokenMint: "mock-1" },
  { handle: "MrBeast", displayName: "MrBeast", avatarUrl: null, priceUsd: 8.91, holderCount: 3102, tokenMint: "mock-2" },
  { handle: "ninja", displayName: "Ninja", avatarUrl: null, priceUsd: 5.67, holderCount: 1987, tokenMint: "mock-3" },
  { handle: "pokabornt", displayName: "Poka", avatarUrl: null, priceUsd: 3.45, holderCount: 892, tokenMint: "mock-4" },
  { handle: "timthetatman", displayName: "TimTheTatman", avatarUrl: null, priceUsd: 2.10, holderCount: 654, tokenMint: "mock-5" },
  { handle: "kaicenat", displayName: "Kai Cenat", avatarUrl: null, priceUsd: 7.23, holderCount: 2341, tokenMint: "mock-6" },
];

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
    if (!sdk) return MOCK_CREATORS;
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

// ---------------------------------------------------------------------------
// Creator Page Data Layer
// ---------------------------------------------------------------------------

export interface CreatorPageData {
  profile: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    wallet: string | null;
  };
  token: {
    mint: string;
    name: string;
    symbol: string;
    icon: string | null;
    price: number | null;
    marketCap: number | null;
    volume: number | null;
    holders: number | null;
    lifetimeFees: string;
    status: "graduated" | "bonding-curve" | "migrating" | "pre-launch";
  } | null;
}

// -- Number formatters --

export function formatPrice(usd: number | null): string {
  if (usd === null) return "N/A";
  if (usd < 0.001) return `$${usd.toFixed(6)}`;
  if (usd < 1) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}

export function formatMarketCap(mcap: number | null): string {
  if (mcap === null) return "N/A";
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(mcap);
}

export function formatVolume(volume: number | null): string {
  if (volume === null) return "N/A";
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(volume);
}

export function formatHolders(count: number | null): string {
  if (count === null) return "N/A";
  return Intl.NumberFormat("en-US", { notation: "compact" }).format(count);
}

export function formatFees(lamportsStr: string): string {
  const lamports = parseInt(lamportsStr, 10);
  if (isNaN(lamports)) return "N/A";
  const sol = lamports / 1_000_000_000;
  return `${sol.toFixed(4)} SOL`;
}

// -- Token status derivation --

export function deriveTokenStatus(
  tokenInfo: { graduatedPool?: string; bondingCurve?: number } | null,
): "graduated" | "bonding-curve" | "migrating" | "pre-launch" {
  if (!tokenInfo) return "pre-launch";
  if (tokenInfo.graduatedPool) return "graduated";
  if (tokenInfo.bondingCurve !== undefined) return "bonding-curve";
  return "pre-launch";
}

// -- Mock data for dev mode --

function getMockCreatorPageData(handle: string): CreatorPageData {
  const knownHandles = MOCK_CREATORS.map((c) => c.handle.toLowerCase());
  const hasToken = knownHandles.includes(handle.toLowerCase());

  return {
    profile: {
      username: handle,
      displayName: handle.charAt(0).toUpperCase() + handle.slice(1),
      avatarUrl: null,
      wallet: null,
    },
    token: hasToken
      ? {
          mint: "mock-token-mint",
          name: `${handle}Token`,
          symbol: handle.slice(0, 3).toUpperCase(),
          icon: null,
          price: 1.23,
          marketCap: 500_000,
          volume: 25_000,
          holders: 150,
          lifetimeFees: "2500000000",
          status: "bonding-curve",
        }
      : null,
  };
}

// -- Main data fetcher --

const CREATOR_PAGE_CACHE_TTL_MS = 30_000;

export async function getCreatorPageData(
  handle: string,
): Promise<CreatorPageData> {
  const sanitized = sanitizeHandle(handle);

  const cacheKey = `creator-page:${sanitized}`;
  const cached = cache.get<CreatorPageData>(cacheKey);
  if (cached) return cached;

  const sdk = getBagsSDK();
  if (!sdk) return getMockCreatorPageData(sanitized);

  try {
    const [walletData, leaderboard] = await Promise.all([
      sdk.state.getLaunchWalletV2(sanitized, "twitter"),
      sdk.state.getTopTokensByLifetimeFees(),
    ]);

    // Find token by matching twitter username (case-insensitive)
    const tokenItem = leaderboard.find(
      (item: BagsTokenLeaderBoardItem) =>
        item.creators?.some(
          (c) =>
            c.twitterUsername?.toLowerCase() === sanitized.toLowerCase(),
        ),
    );

    const result: CreatorPageData = {
      profile: {
        username: walletData.platformData.username,
        displayName: walletData.platformData.display_name,
        avatarUrl: walletData.platformData.avatar_url ?? null,
        wallet: walletData.wallet?.toBase58() ?? null,
      },
      token: tokenItem
        ? {
            mint: tokenItem.token,
            name: tokenItem.tokenInfo?.name ?? "Unknown",
            symbol: tokenItem.tokenInfo?.symbol ?? "???",
            icon: tokenItem.tokenInfo?.icon ?? null,
            price: tokenItem.tokenLatestPrice?.priceUSD ?? null,
            marketCap: tokenItem.tokenInfo?.mcap ?? null,
            volume: tokenItem.tokenLatestPrice?.volumeUSD ?? null,
            holders: tokenItem.tokenInfo?.holderCount ?? null,
            lifetimeFees: tokenItem.lifetimeFees,
            status: deriveTokenStatus(tokenItem.tokenInfo ?? null),
          }
        : null,
    };

    cache.set(cacheKey, result, CREATOR_PAGE_CACHE_TTL_MS);
    return result;
  } catch (error) {
    console.error(
      `Failed to fetch creator page data for ${sanitized}:`,
      error,
    );
    // On error, return profile with just the handle text, token=null
    return {
      profile: {
        username: sanitized,
        displayName: sanitized,
        avatarUrl: null,
        wallet: null,
      },
      token: null,
    };
  }
}
