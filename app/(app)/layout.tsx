import { redirect } from "next/navigation";

import { TopBar } from "@/components/layout/TopBar";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const configured = isSupabaseConfigured();
  let email: string | null = null;

  if (configured) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");
    email = user.email ?? null;
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
 * Shown only while Supabase is unconfigured. It exists so the scaffold can be
 * viewed before a project is provisioned -- and so nobody mistakes an open
 * board for a working auth guard.
 */
function PreviewNotice() {
  return (
    <p
      role="status"
      className="border-b border-amber/30 bg-amber/10 px-4 py-2 text-center font-body text-xs text-ink sm:px-6 lg:px-8"
    >
      Preview mode: Supabase is not configured, so the sign-in guard is off. Add
      your project URL and anon key to{" "}
      <code className="font-mono text-[11px]">.env.local</code> to turn it on.
    </p>
  );
}
