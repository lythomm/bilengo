"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet custom icons
const eventDestinationIcon = L.divIcon({
  className: "custom-event-icon",
  html: `<div style="background-color: #f59e0b; color: #020617; font-weight: 900; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.5); font-size: 18px;">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const carpoolDepartureIcon = L.divIcon({
  className: "custom-carpool-icon",
  html: `<div style="background-color: #10b981; color: #ffffff; font-weight: 700; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 14px;">🚗</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const selectedCarpoolIcon = L.divIcon({
  className: "custom-carpool-selected-icon",
  html: `<div style="background-color: #3b82f6; color: #ffffff; font-weight: 900; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 10px 25px rgba(59,130,246,0.6); font-size: 18px; transform: scale(1.15);">🚗</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
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

interface EventMapInnerProps {
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

function MapPickerEvents({
  isPicking,
  onCenterChange,
  pickedLocation,
}: {
  isPicking?: boolean;
  onCenterChange?: (center: { lat: number; lng: number }) => void;
  pickedLocation?: { lat: number; lng: number } | null;
}) {
  const map = useMapEvents({
    move: () => {
      if (isPicking && onCenterChange) {
        const c = map.getCenter();
        onCenterChange({ lat: c.lat, lng: c.lng });
      }
    },
    moveend: () => {
      if (isPicking && onCenterChange) {
        const c = map.getCenter();
        onCenterChange({ lat: c.lat, lng: c.lng });
      }
    },
  });

  useEffect(() => {
    if (pickedLocation) {
      map.flyTo([pickedLocation.lat, pickedLocation.lng], 15, { duration: 0.8 });
    }
  }, [pickedLocation, map]);

  return null;
}

// Map Controller for Leaflet container size invalidation & smooth camera transitions
function MapController({
  destinationLat,
  destinationLng,
  selectedCarpool,
  isPickingLocation,
  pickedLocation,
}: {
  destinationLat: number;
  destinationLng: number;
  selectedCarpool: CarpoolItem | null;
  isPickingLocation?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const [hasInitialCentered, setHasInitialCentered] = useState(false);

  useEffect(() => {
    map.invalidateSize();
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);

    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  useEffect(() => {
    if (isPickingLocation) return;

    if (
      selectedCarpool &&
      selectedCarpool.departureLat &&
      selectedCarpool.departureLng
    ) {
      const bounds = L.latLngBounds([
        [selectedCarpool.departureLat, selectedCarpool.departureLng],
        [destinationLat, destinationLng],
      ]);
      map.flyToBounds(bounds, {
        paddingTopLeft: [40, 100],
        paddingBottomRight: [40, 380],
        maxZoom: 14,
        duration: 1.2,
      });
    } else if (pickedLocation) {
      map.flyTo([pickedLocation.lat, pickedLocation.lng], map.getZoom(), { duration: 0.5 });
    } else if (!hasInitialCentered) {
      setHasInitialCentered(true);
      map.flyTo([destinationLat, destinationLng], 13, { duration: 1 });
    }
  }, [selectedCarpool, destinationLat, destinationLng, map, isPickingLocation, pickedLocation, hasInitialCentered]);

  return null;
}

export default function EventMapInner({
  destinationLat,
  destinationLng,
  destinationTitle,
  carpools,
  selectedCarpool,
  onSelectCarpool,
  isPickingLocation,
  onCenterChange,
  pickedLocation,
}: EventMapInnerProps) {
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([]);

  // Fetch OSRM route when a carpool is selected
  useEffect(() => {
    if (
      selectedCarpool &&
      selectedCarpool.departureLat &&
      selectedCarpool.departureLng
    ) {
      const startLng = selectedCarpool.departureLng;
      const startLat = selectedCarpool.departureLat;
      const endLng = destinationLng;
      const endLat = destinationLat;

      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes && data.routes[0]?.geometry) {
            const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
              (c: [number, number]) => [c[1], c[0]]
            );
            setRoutePolyline(coords);
          } else {
            setRoutePolyline([
              [startLat, startLng],
              [endLat, endLng],
            ]);
          }
        })
        .catch(() => {
          setRoutePolyline([
            [startLat, startLng],
            [destinationLat, destinationLng],
          ]);
        });
    } else {
      setRoutePolyline([]);
    }
  }, [selectedCarpool, destinationLat, destinationLng]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[destinationLat, destinationLng]}
        zoom={13}
        zoomSnap={1}
        zoomDelta={1}
        zoomControl={false}
        className="w-full h-full z-0 bg-slate-950"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maxZoom={19}
        />

        <MapPickerEvents
          isPicking={isPickingLocation}
          onCenterChange={onCenterChange}
          pickedLocation={pickedLocation}
        />

        <MapController
          destinationLat={destinationLat}
          destinationLng={destinationLng}
          selectedCarpool={selectedCarpool}
          isPickingLocation={isPickingLocation}
          pickedLocation={pickedLocation}
        />

        {/* Destination Event Marker */}
        <Marker
          position={[destinationLat, destinationLng]}
          icon={eventDestinationIcon}
        >
          <Popup>
            <div className="text-center font-sans p-1">
              <strong className="text-slate-900 block text-base">
                {destinationTitle}
              </strong>
              <span className="text-xs text-amber-600 font-semibold">
                📍 Lieu de l'événement
              </span>
            </div>
          </Popup>
        </Marker>

        {/* Carpool Departure Markers */}
        {carpools.map((c) => {
          if (!c.departureLat || !c.departureLng) return null;
          const isSelected = selectedCarpool?._id === c._id;

          return (
            <Marker
              key={c._id}
              position={[c.departureLat, c.departureLng]}
              icon={isSelected ? selectedCarpoolIcon : carpoolDepartureIcon}
              eventHandlers={{
                click: () => onSelectCarpool(c),
              }}
            />
          );
        })}

        {/* OSRM Route Line */}
        {routePolyline.length > 0 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: "#3b82f6",
              weight: 5,
              opacity: 0.85,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
