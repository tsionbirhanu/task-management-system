"use client";

import { forwardRef, useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import { Input, type InputProps } from "@/components/ui/Input";

export type PasswordInputProps = Omit<InputProps, "type" | "trailing">;

/**
 * Password field with a reveal toggle.
 *
 * Visibility is local state rather than a prop: nothing outside the field needs
 * to know, and keeping it here means each password on a form (new, confirm)
 * toggles on its own instead of revealing both at once.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);
    const Icon = visible ? EyeOff : Eye;

    return (
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        trailing={
          <button
            type="button"
            // type="button" matters: inside a form a bare button submits it, so
            // revealing the password would post the half-filled form instead.
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
            className="grid h-9 w-9 place-items-center rounded-md text-slate transition-colors duration-150 ease-out hover:bg-ink/[0.04] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
          </button>
        }
        {...props}
      />
    );
  },
);
