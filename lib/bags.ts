import { BagsSDK } from "@bagsfm/bags-sdk";
import { getHeliusConnection } from "./helius";

let sdk: BagsSDK | null = null;

export function getBagsSDK(): BagsSDK {
  if (!sdk) {
    const apiKey = process.env.BAGS_API_KEY;
    if (!apiKey) throw new Error("BAGS_API_KEY is not set");
    sdk = new BagsSDK(apiKey, getHeliusConnection());
  }
  return sdk;
}
