"use client";

import { useState, useCallback, useEffect } from "react";

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground shadow-lg">
      {message}
    </div>
  );
}

export function LaunchPrompt({ handle }: { handle: string }) {
  const [toast, setToast] = useState<string | null>(null);
  const dismiss = useCallback(() => setToast(null), []);

  return (
    <section className="relative flex w-full max-w-2xl flex-col items-center gap-4 py-8 text-center">
      {toast && <Toast message={toast} onDone={dismiss} />}

      <p className="text-lg text-foreground">
        No token yet. Be the first to back @{handle}!
      </p>

      <button
        onClick={() => setToast("Coming soon")}
        className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Launch Token
      </button>
      <p className="text-sm text-muted-foreground">(0.2 SOL)</p>
    </section>
  );
}
