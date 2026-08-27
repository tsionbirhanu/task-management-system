import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password | Workbench",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <p className="font-body text-xs font-bold text-progress">
        Account recovery
      </p>
      <h1 className="mt-2 font-body text-2xl font-bold text-ink">
        Reset your password
      </h1>
      <p className="mt-2 font-body text-sm leading-6 text-slate">
        Enter your email and we will send a 6-digit reset code.
      </p>

      <ForgotPasswordForm />

      <p className="mt-5 font-body text-sm text-slate">
        Remembered it?{" "}
        <Link href="/login" className="rounded font-bold text-ink underline">
          Sign in
        </Link>
        .
      </p>
    </>
  );
}
