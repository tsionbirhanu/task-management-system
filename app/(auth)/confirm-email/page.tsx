import type { Metadata } from "next";
import Link from "next/link";

import { ConfirmEmailForm } from "@/components/auth/ConfirmEmailForm";

export const metadata: Metadata = {
  title: "Confirm email | Workbench",
};

export default function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  return (
    <>
      <h1 className="font-display text-lg font-semibold text-ink">
        Confirm your email
      </h1>
      <p className="mt-1 font-body text-sm text-slate">
        Enter the 6-digit code we sent to your email address.
      </p>

      <ConfirmEmailForm email={searchParams.email ?? ""} />

      <p className="mt-5 font-body text-sm text-slate">
        Already confirmed?{" "}
        <Link href="/login" className="rounded font-medium text-ink underline">
          Sign in
        </Link>
        .
      </p>
    </>
  );
}
