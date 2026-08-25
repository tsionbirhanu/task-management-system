import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

/** Reads the session cookie, so it can never be prerendered as static HTML. */
export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The other half of the guard: someone already signed in has no business on
  // /login or /signup, so bounce them to the board.
  const user = await getCurrentUser();
  if (user?.emailVerified) redirect("/board");

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
