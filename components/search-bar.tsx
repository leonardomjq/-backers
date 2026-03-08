"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { sanitizeHandle } from "@/lib/creators";

export function SearchBar() {
  const [handle, setHandle] = useState("");
  const router = useRouter();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const sanitized = sanitizeHandle(handle);
    if (sanitized) {
      router.push(`/creator/${sanitized}`);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2">
      <input
        type="text"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        placeholder="Search any Twitter handle..."
        className="flex-1 rounded-lg border border-border bg-muted px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
      >
        Search
      </button>
    </form>
  );
}
