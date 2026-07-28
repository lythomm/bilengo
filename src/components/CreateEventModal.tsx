"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

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
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Participants Max
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 1)}
              className="cal-input"
            />
          </div>
        </div>

        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600 flex items-center gap-2">
          <span>Offre gratuite : Jusqu'à 50 participants autorisés.</span>
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
