"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { setParticipantSession } from "@/lib/session";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface GuestAuthModalProps {
  isOpen: boolean;
  eventId?: Id<"events">;
  eventTitle: string;
  onAuthenticated: (session: { firstName: string; phone: string }) => void;
}

export function GuestAuthModal({
  isOpen,
  eventId,
  eventTitle,
  onAuthenticated,
}: GuestAuthModalProps) {
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerParticipantMutation = useMutation(api.participants.registerParticipant);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = firstName.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanPhone) {
      setError("Veuillez renseigner votre prénom et votre numéro de téléphone.");
      return;
    }

    setIsSubmitting(true);
    try {
      const session = setParticipantSession(cleanName, cleanPhone);

      if (eventId) {
        await registerParticipantMutation({
          eventId,
          name: cleanName,
          phone: cleanPhone,
          transportMode: "autonomous",
        });
      }

      onAuthenticated({ firstName: session.firstName, phone: session.phone });
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      showCloseButton={false}
      title="Rejoindre l'événement"
      description={eventTitle}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
            Votre Prénom *
          </label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ex: Thomas"
            className="cal-input"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
            Votre N° de Téléphone *
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="06 12 34 56 78"
            className="cal-input"
          />
        </div>

        <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} className="w-full mt-2">
          Accéder à la carte & covoiturages
        </Button>
      </form>
    </Modal>
  );
}
