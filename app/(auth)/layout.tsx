export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-blueprint flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <span aria-hidden="true" className="h-4 w-1.5 rounded-sm bg-amber" />
        <span className="font-display text-lg font-bold tracking-tight text-ink">
          Workbench
        </span>
      </div>
      <div className="w-full max-w-sm rounded-lg border border-line bg-paper p-6 shadow-ticket">
        {children}
      </div>
    </main>
  );
}
