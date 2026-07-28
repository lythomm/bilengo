"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "danger-outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClass = {
    primary: "cal-button-primary",
    secondary: "cal-button-secondary",
    ghost: "cal-button-ghost",
    danger: "cal-button-danger",
    "danger-outline": "cal-button-danger-outline",
  }[variant];

  const sizeClass = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }[size];

  return (
    <button
      disabled={disabled || isLoading}
      className={`whitespace-nowrap shrink-0 ${baseClass} ${sizeClass} ${disabled || isLoading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""} ${className}`}
      {...props}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      )}
      {!isLoading && leftIcon}
      <span className="whitespace-nowrap">{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
}
