"use client";

import { useEffect, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

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

  const styleConfig = {
    success: {
      container: "bg-neutral-900 text-white border-neutral-800 shadow-2xl shadow-emerald-950/20",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    error: {
      container: "bg-red-950 text-red-100 border-red-800 shadow-2xl shadow-red-950/30",
      icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />,
    },
    info: {
      container: "bg-white text-neutral-900 border-neutral-200 shadow-2xl shadow-neutral-900/10",
      icon: <Info className="w-5 h-5 text-neutral-600 shrink-0" />,
    },
  }[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-6 right-4 sm:right-6 z-50 pointer-events-auto"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-sm font-medium backdrop-blur-md ${styleConfig.container}`}
          >
            {styleConfig.icon}
            <span className="pr-1 tracking-tight font-sans">{message}</span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer ml-1 text-inherit"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
