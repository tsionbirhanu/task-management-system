import { describe, expect, it } from "vitest";

import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";

describe("auth validation", () => {
  it("accepts a valid forgot-password request", () => {
    expect(forgotPasswordSchema.parse({ email: "sam@example.com" })).toEqual({
      email: "sam@example.com",
    });
  });

  it("accepts a valid password reset", () => {
    expect(
      resetPasswordSchema.parse({
        email: "sam@example.com",
        otp: "123456",
        password: "new-password",
        confirmPassword: "new-password",
      }),
    ).toMatchObject({
      email: "sam@example.com",
      otp: "123456",
      password: "new-password",
    });
  });

  it("rejects mismatched reset passwords", () => {
    expect(
      resetPasswordSchema.safeParse({
        email: "sam@example.com",
        otp: "123456",
        password: "new-password",
        confirmPassword: "different-password",
      }).success,
    ).toBe(false);
  });
});
