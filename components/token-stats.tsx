import {
  formatPrice,
  formatMarketCap,
  formatVolume,
  formatHolders,
} from "@/lib/creators";
import type { CreatorPageData } from "@/lib/creators";

type Token = NonNullable<CreatorPageData["token"]>;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-sm uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-lg font-semibold text-accent">{value}</p>
    </div>
  );
}

export function TokenStats({ token }: { token: Token }) {
  return (
    <section className="w-full max-w-2xl">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Price" value={formatPrice(token.price)} />
        <Stat label="Market Cap" value={formatMarketCap(token.marketCap)} />
        <Stat label="Volume" value={formatVolume(token.volume)} />
        <Stat label="Holders" value={formatHolders(token.holders)} />
      </div>
    </section>
  );
}
