"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Drawer } from "@/components/ui/Drawer";
import { getParticipantSession } from "@/lib/session";

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

  // Load saved session details
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

  // Update when prefilledAddress changes
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

      // Save driver session locally
      localStorage.setItem("bilengo_driver_name", finalName);
      localStorage.setItem("bilengo_driver_phone", finalPhone);

      // Reset and close
      setDescription("");
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la création du trajet.");
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
        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Derniers réglages
        </h3>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* LIEU DE DÉPART (NOM) */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
              LIEU DE DÉPART (NOM)
            </label>
            <input
              type="text"
              required
              value={departureAddress}
              onChange={(e) => setDepartureAddress(e.target.value)}
              placeholder="Ex: Balma"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* DESCRIPTION (OPTIONNEL) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                DESCRIPTION (OPTIONNEL)
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {description.length} / 256
              </span>
            </div>
            <textarea
              maxLength={256}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Musique à fond, petite pause prévue, ok pour les gros bagages..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
            />
          </div>

          {/* PLACES DISPONIBLES & HEURE DU DÉPART */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* PLACES DISPONIBLES */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                PLACES DISPONIBLES
              </label>
              <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTotalSeats(Math.max(1, totalSeats - 1))}
                  className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-white font-black flex items-center justify-center hover:bg-slate-800 transition-colors"
                >
                  -
                </button>
                <span className="font-extrabold text-white text-base">
                  {totalSeats}
                </span>
                <button
                  type="button"
                  onClick={() => setTotalSeats(Math.min(8, totalSeats + 1))}
                  className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-white font-black flex items-center justify-center hover:bg-slate-800 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* HEURE DU DÉPART */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                HEURE DU DÉPART
              </label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Driver session info badge */}
          {driverName && (
            <div className="text-[11px] text-slate-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <span>Conducteur : <strong className="text-white">{driverName}</strong></span>
              <span className="font-mono text-slate-500">{driverPhone}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl text-slate-400 hover:text-white font-bold text-sm transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all text-center disabled:opacity-50"
            >
              {isLoading ? "Publication..." : "Diffuser l'annonce"}
            </button>
          </div>
        </form>
      </div>
    </Drawer>
  );
}
