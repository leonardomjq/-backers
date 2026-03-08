import Image from "next/image";
import Link from "next/link";
import type { CreatorCardData } from "@/lib/creators";

export function CreatorCard({
  handle,
  displayName,
  avatarUrl,
  priceUsd,
  holderCount,
  tokenMint,
}: CreatorCardData) {
  return (
    <Link
      href={`/creator/${handle}`}
      className="group rounded-xl border border-border bg-muted p-6 transition-colors hover:border-primary/50 hover:bg-muted/80"
    >
      <div className="flex flex-col items-center gap-3">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={80}
            height={80}
            className="rounded-full"
            unoptimized
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary-foreground">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="text-center">
          <p className="font-semibold text-foreground group-hover:text-primary">
            {displayName}
          </p>
          <p className="text-sm text-muted-foreground">@{handle}</p>
        </div>

        <div className="text-center">
          <p className="text-accent">
            {priceUsd !== null ? `$${priceUsd.toFixed(4)}` : "N/A"}
          </p>
          {holderCount !== null && (
            <p className="text-sm text-muted-foreground">
              {holderCount} backers
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
