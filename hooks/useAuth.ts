"use client";

import { authClient } from "@/lib/auth/client";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface UseAuthResult {
  user: AuthUser | null;
  isLoading: boolean;
}

/**
 * The signed-in user, for client components.
 *
 * Reads the session through the SDK, which talks to /api/auth/[...path] using
 * the httpOnly cookie. No token is ever exposed to JavaScript or written to
 * localStorage -- there is nothing here to read out of the browser.
 *
 * Server components should call getCurrentUser() from lib/auth/session instead:
 * it is one less round trip and cannot flash the wrong state.
 */
export function useAuth(): UseAuthResult {
  const { data, isPending } = authClient.useSession();
  const user = data?.user ?? null;

  return {
    user: user
      ? { id: user.id, email: user.email, name: user.name ?? null }
      : null,
    isLoading: isPending,
  };
}
