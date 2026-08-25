"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authClient } from "@/lib/auth/client";
import { signInSchema, type SignInInput } from "@/lib/validation/auth";

/**
 * Failures always report the same sentence. A raw provider error would leak
 * whether an address is registered, which turns this form into an account
 * enumeration oracle -- and it reads like a stack trace besides.
 */
const SIGN_IN_FAILED = "That email and password don't match our records.";
const EMAIL_NOT_CONFIRMED =
  "Confirm your email with the code we sent before signing in.";

export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInInput) {
    setFormError(null);

    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setFormError(SIGN_IN_FAILED);
      return;
    }

    const user = (data as { user?: { emailVerified?: boolean } } | null)?.user;
    if (user?.emailVerified === false) {
      await authClient.signOut();
      await authClient.sendVerificationEmail({
        email: values.email,
        callbackURL: "/login?created=1",
      });
      setFormError(EMAIL_NOT_CONFIRMED);
      window.location.assign(
        `/confirm-email?email=${encodeURIComponent(values.email)}`,
      );
      return;
    }

    window.location.assign("/board");
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
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
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
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
