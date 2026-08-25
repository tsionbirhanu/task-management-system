import type { Metadata } from "next";
import Link from "next/link";

import { CheckCircle2 } from "lucide-react";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in | Workbench",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { confirmed?: string; created?: string };
}) {
  // Set by the signup form after it creates an account and signs back out.
  const justCreated = searchParams.created === "1";
  const confirmationSent = searchParams.confirmed === "1";

  return (
    <>
      <h1 className="font-display text-lg font-semibold text-ink">Sign in</h1>
      <p className="mt-1 font-body text-sm text-slate">
        {confirmationSent
          ? "Check your email, confirm your account, then sign in."
          : justCreated
          ? "Your account is ready. Sign in to open your board."
          : "Pick up where you left off on the board."}
      </p>

      {confirmationSent || justCreated ? (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 rounded-md border border-done/30 bg-done/10 px-3 py-2 font-body text-sm text-ink"
        >
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-done"
          />
          {confirmationSent
            ? "Account created. We sent a confirmation email; open the link before signing in."
            : "Account created - sign in with the email and password you just chose."}
        </p>
      ) : null}

      <LoginForm />

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
