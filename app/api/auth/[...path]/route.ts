import { NextResponse } from "next/server";

import { isAuthConfigured } from "@/lib/auth/env";
import { getAuth } from "@/lib/auth/neon-auth";

/**
 * Neon Auth mounts its whole REST surface here: sign-up, sign-in, sign-out,
 * session. Runs on the Node runtime, which matters -- the SDK compresses
 * session cookies with CompressionStream, and Next 14's Edge runtime has no
 * such global. Route protection therefore lives in app/(app)/layout.tsx rather
 * than in Edge middleware.
 */
function notConfigured() {
  return NextResponse.json(
    {
      error:
        "Auth is not configured. Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET in .env.local, then restart the dev server.",
    },
    { status: 503 },
  );
}

const handlers = isAuthConfigured()
  ? getAuth().handler()
  : { GET: notConfigured, POST: notConfigured };

export const GET = handlers.GET;
export const POST = handlers.POST;
