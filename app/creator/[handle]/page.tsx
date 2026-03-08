import type { Metadata } from "next";
import { getCreatorPageData, sanitizeHandle } from "@/lib/creators";
import { CreatorProfile } from "@/components/creator-profile";
import { TokenStats } from "@/components/token-stats";
import { FeeEarnings } from "@/components/fee-earnings";
import { TradeButtons } from "@/components/trade-buttons";
import { LaunchPrompt } from "@/components/launch-prompt";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const sanitized = sanitizeHandle(handle);
  return {
    title: `@${sanitized} - Backers`,
  };
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const data = await getCreatorPageData(handle);

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <CreatorProfile
          profile={data.profile}
          status={data.token?.status ?? null}
        />

        {data.token ? (
          <div className="mt-8 flex flex-col items-center gap-6">
            <TokenStats token={data.token} />
            <FeeEarnings lifetimeFees={data.token.lifetimeFees} />
            <TradeButtons handle={data.profile.username} />
          </div>
        ) : (
          <LaunchPrompt handle={data.profile.username} />
        )}
      </div>
    </main>
  );
}
