"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authClient } from "@/lib/auth/client";

const confirmEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

type ConfirmEmailInput = z.infer<typeof confirmEmailSchema>;

const VERIFY_FAILED =
  "That code did not work. Check the latest email and try again.";
const RESEND_FAILED =
  "We could not send a new code. Wait a minute and try again.";

export function ConfirmEmailForm({ email = "" }: { email?: string }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmEmailInput>({
    resolver: zodResolver(confirmEmailSchema),
    defaultValues: { email, otp: "" },
  });

  async function onSubmit(values: ConfirmEmailInput) {
    setFormError(null);
    setNotice(null);

    const { error } = await authClient.emailOtp.verifyEmail({
      email: values.email,
      otp: values.otp,
    });

    if (error) {
      setFormError(VERIFY_FAILED);
      return;
    }

    await authClient.signOut();
    window.location.assign("/login?created=1");
  }

  async function resendCode() {
    setFormError(null);
    setNotice(null);

    const parsed = confirmEmailSchema.pick({ email: true }).safeParse({
      email: getValues("email"),
    });
    if (!parsed.success) {
      setFormError("Enter your email address first.");
      return;
    }

    const { error } = await authClient.sendVerificationEmail({
      email: parsed.data.email,
      callbackURL: "/login?created=1",
    });

    if (error) {
      setFormError(RESEND_FAILED);
      return;
    }

    setNotice("A new code has been sent.");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 flex flex-col gap-4"
      noValidate
    >
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Confirmation code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="212554"
        error={errors.otp?.message}
        mono
        {...register("otp")}
      />

      {formError ? (
        <p
          role="alert"
          className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 font-body text-sm text-danger"
        >
          {formError}
        </p>
      ) : null}

      {notice ? (
        <p
          role="status"
          className="rounded-md border border-done/30 bg-done/10 px-3 py-2 font-body text-sm text-ink"
        >
          {notice}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="mt-1 w-full"
      >
        {isSubmitting ? "Verifying..." : "Verify email"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={resendCode}
        disabled={isSubmitting}
        className="w-full"
      >
        Send a new code
      </Button>
    </form>
  );
}
