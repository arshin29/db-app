"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "pearl" | "dark" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all select-none disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:scale-[0.96]";

    const sizeStyles = {
      sm: "text-[13px] px-3.5 py-1.5 min-h-[32px] gap-1.5",
      md: "text-[14px] px-5 py-2 min-h-[40px] gap-2",
      lg: "text-[16px] px-6 py-2.5 min-h-[46px] gap-2.5",
    }[size];

    const variantStyles = {
      primary: "bg-[#0066cc] text-white hover:bg-[#0071e3] shadow-sm rounded-full",
      secondary:
        "bg-transparent text-[#0066cc] border border-[#0066cc] hover:bg-[#0066cc]/5 rounded-full",
      pearl:
        "bg-[#fafafc] text-[#1d1d1f] border border-[#e0e0e0] hover:bg-[#f2f2f5] rounded-[11px]",
      dark: "bg-[#1d1d1f] text-white hover:bg-[#333333] rounded-[8px]",
      ghost:
        "bg-transparent text-[#1d1d1f] hover:bg-black/[0.04] rounded-full",
      danger:
        "bg-[#fff2f2] text-[#d70015] border border-[#ffd5d5] hover:bg-[#ffe5e5] rounded-full",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
