import { BagsSDK } from "@bagsfm/bags-sdk";
import { getHeliusConnection } from "./helius";

let sdk: BagsSDK | null = null;

export function getBagsSDK(): BagsSDK | null {
  if (!sdk) {
    const apiKey = process.env.BAGS_API_KEY;
    if (!apiKey || apiKey === "dev-placeholder") {
      return null;
    }
    sdk = new BagsSDK(apiKey, getHeliusConnection());
  }
  return sdk;
}
