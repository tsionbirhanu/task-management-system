import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password | Workbench",
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  return (
    <>
      <p className="font-body text-xs font-bold text-progress">
        New password
      </p>
      <h1 className="mt-2 font-body text-2xl font-bold text-ink">
        Enter your reset code
      </h1>
      <p className="mt-2 font-body text-sm leading-6 text-slate">
        Use the code from your email and choose a new password.
      </p>

      <ResetPasswordForm email={searchParams.email ?? ""} />

      <p className="mt-5 font-body text-sm text-slate">
        Need another code?{" "}
        <Link
          href="/forgot-password"
          className="rounded font-bold text-ink underline"
        >
          Request one
        </Link>
        .
      </p>
    </>
  );
}
