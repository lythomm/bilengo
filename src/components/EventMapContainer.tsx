"use client";

import dynamic from "next/dynamic";

const EventMapInner = dynamic(() => import("./EventMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center text-slate-500 animate-pulse">
      Chargement de la carte OpenStreetMap...
    </div>
  ),
});

interface CarpoolItem {
  _id: string;
  driverName: string;
  departureAddress: string;
  departureTime: string;
  totalSeats: number;
  availableSeats: number;
  departureLat?: number;
  departureLng?: number;
  description?: string;
}

interface EventMapContainerProps {
  destinationLat: number;
  destinationLng: number;
  destinationTitle: string;
  carpools: CarpoolItem[];
  selectedCarpool: CarpoolItem | null;
  onSelectCarpool: (carpool: CarpoolItem) => void;
  isPickingLocation?: boolean;
  onCenterChange?: (center: { lat: number; lng: number }) => void;
  pickedLocation?: { lat: number; lng: number } | null;
}

export function EventMapContainer(props: EventMapContainerProps) {
  return <EventMapInner {...props} />;
}
