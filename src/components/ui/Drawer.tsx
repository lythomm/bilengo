"use client";

import { useState, ReactNode } from "react";

export interface DrawerProps {
  isOpen?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onClose?: () => void;
  children: ReactNode;
  maxHeightClass?: string;
  allowCollapseToHandle?: boolean;
  className?: string;
}

export function Drawer({
  isOpen = true,
  isExpanded: controlledIsExpanded,
  onToggleExpand,
  onClose,
  children,
  maxHeightClass = "max-h-[85vh]",
  allowCollapseToHandle = true,
  className = "",
}: DrawerProps) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(true);

  if (!isOpen) return null;

  const expanded =
    controlledIsExpanded !== undefined
      ? controlledIsExpanded
      : internalIsExpanded;

  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalIsExpanded((prev) => !prev);
    }
  };

  const transformClass = allowCollapseToHandle
    ? expanded
      ? "translate-y-0"
      : "translate-y-[calc(100%-32px)]"
    : "translate-y-0";

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${maxHeightClass} ${transformClass} ${className}`}
    >
      {/* Drag Handle & Header */}
      <div
        onClick={handleToggle}
        className="w-full pt-3 pb-2 flex flex-col items-center cursor-pointer select-none group"
      >
        <div className="w-12 h-1.5 rounded-full bg-neutral-300 group-hover:bg-neutral-400 transition-colors" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
