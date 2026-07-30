"use client";

import { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  variant?: "gray" | "white" | "dark";
  className?: string;
  onClick?: () => void;
}

export function Card({ children, variant = "gray", className = "", onClick }: CardProps) {
  const variantClass = {
    gray: "cal-card",
    white: "cal-card-white",
    dark: "cal-card-dark",
  }[variant];

  return (
    <div className={`${variantClass} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
