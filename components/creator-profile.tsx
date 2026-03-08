import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import type { CreatorPageData } from "@/lib/creators";

export function CreatorProfile({
  profile,
  status,
}: {
  profile: CreatorPageData["profile"];
  status: "graduated" | "bonding-curve" | "migrating" | "pre-launch" | null;
}) {
  return (
    <section className="flex flex-col items-center gap-4">
      <Link
        href="/"
        className="self-start text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        &larr; Back
      </Link>

      {profile.avatarUrl ? (
        <Image
          src={profile.avatarUrl}
          alt={profile.displayName}
          width={96}
          height={96}
          className="rounded-full"
          unoptimized
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 text-3xl font-bold text-primary-foreground">
          {profile.displayName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">
          {profile.displayName}
        </h1>
        <p className="text-muted-foreground">@{profile.username}</p>
      </div>

      {status && <StatusBadge status={status} />}
    </section>
  );
}
