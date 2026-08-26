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
    <main className="bg-blueprint flex min-h-screen items-center justify-center px-4 py-8">
      <section className="flex w-full max-w-md flex-col justify-center">
        {/* Same mark as the board's top bar -- one logo, defined the same way
            in both places, so signing in and landing on the board look like the
            same product. */}
        <div className="mb-8 flex items-center justify-center gap-2">
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
        <div className="w-full rounded-[1.5rem] border border-line bg-paper p-6 shadow-ticket">
          {children}
        </div>
      </section>
    </main>
  );
}
