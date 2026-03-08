export default function CreatorLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Back link skeleton */}
        <div className="mb-4 h-4 w-12 animate-pulse rounded bg-border" />

        {/* Avatar skeleton */}
        <div className="flex flex-col items-center gap-4">
          <div className="h-24 w-24 animate-pulse rounded-full bg-border" />

          {/* Name skeleton */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-7 w-40 animate-pulse rounded bg-border" />
            <div className="h-5 w-28 animate-pulse rounded bg-border" />
          </div>

          {/* Badge skeleton */}
          <div className="h-6 w-24 animate-pulse rounded-full bg-border" />
        </div>

        {/* Stats skeleton */}
        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="h-4 w-16 animate-pulse rounded bg-border" />
                <div className="h-6 w-20 animate-pulse rounded bg-border" />
              </div>
            ))}
          </div>

          {/* Fee earnings skeleton */}
          <div className="w-full max-w-2xl border-t border-border pt-6 text-center">
            <div className="mx-auto h-4 w-24 animate-pulse rounded bg-border" />
            <div className="mx-auto mt-2 h-6 w-28 animate-pulse rounded bg-border" />
          </div>

          {/* Buttons skeleton */}
          <div className="flex gap-3">
            <div className="h-12 w-32 animate-pulse rounded-lg bg-border" />
            <div className="h-12 w-32 animate-pulse rounded-lg bg-border" />
          </div>
        </div>
      </div>
    </main>
  );
}
