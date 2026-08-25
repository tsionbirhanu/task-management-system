import { createBrowserClient } from "@supabase/ssr";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  assertSupabaseConfigured,
} from "@/lib/supabase/env";

/** Supabase client for client components. Reads the session from cookies. */
export function createClient() {
  assertSupabaseConfigured();
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
