import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Create account | Workbench",
};

/**
 * Scaffold: markup only. Next phase wires react-hook-form + zod and
 * supabase.auth.signUp.
 */
export default function SignupPage() {
  return (
    <>
      <h1 className="font-display text-lg font-semibold text-ink">
        Create your account
      </h1>
      <p className="mt-1 font-body text-sm text-slate">
        Start tracking work orders in a couple of minutes.
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
          autoComplete="new-password"
          hint="Use at least 8 characters."
        />
        <Button variant="primary" disabled className="mt-1 w-full">
          Create account
        </Button>
      </form>

      <p className="mt-5 font-body text-sm text-slate">
        Already have an account?{" "}
        <Link href="/login" className="rounded font-medium text-ink underline">
          Sign in
        </Link>
        .
      </p>
    </>
  );
}
