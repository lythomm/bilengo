"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { getParticipantSession, setParticipantSession } from "@/lib/session";

interface CreateCarpoolModalProps {
  eventId: Id<"events">;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCarpoolModal({
  eventId,
  eventTitle,
  isOpen,
  onClose,
}: CreateCarpoolModalProps) {
  const createCarpool = useMutation(api.carpools.createCarpool);

  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [departureAddress, setDepartureAddress] = useState("");
  const [departureLat, setDepartureLat] = useState<number | undefined>();
  const [departureLng, setDepartureLng] = useState<number | undefined>();
  const [departureTime, setDepartureTime] = useState("");
  const [totalSeats, setTotalSeats] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const session = getParticipantSession();
      if (session) {
        setDriverName(session.firstName);
        setDriverPhone(session.phone);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Save session info
      setParticipantSession(driverName, driverPhone);

      await createCarpool({
        eventId,
        driverName,
        driverPhone,
        departureAddress,
        departureLat,
        departureLng,
        departureTime,
        totalSeats,
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Une erreur s'est produite lors de la publication du trajet."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Proposer un covoiturage</h2>
            <p className="text-xs text-amber-400 font-medium mt-0.5">
              Destination : {eventTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Votre Prénom
              </label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Ex: Thomas"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Votre N° Téléphone
              </label>
              <input
                type="tel"
                required
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Ville / Adresse de départ
            </label>
            <AddressAutocomplete
              value={departureAddress}
              onChange={setDepartureAddress}
              onSelect={(addr) => {
                setDepartureLat(addr.lat);
                setDepartureLng(addr.lng);
              }}
              placeholder="Ex: Lyon Part-Dieu, Nantes..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Heure de départ
              </label>
              <input
                type="datetime-local"
                required
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Nombre de places offertes
              </label>
              <input
                type="number"
                min={1}
                max={9}
                required
                value={totalSeats}
                onChange={(e) => setTotalSeats(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold transition-colors duration-200 disabled:opacity-50 mt-2"
          >
            {loading ? "Publication..." : "Publier mon trajet"}
          </button>
        </form>
      </div>
    </div>
  );
}
