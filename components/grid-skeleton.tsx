export function GridSkeleton() {
  return (
    <section className="w-full max-w-6xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-border bg-muted p-6"
          >
            <div className="flex flex-col items-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-border" />
              <div className="mx-auto mt-3 h-4 w-24 rounded bg-border" />
              <div className="mx-auto mt-2 h-3 w-16 rounded bg-border" />
              <div className="mx-auto mt-4 h-3 w-32 rounded bg-border" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
