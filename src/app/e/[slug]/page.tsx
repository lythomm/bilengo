"use client";

import { use, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EventMapContainer } from "@/components/EventMapContainer";
import { EventDrawer } from "@/components/EventDrawer";
import { BookingModal } from "@/components/BookingModal";
import { OrganizerEventView } from "@/components/OrganizerEventView";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { GuestAuthModal } from "@/components/GuestAuthModal";
import { getParticipantSession } from "@/lib/session";
import Link from "next/link";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default function EventPage({ params }: EventPageProps) {
  const { slug } = use(params);
  const [selectedCarpool, setSelectedCarpool] = useState<any | null>(null);
  const [bookingCarpool, setBookingCarpool] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"organizer" | "map">("organizer");
  const [isGuestAuthOpen, setIsGuestAuthOpen] = useState(false);

  // Map Picker Mode State
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [searchAddress, setSearchAddress] = useState("");
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [prefilledAddress, setPrefilledAddress] = useState<{
    label: string;
    lat: number;
    lng: number;
  } | null>(null);

  const event = useQuery(api.events.getEventBySlug, { slug });
  const carpools = useQuery(
    api.carpools.getCarpoolsByEvent,
    event?._id ? { eventId: event._id } : "skip"
  );
  const organizerData = useQuery(
    api.events.getOrganizerEventData,
    event?._id ? { eventId: event._id } : "skip"
  );

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!event) return;

    // Check if valid coordinates are stored in database
    if (
      typeof event.destinationLat === "number" &&
      typeof event.destinationLng === "number" &&
      !isNaN(event.destinationLat) &&
      !isNaN(event.destinationLng)
    ) {
      const initialCoords = { lat: event.destinationLat, lng: event.destinationLng };
      setCoords(initialCoords);
      setMapCenter(initialCoords);
      return;
    }

    // Geocode fallback for legacy events or uncaptured coordinates
    if (event.destinationAddress) {
      fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
          event.destinationAddress
        )}&limit=1`
      )
        .then((res) => res.json())
        .then((data) => {
          const first = data.features?.[0];
          if (first?.geometry?.coordinates) {
            const lng = first.geometry.coordinates[0];
            const lat = first.geometry.coordinates[1];
            if (
              typeof lat === "number" &&
              typeof lng === "number" &&
              !isNaN(lat) &&
              !isNaN(lng)
            ) {
              const c = { lat, lng };
              setCoords(c);
              setMapCenter(c);
              return;
            }
          }
          const defaultC = { lat: 48.8566, lng: 2.3522 };
          setCoords(defaultC);
          setMapCenter(defaultC);
        })
        .catch(() => {
          const defaultC = { lat: 48.8566, lng: 2.3522 };
          setCoords(defaultC);
          setMapCenter(defaultC);
        });
    } else {
      const defaultC = { lat: 48.8566, lng: 2.3522 };
      setCoords(defaultC);
      setMapCenter(defaultC);
    }
  }, [event]);

  useEffect(() => {
    if (event && organizerData !== undefined && !organizerData?.isOrganizer) {
      const session = getParticipantSession();
      if (!session) {
        setIsGuestAuthOpen(true);
      }
    }
  }, [event, organizerData]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmLocation = async () => {
    const targetLat = mapCenter?.lat || coords?.lat || 48.8566;
    const targetLng = mapCenter?.lng || coords?.lng || 2.3522;

    let label = searchAddress.trim();

    // Reverse geocode if label not explicitly typed/selected
    if (!label) {
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/reverse/?lon=${targetLng}&lat=${targetLat}`
        );
        if (res.ok) {
          const data = await res.json();
          const first = data.features?.[0];
          if (first?.properties?.label) {
            label = first.properties.label;
          }
        }
      } catch (e) {
        console.error("Reverse geocoding failed", e);
      }
    }

    if (!label) {
      label = `${targetLat.toFixed(4)}, ${targetLng.toFixed(4)}`;
    }

    setPickedLocation({
      lat: targetLat,
      lng: targetLng,
    });
    setPrefilledAddress({
      label,
      lat: targetLat,
      lng: targetLng,
    });
    setIsPickingLocation(false);
  };

  if (event === undefined || !coords) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse text-lg">Chargement de l'événement...</div>
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4 text-center">
        <h1 className="text-3xl font-bold mb-3">Événement introuvable</h1>
        <p className="text-slate-400 mb-6">
          Ce lien d'événement n'existe pas ou a été supprimé.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
        >
          Retourner à l'accueil
        </Link>
      </div>
    );
  }

  // If user is the organizer and current viewMode is "organizer", show Organizer Dashboard View
  if (organizerData?.isOrganizer && viewMode === "organizer") {
    return (
      <OrganizerEventView
        organizerData={organizerData as any}
        onSwitchToMap={() => setViewMode("map")}
        onCopyLink={handleCopyLink}
        copied={copied}
      />
    );
  }

  // Guest Map View (or Organizer switched to Map View)
  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* Map Picker UI Overlay */}
      {isPickingLocation ? (
        <>
          {/* Top Floating Search Bar */}
          <div className="fixed top-4 left-4 right-4 z-40 max-w-md mx-auto">
            <AddressAutocomplete
              value={searchAddress}
              onChange={(val) => setSearchAddress(val)}
              onSelect={(item) => {
                setSearchAddress(item.label);
                if (item.lat && item.lng) {
                  setPickedLocation({ lat: item.lat, lng: item.lng });
                  setMapCenter({ lat: item.lat, lng: item.lng });
                }
              }}
              placeholder="Tape une adresse ou une ville..."
              inputClassName="w-full px-5 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 font-medium text-sm shadow-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Center Target Reticle / Viseur */}
          <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="24" cy="24" r="10" stroke="#3b82f6" strokeWidth="3" fill="none" />
                <circle cx="24" cy="24" r="4" fill="#3b82f6" />
                <line x1="24" y1="2" x2="24" y2="10" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                <line x1="24" y1="38" x2="24" y2="46" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                <line x1="2" y1="24" x2="10" y2="24" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                <line x1="38" y1="24" x2="46" y2="24" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Bottom Floating Action Buttons */}
          <div className="fixed bottom-6 left-4 right-4 z-40 max-w-sm mx-auto flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsPickingLocation(false)}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-white text-slate-900 font-extrabold text-sm shadow-2xl border border-slate-100 hover:bg-slate-50 transition-all text-center"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-2xl shadow-blue-600/30 transition-all text-center"
            >
              Partir d'ici
            </button>
          </div>
        </>
      ) : (
        /* Top Floating Banner when not in picker mode */
        <header className="fixed top-4 left-4 right-4 z-30 max-w-4xl mx-auto bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg flex-shrink-0 shadow-lg shadow-amber-500/20"
            >
              B
            </Link>
            <div className="truncate">
              <h1 className="font-extrabold text-white text-sm tracking-tight truncate">
                {event.title}
              </h1>
              <p className="text-[11px] text-slate-400 truncate">
                📅{" "}
                {new Date(event.eventDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                • 📍 {event.destinationAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {organizerData?.isOrganizer && (
              <button
                type="button"
                onClick={() => setViewMode("organizer")}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>📊 Vue Organisateur</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-shrink-0 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
            >
              {copied ? "✓ Copié" : "🔗 Partager"}
            </button>
          </div>
        </header>
      )}

      {/* Fullscreen OpenStreetMap Layer */}
      <div className="absolute inset-0 z-0">
        <EventMapContainer
          destinationLat={coords.lat}
          destinationLng={coords.lng}
          destinationTitle={event.title}
          carpools={carpools || []}
          selectedCarpool={selectedCarpool}
          onSelectCarpool={(c) => setSelectedCarpool(c)}
          isPickingLocation={isPickingLocation}
          onCenterChange={(center) => setMapCenter(center)}
          pickedLocation={pickedLocation}
        />
      </div>

      {/* Bottom Sheet Drawer (Hidden during map picker mode) */}
      {!isPickingLocation && (
        <EventDrawer
          eventId={event._id}
          eventTitle={event.title}
          carpools={carpools || []}
          selectedCarpool={selectedCarpool}
          onSelectCarpool={(c) => setSelectedCarpool(c)}
          onOpenBooking={(c) => setBookingCarpool(c)}
          onStartPickLocation={() => setIsPickingLocation(true)}
          prefilledAddress={prefilledAddress}
          onCloseFinalize={() => setPrefilledAddress(null)}
        />
      )}

      {/* Booking Modal */}
      <BookingModal
        carpool={bookingCarpool}
        isOpen={!!bookingCarpool}
        onClose={() => setBookingCarpool(null)}
      />

      {/* Guest Authentication Modal Gate */}
      <GuestAuthModal
        isOpen={isGuestAuthOpen}
        eventTitle={event.title}
        onAuthenticated={() => setIsGuestAuthOpen(false)}
      />
    </div>
  );
}
