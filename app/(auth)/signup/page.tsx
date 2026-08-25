import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create account | Workbench",
};

export default function SignupPage() {
  return (
    <>
      <h1 className="font-display text-lg font-semibold text-ink">
        Create your account
      </h1>
      <p className="mt-1 font-body text-sm text-slate">
        Start tracking work orders in a couple of minutes.
      </p>

      <SignupForm />

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
