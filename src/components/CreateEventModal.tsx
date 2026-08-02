"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { formatConvexError } from "@/lib/errors";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

import { PRICING_TIERS, getTierByQuota } from "@/config/pricing";

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
  const [maxParticipants, setMaxParticipants] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const selectedTier = getTierByQuota(maxParticipants);
      const res = await createEvent({
        title,
        destinationAddress,
        destinationLat,
        destinationLng,
        eventDate,
        maxParticipants,
        tierId: selectedTier.id,
      });

      onClose();
      if (onSuccess) onSuccess(res.slug);
    } catch (err: unknown) {
      console.error(err);
      setError(
        formatConvexError(err, "Une erreur s'est produite lors de la création de l'événement.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Créer un événement"
      description="Remplissez les détails pour générer le lien de covoiturage"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
            Nom de l'événement
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Mariage Julie & Thomas, Festival d'été"
            className="cal-input"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
            Adresse exacte de destination
          </label>
          <AddressAutocomplete
            value={destinationAddress}
            onChange={setDestinationAddress}
            onSelect={(addr) => {
              setDestinationLat(addr.lat);
              setDestinationLng(addr.lng);
            }}
            placeholder="Rechercher une adresse..."
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Date & Heure
            </label>
            <input
              type="datetime-local"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="cal-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Participants Max
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: "50", value: 50 },
                { label: "100", value: 100 },
                { label: "250", value: 250 },
                { label: "500", value: 500 },
                { label: "1000+", value: 1000 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMaxParticipants(opt.value)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    maxParticipants === opt.value
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                      : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={loading}
          className="w-full mt-2"
        >
          Publier l'événement
        </Button>
      </form>
    </Modal>
  );
}
