"use client";

import { use, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EventMapContainer } from "@/components/EventMapContainer";
import { EventDrawer } from "@/components/EventDrawer";
import { BookingModal } from "@/components/BookingModal";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { GuestAuthModal } from "@/components/GuestAuthModal";
import { getParticipantSession } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import Link from "next/link";
import { LayoutDashboard, Share2, Check } from "lucide-react";

interface EventClientProps {
  params: Promise<{ slug: string }>;
}

export function EventClient({ params }: EventClientProps) {
  const { slug } = use(params);
  const [selectedCarpool, setSelectedCarpool] = useState<any | null>(null);
  const [bookingCarpool, setBookingCarpool] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
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
    setShowToast(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmLocation = async () => {
    const targetLat = mapCenter?.lat || coords?.lat || 48.8566;
    const targetLng = mapCenter?.lng || coords?.lng || 2.3522;

    let label = searchAddress.trim();

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
      <div className="min-h-screen flex items-center justify-center bg-white text-neutral-500">
        <div className="animate-pulse text-sm font-medium">Chargement de l'événement...</div>
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-neutral-900 p-4 text-center">
        <h1 className="text-2xl font-bold mb-2 font-heading">Événement introuvable</h1>
        <p className="text-neutral-500 text-sm mb-6">
          Ce lien d'événement n'existe pas ou a été supprimé.
        </p>
        <Link href="/">
          <Button variant="primary" size="md">
            Retourner à l'accueil
          </Button>
        </Link>
      </div>
    );
  }



  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="fixed inset-0 overflow-hidden bg-white text-neutral-900 select-none"
    >
      {/* Top Header - Always Visible */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white p-4 h-16 flex items-center justify-between gap-3 border-b border-neutral-200">
        <span className="text-lg font-bold text-neutral-900 tracking-tight font-heading">
          BilenGo
        </span>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            title={copied ? "Lien copié !" : "Partager"}
            aria-label="Partager"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </Button>

          {organizerData?.isOrganizer && (
            <Link href={`/e/${event.slug}/dashboard`}>
              <Button
                type="button"
                variant="primary"
                size="sm"
                title="Tableau de bord organisateur"
                aria-label="Tableau de bord organisateur"
              >
                <LayoutDashboard className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Map Picker Overlay when active */}
      {isPickingLocation && (
        <>
          <div className="fixed top-20 left-4 right-4 z-40 max-w-md mx-auto">
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
              placeholder="Rechercher une adresse..."
            />
          </div>

          <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="24" cy="24" r="8" stroke="#111111" strokeWidth="2.5" fill="none" />
                <circle cx="24" cy="24" r="3" fill="#111111" />
                <line x1="24" y1="4" x2="24" y2="12" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="24" y1="36" x2="24" y2="44" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="4" y1="24" x2="12" y2="24" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="36" y1="24" x2="44" y2="24" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="fixed bottom-6 left-4 right-4 z-40 max-w-sm mx-auto flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsPickingLocation(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleConfirmLocation}
              className="flex-1"
            >
              Partir d'ici
            </Button>
          </div>
        </>
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

      {/* Bottom Sheet Drawer */}
      {!isPickingLocation && (
        <EventDrawer
          eventId={event._id}
          eventTitle={event.title}
          destinationAddress={event.destinationAddress}
          destinationLat={coords?.lat ?? event.destinationLat}
          destinationLng={coords?.lng ?? event.destinationLng}
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

      {/* Guest Auth Modal */}
      <GuestAuthModal
        isOpen={isGuestAuthOpen}
        eventId={event._id}
        eventTitle={event.title}
        onAuthenticated={() => setIsGuestAuthOpen(false)}
      />

      {/* Copy Link Toast */}
      <Toast
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        message="Lien de l'événement copié !"
        variant="success"
      />
    </motion.div>
  );
}
