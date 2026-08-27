"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authClient } from "@/lib/auth/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validation/auth";

const RESET_REQUEST_FAILED =
  "We could not send a reset code right now. Check the email and try again.";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setFormError(null);

    try {
      const { error } = await authClient.emailOtp.requestPasswordReset({
        email: values.email,
      });

      if (error) {
        setFormError(RESET_REQUEST_FAILED);
        return;
      }

      setSent(true);
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch {
      setFormError(RESET_REQUEST_FAILED);
    }
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

      {formError ? (
        <p
          role="alert"
          className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 font-body text-sm text-danger"
        >
          {formError}
        </p>
      ) : null}

      {sent ? (
        <p
          role="status"
          className="rounded-md border border-done/30 bg-done/10 px-3 py-2 font-body text-sm text-ink"
        >
          Reset code sent. Enter it on the next screen.
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="mt-1 w-full"
      >
        {isSubmitting ? "Sending code..." : "Send reset code"}
      </Button>
    </form>
  );
}
