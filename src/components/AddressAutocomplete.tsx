"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface AddressSuggestion {
  label: string;
  lat?: number;
  lng?: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (address: AddressSuggestion) => void;
  placeholder?: string;
  required?: boolean;
  inputClassName?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Ex: 10 Rue de la Paix, Paris...",
  required = false,
  inputClassName,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!value || value.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
            value
          )}&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          const items: AddressSuggestion[] = (data.features || []).map(
            (item: any) => ({
              label: item.properties.label,
              lng: item.geometry?.coordinates?.[0],
              lat: item.geometry?.coordinates?.[1],
            })
          );
          setSuggestions(items);
          setIsOpen(items.length > 0);
        }
      } catch (err) {
        console.error("Erreur autocomplétion adresse:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = (item: AddressSuggestion) => {
    onChange(item.label);
    if (onSelect) onSelect(item);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        required={required}
        className={inputClassName || "cal-input"}
      />
      {isLoading && (
        <div className="absolute right-3 top-3 text-neutral-400">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(item)}
              className="px-4 py-2.5 text-xs text-neutral-800 hover:bg-neutral-100 cursor-pointer border-b border-neutral-100 last:border-0 transition-colors flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
