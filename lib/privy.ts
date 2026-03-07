import type { PrivyClientConfig } from "@privy-io/react-auth";

export const privyConfig: PrivyClientConfig = {
  loginMethods: ["google", "email"],
  appearance: {
    theme: "dark",
  },
  embeddedWallets: {
    solana: {
      createOnLogin: "all-users",
    },
  },
  solanaClusters: [
    {
      name: "mainnet-beta",
      rpcUrl: process.env.NEXT_PUBLIC_HELIUS_RPC_URL || "https://api.mainnet-beta.solana.com",
    },
  ],
};
