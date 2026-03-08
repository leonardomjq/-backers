import { getCreatorsForGrid } from "@/lib/creators";
import { CreatorCard } from "@/components/creator-card";

export async function CreatorGrid() {
  const creators = await getCreatorsForGrid();

  if (creators.length === 0) {
    return (
      <p className="text-muted-foreground">
        No creators available yet. Check back soon!
      </p>
    );
  }

  return (
    <section className="w-full max-w-6xl">
      <h2 className="mb-6 text-xl font-semibold text-foreground">
        Trending Creators
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {creators.map((item) => (
          <CreatorCard key={item.tokenMint} {...item} />
        ))}
      </div>
    </section>
  );
}
