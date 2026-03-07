import { Connection } from "@solana/web3.js";

let connection: Connection | null = null;

export function getHeliusConnection(): Connection {
  if (!connection) {
    const rpcUrl = process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
    if (!rpcUrl) throw new Error("NEXT_PUBLIC_HELIUS_RPC_URL is not set");
    connection = new Connection(rpcUrl, "confirmed");
  }
  return connection;
}
