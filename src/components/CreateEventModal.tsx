"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AddressAutocomplete } from "./AddressAutocomplete";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (slug: string) => void;
}

export function CreateEventModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateEventModalProps) {
  const createEvent = useMutation(api.events.createEvent);

  const [title, setTitle] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [destinationLat, setDestinationLat] = useState<number | undefined>();
  const [destinationLng, setDestinationLng] = useState<number | undefined>();
  const [eventDate, setEventDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await createEvent({
        title,
        destinationAddress,
        destinationLat,
        destinationLng,
        eventDate,
        maxParticipants,
      });

      onClose();
      if (onSuccess) onSuccess(res.slug);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Une erreur s'est produite lors de la création de l'événement."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Créer un nouvel événement
          </h2>
          <button
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Nom de l'événement
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Festival de musique de l'été, Mariage Julie & Thomas"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Adresse exacte de destination
            </label>
            <AddressAutocomplete
              value={destinationAddress}
              onChange={setDestinationAddress}
              onSelect={(addr) => {
                setDestinationLat(addr.lat);
                setDestinationLng(addr.lng);
              }}
              placeholder="Rechercher une adresse (autocomplétion BAN)..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Date & Heure de l'événement
              </label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Participants max (Gratuit: 50)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center gap-2">
            <span>✨</span>
            <span>
              Offre gratuite : Jusqu'à 50 participants autorisés sur cet événement.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Création en cours..." : "Publier l'événement"}
          </button>
        </form>
      </div>
    </div>
  );
}
