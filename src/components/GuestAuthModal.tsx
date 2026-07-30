"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { setParticipantSession } from "@/lib/session";
import { formatConvexError } from "@/lib/errors";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { User, Phone, ArrowRight, ShieldCheck } from "lucide-react";

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
      if (eventId) {
        await registerParticipantMutation({
          eventId,
          name: cleanName,
          phone: cleanPhone,
          transportMode: "autonomous",
        });
      }

      const session = setParticipantSession(cleanName, cleanPhone);
      onAuthenticated({ firstName: session.firstName, phone: session.phone });
    } catch (err: unknown) {
      setError(formatConvexError(err, "Erreur lors de l'enregistrement."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      showCloseButton={false}
      maxWidthClass="max-w-md"
    >
      <div className="space-y-5">
        {/* Centered Header & Title */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-neutral-900 font-heading tracking-tight">
            Rejoindre l'événement
          </h3>
          <div className="mt-2 inline-block">
            <span className="bg-neutral-900 text-white font-bold px-3.5 py-1.5 rounded-lg text-sm inline-block tracking-tight font-heading shadow-xs">
              {eventTitle}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-2.5 leading-relaxed">
            Saisis tes coordonnées pour consulter la carte et contacter tes covoitureurs.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prénom */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              PRÉNOM *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ex: Thomas"
                className="cal-input !pl-10 font-medium"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              N° DE TÉLÉPHONE *
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="cal-input !pl-10 font-mono text-sm"
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Uniquement transmis aux covoitureurs de la soirée.
            </p>
          </div>

          {/* Submit CTA */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            rightIcon={!isSubmitting ? <ArrowRight className="w-4 h-4" /> : undefined}
            className="w-full py-3 text-sm font-semibold mt-3 active:scale-[0.98] transition-transform"
          >
            Accéder à la carte
          </Button>

          {/* Footer wording */}
          <div className="text-center pt-1">
            <span className="text-[11px] text-neutral-400 font-medium tracking-wide">
              En route pour la fête avec <span className="font-bold text-neutral-800 font-heading">BilenGo</span>
            </span>
          </div>
        </form>
      </div>
    </Modal>
  );
}
