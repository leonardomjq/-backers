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

export function TradeButtons({ handle }: { handle: string }) {
  const [toast, setToast] = useState<string | null>(null);
  const dismiss = useCallback(() => setToast(null), []);

  return (
    <div className="relative flex w-full max-w-2xl items-center justify-center gap-3">
      {toast && <Toast message={toast} onDone={dismiss} />}

      <button
        onClick={() => setToast("Coming soon")}
        className="rounded-lg bg-accent px-6 py-3 font-semibold text-background transition-colors hover:bg-accent/90"
      >
        Buy Shares
      </button>
      <button
        onClick={() => setToast("Coming soon")}
        className="rounded-lg border border-border px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
      >
        Sell Shares
      </button>
    </div>
  );
}
