import { createNeonAuth } from "@neondatabase/auth/next/server";

import {
  NEON_AUTH_BASE_URL,
  NEON_AUTH_COOKIE_SECRET,
  isAuthConfigured,
} from "@/lib/auth/env";

/**
 * Built lazily rather than at module scope: createNeonAuth validates the cookie
 * secret, so constructing it eagerly would throw at import time whenever the
 * env is not filled in yet -- which would take the whole app down instead of
 * just the auth routes.
 */
let instance: ReturnType<typeof createNeonAuth> | null = null;

export function getAuth() {
  if (!isAuthConfigured()) {
    throw new Error(
      "Neon Auth is not configured. Set NEON_AUTH_BASE_URL and a 32+ character " +
        "NEON_AUTH_COOKIE_SECRET in .env.local.",
    );
  }

  instance ??= createNeonAuth({
    baseUrl: NEON_AUTH_BASE_URL,
    cookies: { secret: NEON_AUTH_COOKIE_SECRET },
  });

  return instance;
}
