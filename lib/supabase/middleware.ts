import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

/**
 * Refreshes the auth session on every matched request and mirrors the rotated
 * cookies onto both the request (for this render) and the response (for the
 * browser). Without this, expired tokens are never renewed server-side.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Preview mode: no Supabase project yet, so there is no session to refresh.
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Do not remove: this call is what actually refreshes the token.
  await supabase.auth.getUser();

  return response;
}
