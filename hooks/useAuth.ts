"use client";

import { useEffect, useState } from "react";

import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface UseAuthResult {
  user: User | null;
  isLoading: boolean;
  /** False until a Supabase project is wired up; the app runs in preview mode. */
  isConfigured: boolean;
}

/** Tracks the signed-in user and keeps up with token refreshes. */
export function useAuth(): UseAuthResult {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(configured);

  useEffect(() => {
    if (!configured) return;

    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [configured]);

  return { user, isLoading, isConfigured: configured };
}
