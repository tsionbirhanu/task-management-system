import { NextResponse } from "next/server";

import { isAuthConfigured } from "@/lib/auth/env";
import { getAuth } from "@/lib/auth/neon-auth";

/**
 * Logout as a route handler rather than a server action, matching how the rest
 * of this app talks to the server. The user menu posts a plain form here, so it
 * works with JavaScript disabled.
 *
 * The SDK clears the httpOnly session cookie; nothing about the session is ever
 * stored in localStorage for us to clean up.
 */
export async function POST(request: Request) {
  if (isAuthConfigured()) {
    try {
      await getAuth().signOut();
    } catch {
      // Already signed out, or the auth service is unreachable. Either way the
      // person asked to leave, so send them on rather than showing an error.
    }
  }

  // 303 so the browser follows with GET instead of re-POSTing to /login.
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
