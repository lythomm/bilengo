"use client";

import { use, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EventMapContainer } from "@/components/EventMapContainer";
import { EventDrawer } from "@/components/EventDrawer";
import { BookingModal } from "@/components/BookingModal";
import { OrganizerEventView } from "@/components/OrganizerEventView";
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
      setCoords({ lat: event.destinationLat, lng: event.destinationLng });
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
              setCoords({ lat, lng });
              return;
            }
          }
          setCoords({ lat: 48.8566, lng: 2.3522 });
        })
        .catch(() => {
          setCoords({ lat: 48.8566, lng: 2.3522 });
        });
    } else {
      setCoords({ lat: 48.8566, lng: 2.3522 });
    }
  }, [event]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
      {/* Top Floating Banner */}
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

      {/* Fullscreen OpenStreetMap Layer */}
      <div className="absolute inset-0 z-0">
        <EventMapContainer
          destinationLat={coords.lat}
          destinationLng={coords.lng}
          destinationTitle={event.title}
          carpools={carpools || []}
          selectedCarpool={selectedCarpool}
          onSelectCarpool={(c) => setSelectedCarpool(c)}
        />
      </div>

      {/* Bottom Sheet Drawer */}
      <EventDrawer
        eventId={event._id}
        eventTitle={event.title}
        carpools={carpools || []}
        selectedCarpool={selectedCarpool}
        onSelectCarpool={(c) => setSelectedCarpool(c)}
        onOpenBooking={(c) => setBookingCarpool(c)}
      />

      {/* Booking Modal */}
      <BookingModal
        carpool={bookingCarpool}
        isOpen={!!bookingCarpool}
        onClose={() => setBookingCarpool(null)}
      />
    </div>
  );
}
