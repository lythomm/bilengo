"use client";

import { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "orange" | "emerald" | "blue" | "dark";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const variantClass = {
    default: "bg-neutral-100 text-neutral-800 border-neutral-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    dark: "bg-neutral-900 text-white border-neutral-800",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
}
