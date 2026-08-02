"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error";

interface ToastMessage {
  id: number;
  type: ToastType;
  message: ReactNode;
}

interface ToastContextType {
  showToast: (type: ToastType, message: ReactNode) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const lastToastRef = useRef<{ type: ToastType; messageKey: string; time: number } | null>(null);

  const showToast = useCallback((type: ToastType, message: ReactNode) => {
    const messageKey = typeof message === "string" ? message : String(message);
    const now = Date.now();

    // Prevent duplicate toasts within 500ms window
    if (
      lastToastRef.current &&
      lastToastRef.current.type === type &&
      lastToastRef.current.messageKey === messageKey &&
      now - lastToastRef.current.time < 500
    ) {
      return;
    }

    lastToastRef.current = { type, messageKey, time: now };
    const id = now + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <AutoDismissToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast doit être utilisé au sein d'un ToastProvider");
  }
  return context;
}

function AutoDismissToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return <ToastItem toast={toast} onClose={onClose} />;
}

// Standalone Toast component for controlled boolean open state
export interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  type?: ToastType;
  message: ReactNode;
  durationMs?: number;
}

export function Toast({
  isOpen,
  onClose,
  type = "success",
  message,
  durationMs = 4000,
}: ToastProps) {
  useEffect(() => {
    if (isOpen && durationMs > 0) {
      const timer = setTimeout(onClose, durationMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, durationMs, onClose]);

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <ToastItem
            toast={{ id: 1, type, message }}
            onClose={onClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const styleConfig = {
    success: {
      container: "bg-neutral-900 text-white border-neutral-800 shadow-2xl shadow-emerald-950/20",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    warning: {
      container: "bg-neutral-900 text-amber-100 border-amber-800/80 shadow-2xl shadow-amber-950/30",
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    error: {
      container: "bg-red-950 text-red-100 border-red-800 shadow-2xl shadow-red-950/30",
      icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />,
    },
  }[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="pointer-events-auto"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-sm font-medium backdrop-blur-md ${styleConfig.container}`}
      >
        {styleConfig.icon}
        <span className="pr-1 tracking-tight font-sans">{toast.message}</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer ml-1 text-inherit"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
