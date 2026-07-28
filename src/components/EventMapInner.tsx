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
import { MapPin, LocateFixed } from "lucide-react";

// Leaflet custom icons
const eventDestinationIcon = L.divIcon({
  className: "custom-event-icon",
  html: `<div style="background-color: #f59e0b; color: #020617; font-weight: 900; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.5); font-size: 18px;">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function createCarpoolMarkerIcon(driverName: string, isSelected: boolean) {
  const firstName = driverName ? driverName.split(" ")[0] : "Conducteur";
  const bgCircle = isSelected ? "#3b82f6" : "#10b981";
  const size = isSelected ? 36 : 30;
  const shadow = isSelected
    ? "0 8px 20px rgba(59,130,246,0.6)"
    : "0 4px 12px rgba(0,0,0,0.25)";

  return L.divIcon({
    className: "custom-carpool-marker-with-name",
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: auto; transform: translate(-50%, -50%);">
        <div style="background-color: ${bgCircle}; color: #ffffff; font-weight: 900; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #ffffff; box-shadow: ${shadow}; font-size: ${isSelected ? "17px" : "14px"}; flex-shrink: 0;">
          🚗
        </div>
        <div style="margin-top: 2px; background-color: #ffffff; color: #111111; font-weight: 700; font-size: 11px; padding: 2px 7px; border-radius: 20px; border: 1px solid rgba(0,0,0,0.12); box-shadow: 0 2px 6px rgba(0,0,0,0.15); white-space: nowrap; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;">
          ${firstName}
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

const userLocationIcon = L.divIcon({
  className: "custom-user-location-icon",
  html: `<div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
    <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: rgba(59, 130, 246, 0.35); animation: user-pulse 2s infinite ease-out;"></div>
    <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #2563eb; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 10;"></div>
  </div>
  <style>
    @keyframes user-pulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
  </style>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
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

function MapActionButtons({
  destinationLat,
  destinationLng,
  userLocation,
  onLocateUser,
  isPickingLocation,
}: {
  destinationLat: number;
  destinationLng: number;
  userLocation: { lat: number; lng: number } | null;
  onLocateUser: () => void;
  isPickingLocation?: boolean;
}) {
  const map = useMap();

  const handleCenterUser = () => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 0.8 });
    } else {
      onLocateUser();
    }
  };

  const handleCenterEvent = () => {
    map.flyTo([destinationLat, destinationLng], 14, { duration: 0.8 });
  };

  if (isPickingLocation) return null;

  return (
    <div className="absolute bottom-28 right-4 z-[400] flex flex-col gap-2.5">
      {/* Center Event Button */}
      <button
        type="button"
        onClick={handleCenterEvent}
        className="w-10 h-10 rounded-full bg-white text-neutral-900 shadow-lg border border-neutral-200/90 flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
        title="Centrer sur l'événement"
        aria-label="Centrer sur l'événement"
      >
        <MapPin className="w-5 h-5 text-neutral-900" />
      </button>

      {/* Center User Location Button */}
      <button
        type="button"
        onClick={handleCenterUser}
        className="w-10 h-10 rounded-full bg-white text-neutral-900 shadow-lg border border-neutral-200/90 flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
        title="Centrer sur ma position"
        aria-label="Centrer sur ma position"
      >
        <LocateFixed className="w-5 h-5 text-neutral-900" />
      </button>
    </div>
  );
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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const requestUserLocation = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.log("Géolocalisation indisponible:", err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  };

  useEffect(() => {
    requestUserLocation();
  }, []);

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

        <MapActionButtons
          destinationLat={destinationLat}
          destinationLng={destinationLng}
          userLocation={userLocation}
          onLocateUser={requestUserLocation}
          isPickingLocation={isPickingLocation}
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="text-center font-sans p-1">
                <strong className="text-slate-900 block text-sm font-semibold">
                  Votre position
                </strong>
                <span className="text-xs text-neutral-500">Vous êtes ici</span>
              </div>
            </Popup>
          </Marker>
        )}

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
              icon={createCarpoolMarkerIcon(c.driverName, isSelected)}
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
