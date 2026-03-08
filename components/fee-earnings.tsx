import { formatFees } from "@/lib/creators";

export function FeeEarnings({ lifetimeFees }: { lifetimeFees: string }) {
  return (
    <section className="w-full max-w-2xl border-t border-border pt-6 text-center">
      <p className="text-sm uppercase tracking-wide text-muted-foreground">
        Fee Earnings
      </p>
      <p className="mt-1 text-xl font-semibold text-foreground">
        {formatFees(lifetimeFees)}
      </p>
    </section>
  );
}
