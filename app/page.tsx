import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { SearchBar } from "@/components/search-bar";
import { CreatorGrid } from "@/components/creator-grid";
import { GridSkeleton } from "@/components/grid-skeleton";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-12 px-4 py-16">
      <Hero />
      <SearchBar />
      <Suspense fallback={<GridSkeleton />}>
        <CreatorGrid />
      </Suspense>
    </main>
  );
}
