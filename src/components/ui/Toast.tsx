"use client";

import { useEffect, ReactNode } from "react";

export interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  message: ReactNode;
  variant?: "success" | "error" | "info";
  durationMs?: number;
}

export function Toast({
  isOpen,
  onClose,
  message,
  variant = "info",
  durationMs = 4000,
}: ToastProps) {
  useEffect(() => {
    if (isOpen && durationMs > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, durationMs, onClose]);

  if (!isOpen) return null;

  const bgVariant = {
    success: "bg-neutral-900 text-white border-neutral-800",
    error: "bg-red-950 text-red-100 border-red-800",
    info: "bg-white text-neutral-900 border-neutral-200 shadow-xl",
  }[variant];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${bgVariant}`}
      >
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity border-none bg-transparent cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
