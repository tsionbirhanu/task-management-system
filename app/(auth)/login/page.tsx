import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in | Workbench",
};

export default function LoginPage() {
  return (
    <>
      <h1 className="font-display text-lg font-semibold text-ink">Sign in</h1>
      <p className="mt-1 font-body text-sm text-slate">
        Pick up where you left off on the board.
      </p>

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
