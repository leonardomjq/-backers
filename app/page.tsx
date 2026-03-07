import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-5xl font-bold tracking-tight">
        Back your favorite creators
      </h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Buy Bags tokens to support the creators you believe in — powered by
        Solana.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Get Started
      </Link>
    </main>
  );
}
