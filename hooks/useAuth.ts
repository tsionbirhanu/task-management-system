"use client";

import { isAuthConfigured, type SessionUser } from "@/lib/auth/session";

export interface UseAuthResult {
  user: SessionUser | null;
  isLoading: boolean;
  /** False until an auth provider is wired up; the app runs in preview mode. */
  isConfigured: boolean;
}

/**
 * Client-side view of the session. Deliberately keeps the shape it had under
 * Supabase so components consuming it do not churn when auth lands.
 */
export function useAuth(): UseAuthResult {
  return { user: null, isLoading: false, isConfigured: isAuthConfigured() };
}
