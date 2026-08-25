import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  // Preview mode: no auth to check, so go straight to the board.
  if (!isSupabaseConfigured()) redirect("/board");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/board" : "/login");
}
