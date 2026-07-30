"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Drawer } from "@/components/ui/Drawer";
import { getParticipantSession } from "@/lib/session";
import { formatConvexError } from "@/lib/errors";
import { Button } from "@/components/ui/Button";

interface PrefilledAddress {
  label: string;
  lat: number;
  lng: number;
}

interface ProposeFinalizeDrawerProps {
  eventId: Id<"events">;
  prefilledAddress: PrefilledAddress | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProposeFinalizeDrawer({
  eventId,
  prefilledAddress,
  isOpen,
  onClose,
  onSuccess,
}: ProposeFinalizeDrawerProps) {
  const createCarpool = useMutation(api.carpools.createCarpool);

  const [isExpanded, setIsExpanded] = useState(true);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [departureAddress, setDepartureAddress] = useState("");
  const [departureLat, setDepartureLat] = useState<number | undefined>(undefined);
  const [departureLng, setDepartureLng] = useState<number | undefined>(undefined);
  const [departureTime, setDepartureTime] = useState("20:00");
  const [totalSeats, setTotalSeats] = useState<number>(3);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getParticipantSession();
    if (session) {
      setDriverName(session.firstName);
      setDriverPhone(session.phone);
    } else {
      const savedName = localStorage.getItem("bilengo_driver_name") || "";
      const savedPhone = localStorage.getItem("bilengo_driver_phone") || "";
      if (savedName) setDriverName(savedName);
      if (savedPhone) setDriverPhone(savedPhone);
    }
  }, [isOpen]);

  useEffect(() => {
    if (prefilledAddress) {
      setDepartureAddress(prefilledAddress.label);
      setDepartureLat(prefilledAddress.lat);
      setDepartureLng(prefilledAddress.lng);
      setIsExpanded(true);
    }
  }, [prefilledAddress]);

  if (!isOpen || !prefilledAddress) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalName = driverName.trim() || "Conducteur";
    const finalPhone = driverPhone.trim() || "0600000000";

    if (!departureAddress.trim()) {
      setError("Veuillez renseigner votre adresse de départ.");
      return;
    }

    setIsLoading(true);

    try {
      let finalLat = departureLat;
      let finalLng = departureLng;

      if (finalLat === undefined || finalLng === undefined) {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
            departureAddress
          )}&limit=1`
        );
        if (res.ok) {
          const data = await res.json();
          const first = data.features?.[0];
          if (first?.geometry?.coordinates) {
            finalLng = first.geometry.coordinates[0];
            finalLat = first.geometry.coordinates[1];
          }
        }
      }

      const today = new Date().toISOString().split("T")[0];
      const fullTime = departureTime.includes("T")
        ? departureTime
        : `${today}T${departureTime || "20:00"}`;

      await createCarpool({
        eventId,
        driverName: finalName,
        driverPhone: finalPhone,
        departureAddress,
        departureLat: finalLat,
        departureLng: finalLng,
        departureTime: fullTime,
        totalSeats,
        description,
      });

      localStorage.setItem("bilengo_driver_name", finalName);
      localStorage.setItem("bilengo_driver_phone", finalPhone);

      setDescription("");
      onSuccess();
    } catch (err: unknown) {
      console.error(err);
      setError(formatConvexError(err, "Erreur lors de la création du trajet."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      isExpanded={isExpanded}
      onToggleExpand={() => setIsExpanded(!isExpanded)}
      allowCollapseToHandle={true}
      className="max-w-lg mx-auto"
    >
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-bold text-neutral-900 tracking-tight font-heading">
          Finaliser le trajet
        </h3>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-neutral-800 uppercase tracking-wider mb-1">
              Lieu de départ
            </label>
            <input
              type="text"
              required
              value={departureAddress}
              onChange={(e) => setDepartureAddress(e.target.value)}
              placeholder="Ex: Paris 11e"
              className="cal-input text-sm font-medium"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs sm:text-sm font-bold text-neutral-800 uppercase tracking-wider">
                Note / Description (Optionnel)
              </label>
              <span className="text-xs text-neutral-500 font-mono">
                {description.length} / 256
              </span>
            </div>
            <textarea
              maxLength={256}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Musique à fond, petite pause prévue..."
              className="cal-input text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-800 uppercase tracking-wider mb-1">
                Places disponibles
              </label>
              <div className="flex items-center justify-between px-3 py-2 rounded-md border border-neutral-200 bg-white">
                <button
                  type="button"
                  onClick={() => setTotalSeats(Math.max(1, totalSeats - 1))}
                  className="w-8 h-8 rounded bg-neutral-100 text-neutral-800 font-bold flex items-center justify-center border-none cursor-pointer hover:bg-neutral-200"
                >
                  -
                </button>
                <span className="font-bold text-neutral-900 text-base">
                  {totalSeats}
                </span>
                <button
                  type="button"
                  onClick={() => setTotalSeats(Math.min(8, totalSeats + 1))}
                  className="w-8 h-8 rounded bg-neutral-100 text-neutral-800 font-bold flex items-center justify-center border-none cursor-pointer hover:bg-neutral-200"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-800 uppercase tracking-wider mb-1">
                Heure de départ
              </label>
              <input
                type="time"
                required
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="cal-input text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="flex-1"
            >
              Publier le trajet
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
}
