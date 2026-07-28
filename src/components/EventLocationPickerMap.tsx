"use client";

import dynamic from "next/dynamic";

const EventLocationPickerInner = dynamic(() => import("./EventLocationPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 sm:h-80 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 text-xs font-medium animate-pulse">
      Chargement de la carte...
    </div>
  ),
});

export interface EventLocationPickerMapProps {
  initialLat?: number;
  initialLng?: number;
  pickedLocation: { lat: number; lng: number } | null;
  onCenterChange: (center: { lat: number; lng: number }) => void;
}

export function EventLocationPickerMap(props: EventLocationPickerMapProps) {
  return <EventLocationPickerInner {...props} />;
}
