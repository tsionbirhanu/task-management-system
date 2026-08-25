import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  assertSupabaseConfigured,
} from "@/lib/supabase/env";

/**
 * Supabase client for server components and route handlers. Create it per
 * request -- never hoist it to a module-level singleton, or one visitor's
 * session leaks into another visitor's request.
 */
export function createClient() {
  assertSupabaseConfigured();
  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. The middleware refreshes
          // the session on every request, so this is safe to swallow.
        }
      },
    },
  });
}
