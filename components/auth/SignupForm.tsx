"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authClient } from "@/lib/auth/client";
import { signUpSchema, type SignUpInput } from "@/lib/validation/auth";

export function SignupForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: SignUpInput) {
    setFormError(null);

    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      setFormError(
        error.message ??
          "We could not create that account. Try a different email address.",
      );
      return;
    }

    router.push("/board");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
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

      {formError ? (
        <p role="alert" className="font-body text-sm text-danger">
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
