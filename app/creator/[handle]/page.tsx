export default async function CreatorPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-4xl font-bold">@{handle}</h1>
      <p className="text-muted-foreground">Creator page coming soon.</p>
    </main>
  );
}
