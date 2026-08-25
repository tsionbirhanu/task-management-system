"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authClient } from "@/lib/auth/client";
import { signUpSchema, type SignUpInput } from "@/lib/validation/auth";

const SIGN_UP_FAILED =
  "We could not create that account. Try a different email address, or sign in if you already have one.";
const VERIFICATION_EMAIL_FAILED =
  "Your account was created, but we could not send the confirmation email. Try signing in, then request a new confirmation email.";

export function SignupForm() {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: SignUpInput) {
    setFormError(null);

    const { data, error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      setFormError(SIGN_UP_FAILED);
      return;
    }

    // Ask Neon Auth to send the confirmation message explicitly. Some project
    // configurations create the user without auto-sending the verification mail.
    const { error: verificationError } =
      await authClient.sendVerificationEmail({
        email: values.email,
        callbackURL: "/login?created=1",
      });

    if (verificationError) {
      setFormError(VERIFICATION_EMAIL_FAILED);
      return;
    }

    // A session token comes back only when the project has email confirmation
    // switched off. Either way, signup should continue through the code screen.
    const signedInImmediately = Boolean(
      (data as { token?: string | null } | null)?.token,
    );

    if (signedInImmediately) await authClient.signOut();

    window.location.assign(
      `/confirm-email?email=${encodeURIComponent(values.email)}`,
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 flex flex-col gap-4"
      noValidate
    >
      <Input
        label="Name"
        autoComplete="name"
        placeholder="Sam Rivera"
        error={errors.name?.message}
        {...register("name")}
      />
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
        autoComplete="new-password"
        hint="Use at least 8 characters."
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        label="Confirm password"
        type="password"
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
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
