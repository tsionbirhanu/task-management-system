import { redirect } from "next/navigation";

import { getCurrentUser, isAuthConfigured } from "@/lib/auth/session";

export default async function RootPage() {
  // Preview mode: no auth to check, so go straight to the board.
  if (!isAuthConfigured()) redirect("/board");

  const user = await getCurrentUser();
  redirect(user ? "/board" : "/login");
}
