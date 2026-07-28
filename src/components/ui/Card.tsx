"use client";

import { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  variant?: "gray" | "white" | "dark";
  className?: string;
}

export function Card({ children, variant = "gray", className = "" }: CardProps) {
  const variantClass = {
    gray: "cal-card",
    white: "cal-card-white",
    dark: "cal-card-dark",
  }[variant];

  return <div className={`${variantClass} ${className}`}>{children}</div>;
}
