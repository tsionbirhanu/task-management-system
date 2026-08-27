import { z } from "zod";

/**
 * Shared by the auth forms and anything server-side that re-checks credential
 * shape. Written without z.email() so it does not depend on which zod minor is
 * installed.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .regex(EMAIL_PATTERN, "Enter a valid email address, like you@example.com.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(200, "Passwords are capped at 200 characters.");

export const signUpSchema = z
  .object({
    // Required by the auth provider's user schema, not by us.
    name: z
      .string()
      .trim()
      .min(1, "Tell us what to call you.")
      .max(80, "Keep it under 80 characters."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Re-enter your password to confirm it."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Those passwords do not match.",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Re-enter your password to confirm it."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Those passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
