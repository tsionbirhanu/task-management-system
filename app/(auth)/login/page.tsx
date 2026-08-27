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
  searchParams: { confirmed?: string; created?: string; reset?: string };
}) {
  // Set by the signup form after it creates an account and signs back out.
  const justCreated = searchParams.created === "1";
  const confirmationSent = searchParams.confirmed === "1";
  const passwordReset = searchParams.reset === "1";

  return (
    <>
      <p className="font-body text-xs font-bold text-progress">
        Welcome back
      </p>
      <h1 className="mt-2 font-body text-2xl font-bold text-ink">
        Sign in to Workbench
      </h1>
      <p className="mt-2 font-body text-sm leading-6 text-slate">
        {confirmationSent
          ? "Check your email, confirm your account, then sign in."
          : justCreated
          ? "Your account is ready. Sign in to open your board."
          : passwordReset
          ? "Your password has been reset. Sign in with the new one."
          : "Pick up where you left off on the board."}
      </p>

      {confirmationSent || justCreated || passwordReset ? (
        <p
          role="status"
          className="mt-5 flex items-start gap-2 rounded-lg border border-done/30 bg-done/10 px-3 py-2.5 font-body text-sm leading-5 text-ink"
        >
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-done"
          />
          {confirmationSent
            ? "Account created. We sent a confirmation email; open the link before signing in."
            : passwordReset
            ? "Password reset. Use your new password below."
            : "Account created - sign in with the email and password you just chose."}
        </p>
      ) : null}

      <LoginForm />

      <p className="mt-5 font-body text-sm text-slate">
        No account yet?{" "}
        <Link href="/signup" className="rounded font-bold text-ink underline">
          Create one
        </Link>
        .
      </p>
    </>
  );
}
