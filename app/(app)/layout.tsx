import { redirect } from "next/navigation";

import { TopBar } from "@/components/layout/TopBar";
import { getCurrentUser, isAuthConfigured } from "@/lib/auth/session";
import { rememberOwner } from "@/lib/db/owners";

/** Reads the session cookie, so it can never be prerendered as static HTML. */
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const configured = isAuthConfigured();
  let email: string | null = null;

  if (configured) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    if (!user.emailVerified) redirect("/confirm-email");
    email = user.email;

    // Past the verification guard, so the address is deliverable. This is the
    // only point where the app holds a user_id and an email together, and the
    // reminder job has no other way to learn it -- see lib/db/owners.ts.
    await rememberOwner(user);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar email={email} />
      {configured ? null : <PreviewNotice />}
      {children}
    </div>
  );
}

/**
 * Shown only while auth is unwired. It exists so the board can be viewed during
 * development -- and so nobody mistakes an open board for a working guard.
 */
function PreviewNotice() {
  return (
    <p
      role="status"
      className="border-b border-amber/30 bg-amber/10 px-4 py-2 text-center font-body text-xs text-ink sm:px-6 lg:px-8"
    >
      Preview mode: no auth provider is wired up yet, so the sign-in guard is
      off. Anyone reaching this page sees the board.
    </p>
  );
}
