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
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-line bg-paper/85 shadow-panel backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden min-h-[38rem] flex-col justify-between bg-progress p-8 text-paper lg:flex">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-paper text-progress">
              <span className="h-4 w-4 rounded bg-progress" />
            </span>
            <div>
              <p className="font-display text-lg font-bold">Workbench</p>
              <p className="font-body text-xs text-paper/70">Task command center</p>
            </div>
          </div>

          <div>
            <p className="font-body text-sm font-semibold text-paper/75">Plan, move, finish.</p>
            <h1 className="mt-3 max-w-md font-display text-4xl font-bold leading-tight tracking-tight">
              Keep every work order in motion.
            </h1>
            <p className="mt-4 max-w-md font-body text-sm leading-6 text-paper/75">
              A focused board for priorities, due dates, reminders, and the next
              thing your day needs.
            </p>
          </div>

          <div className="grid gap-3 rounded-3xl bg-paper/10 p-4">
            {["Design landing page", "Implement reminders", "Ship final polish"].map(
              (item, index) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl bg-paper/95 px-4 py-3 text-ink"
                >
                  <span className="font-body text-sm font-semibold">{item}</span>
                  <span className="rounded-full bg-progress/10 px-2 py-1 font-mono text-[11px] font-semibold text-progress">
                    {index === 0 ? "To Do" : index === 1 ? "Doing" : "Done"}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="flex min-h-[38rem] flex-col justify-center p-6 sm:p-8">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-progress text-paper">
              <span className="h-3.5 w-3.5 rounded bg-paper" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              Workbench
            </span>
          </div>
          <div className="mx-auto w-full max-w-md rounded-[1.5rem] border border-line bg-paper p-6 shadow-ticket">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
