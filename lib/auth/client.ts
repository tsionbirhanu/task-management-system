"use client";

import { createAuthClient } from "@neondatabase/auth/next";

/**
 * Browser-side auth. Talks to the route handler mounted at /api/auth/[...path],
 * so sign-in stays a REST call like everything else in this app -- no server
 * actions.
 */
export const authClient = createAuthClient();
