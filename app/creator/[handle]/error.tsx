"use client";

import { useEffect } from "react";

export default function CreatorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">Failed to load creator</h1>
      <p className="max-w-md text-muted-foreground">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Try again
      </button>
    </main>
  );
}
