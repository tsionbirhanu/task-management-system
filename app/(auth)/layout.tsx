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
    <main className="bg-blueprint flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <section className="w-full max-w-md">
        <div className="mb-7 flex items-center justify-center gap-2">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-lg bg-progress text-paper shadow-ticket"
          >
            <span className="font-display text-sm font-black">W</span>
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Workbench
          </span>
        </div>

        <div className="rounded-[1.15rem] border border-line bg-paper/95 p-6 shadow-panel backdrop-blur sm:p-7">
          {children}
        </div>
      </section>
    </main>
  );
}
