"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { getParticipantSession, setParticipantSession } from "@/lib/session";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Proposer un covoiturage"
      description={`Destination : ${eventTitle}`}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Votre Prénom
            </label>
            <input
              type="text"
              required
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="Ex: Thomas"
              className="cal-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              N° Téléphone
            </label>
            <input
              type="tel"
              required
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              placeholder="06 12 34 56 78"
              className="cal-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
            Adresse de départ
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Heure de départ
            </label>
            <input
              type="datetime-local"
              required
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="cal-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Places offertes
            </label>
            <input
              type="number"
              min={1}
              max={9}
              required
              value={totalSeats}
              onChange={(e) => setTotalSeats(parseInt(e.target.value) || 1)}
              className="cal-input"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={loading}
          className="w-full mt-2"
        >
          Publier mon trajet
        </Button>
      </form>
    </Modal>
  );
}
