import { redirect } from "next/navigation";

import { TopBar } from "@/components/layout/TopBar";
import { getCurrentUser, isAuthConfigured } from "@/lib/auth/session";

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
    email = user.email;
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
