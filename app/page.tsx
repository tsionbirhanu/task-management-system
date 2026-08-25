import { redirect } from "next/navigation";

import { getCurrentUser, isAuthConfigured } from "@/lib/auth/session";

/** Reads the session cookie, so it can never be prerendered as static HTML. */
export const dynamic = "force-dynamic";

export default async function RootPage() {
  // Preview mode: no auth to check, so go straight to the board.
  if (!isAuthConfigured()) redirect("/board");

  const user = await getCurrentUser();
  redirect(user ? "/board" : "/login");
}
