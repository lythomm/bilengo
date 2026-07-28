"use client";

import { ReactNode } from "react";

export interface PillGroupOption<T extends string = string> {
  id: T;
  label: ReactNode;
  icon?: ReactNode;
}

export interface PillGroupProps<T extends string = string> {
  options: PillGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function PillGroup<T extends string = string>({
  options,
  value,
  onChange,
  className = "",
}: PillGroupProps<T>) {
  return (
    <div className={`cal-pill-group ${className}`}>
      {options.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`cal-pill-item ${isActive ? "cal-pill-item-active" : ""} flex items-center gap-1.5`}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
