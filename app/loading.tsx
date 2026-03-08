export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </main>
  );
}
