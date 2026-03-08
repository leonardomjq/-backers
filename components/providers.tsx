"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { privyConfig } from "@/lib/privy";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const isDevPlaceholder = !privyAppId || privyAppId === "dev-placeholder";

export function Providers({ children }: { children: React.ReactNode }) {
  if (isDevPlaceholder) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      {children}
    </PrivyProvider>
  );
}
