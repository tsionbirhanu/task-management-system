"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { authClient } from "@/lib/auth/client";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validation/auth";

const RESET_FAILED =
  "That reset code did not work. Check the latest email and try again.";

export function ResetPasswordForm({ email = "" }: { email?: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordInput) {
    setFormError(null);

    try {
      const { error } = await authClient.emailOtp.resetPassword({
        email: values.email,
        otp: values.otp,
        password: values.password,
      });

      if (error) {
        setFormError(RESET_FAILED);
        return;
      }

      await authClient.signOut();
      router.push("/login?reset=1");
    } catch {
      setFormError(RESET_FAILED);
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
      <Input
        label="Reset code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="212554"
        error={errors.otp?.message}
        mono
        {...register("otp")}
      />
      <PasswordInput
        label="New password"
        autoComplete="new-password"
        hint="Use at least 8 characters."
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordInput
        label="Confirm new password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {formError ? (
        <p
          role="alert"
          className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 font-body text-sm text-danger"
        >
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="mt-1 w-full"
      >
        {isSubmitting ? "Resetting password..." : "Reset password"}
      </Button>
    </form>
  );
}
