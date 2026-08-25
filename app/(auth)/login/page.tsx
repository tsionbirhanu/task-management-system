import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Sign in | Workbench",
};

/**
 * Scaffold: markup only. Next phase wires react-hook-form + zod and
 * supabase.auth.signInWithPassword.
 */
export default function LoginPage() {
  return (
    <>
      <h1 className="font-display text-lg font-semibold text-ink">Sign in</h1>
      <p className="mt-1 font-body text-sm text-slate">
        Pick up where you left off on the board.
      </p>

      <form className="mt-6 flex flex-col gap-4" noValidate>
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
        <Button variant="primary" disabled className="mt-1 w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-5 font-body text-sm text-slate">
        No account yet?{" "}
        <Link href="/signup" className="rounded font-medium text-ink underline">
          Create one
        </Link>
        .
      </p>
    </>
  );
}
