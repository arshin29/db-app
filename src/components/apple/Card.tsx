import React, { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "white" | "parchment" | "pearl" | "dark";
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

export function Card({
  children,
  className = "",
  variant = "white",
  padding = "lg",
  hoverable = false,
  ...props
}: CardProps) {
  const paddingStyles = {
    none: "p-0",
    sm: "p-4 sm:p-5",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-7",
  }[padding];

  const variantStyles = {
    white: "bg-white border border-[#e5e5ea]",
    parchment: "bg-[#f5f5f7] border border-[#e5e5ea]",
    pearl: "bg-[#fafafc] border border-[#e5e5ea]",
    dark: "bg-[#272729] text-white border border-white/10",
  }[variant];

  const hoverStyles = hoverable
    ? "transition-all duration-200 hover:border-[#d2d2d7] hover:shadow-sm"
    : "";

  return (
    <div
      className={`rounded-[18px] ${variantStyles} ${paddingStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
