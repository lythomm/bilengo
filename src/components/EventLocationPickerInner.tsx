"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface InnerProps {
  initialLat?: number;
  initialLng?: number;
  pickedLocation: { lat: number; lng: number } | null;
  onCenterChange: (center: { lat: number; lng: number }) => void;
}

function MapEventsListener({
  onCenterChange,
  pickedLocation,
}: {
  onCenterChange: (center: { lat: number; lng: number }) => void;
  pickedLocation: { lat: number; lng: number } | null;
}) {
  const map = useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      onCenterChange({ lat: c.lat, lng: c.lng });
    },
  });

  useEffect(() => {
    if (pickedLocation) {
      map.flyTo([pickedLocation.lat, pickedLocation.lng], 15, { duration: 0.8 });
    }
  }, [pickedLocation, map]);

  return null;
}

export default function EventLocationPickerInner({
  initialLat = 48.8566,
  initialLng = 2.3522,
  pickedLocation,
  onCenterChange,
}: InnerProps) {
  const startLat = pickedLocation ? pickedLocation.lat : initialLat;
  const startLng = pickedLocation ? pickedLocation.lng : initialLng;

  return (
    <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-neutral-200 shadow-sm relative z-0">
      <MapContainer
        center={[startLat, startLng]}
        zoom={13}
        zoomControl={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maxZoom={19}
        />
        <MapEventsListener onCenterChange={onCenterChange} pickedLocation={pickedLocation} />
      </MapContainer>

      {/* Center Crosshair Sight */}
      <div className="absolute inset-0 pointer-events-none z-[1000] flex items-center justify-center">
        <div className="relative flex items-center justify-center drop-shadow-sm">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="6" stroke="#111111" strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="2" fill="#111111" />
            <line x1="12" y1="1" x2="12" y2="4" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="20" x2="12" y2="23" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
            <line x1="1" y1="12" x2="4" y2="12" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="12" x2="23" y2="12" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
