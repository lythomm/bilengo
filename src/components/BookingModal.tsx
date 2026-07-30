"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getParticipantSession, setParticipantSession } from "@/lib/session";
import { formatConvexError } from "@/lib/errors";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface BookingModalProps {
  carpool: {
    _id: Id<"carpools">;
    driverName: string;
    departureAddress: string;
    departureTime: string;
    availableSeats: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatInternationalPhone(phone: string): string {
  let clean = phone.replace(/[^0-9+]/g, "");
  if (clean.startsWith("0")) {
    clean = "+33" + clean.substring(1);
  }
  return clean.replace("+", "");
}

export function BookingModal({ carpool, isOpen, onClose }: BookingModalProps) {
  const requestBooking = useMutation(api.bookings.requestBooking);

  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<{
    confirmUrl: string;
    whatsappUrl: string;
    smsUrl: string;
    driverName: string;
    messageText: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBookingSuccess(null);
      setError(null);
      const session = getParticipantSession();
      if (session) {
        setPassengerName(session.firstName);
        setPassengerPhone(session.phone);
      }
    }
  }, [isOpen]);

  if (!isOpen || !carpool) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await requestBooking({
        carpoolId: carpool._id,
        passengerName,
        passengerPhone,
      });

      setParticipantSession(passengerName, passengerPhone);

      const origin = window.location.origin;
      const confirmUrl = `${origin}/booking/confirm?token=${res.validationToken}`;
      const messageText = `Salut ${res.driverName} ! Je suis ${passengerName} (${passengerPhone}). Je souhaite réserver 1 place de covoiturage pour ${res.eventTitle} au départ de ${res.departureAddress}. Clique ici pour me valider : ${confirmUrl}`;
      const encodedMsg = encodeURIComponent(messageText);

      const cleanPhone = formatInternationalPhone(res.driverPhone);
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
      const smsUrl = `sms:${res.driverPhone}?body=${encodedMsg}`;

      setBookingSuccess({
        confirmUrl,
        whatsappUrl,
        smsUrl,
        driverName: res.driverName,
        messageText,
      });
    } catch (err: unknown) {
      console.error(err);
      setError(
        formatConvexError(err, "Impossible d'effectuer la demande de réservation.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWebShare = async () => {
    if (!bookingSuccess) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Demande de covoiturage",
          text: bookingSuccess.messageText,
        });
      } catch (err) {
        console.error("Erreur de partage:", err);
      }
    } else {
      navigator.clipboard.writeText(bookingSuccess.messageText);
      alert("Message copié dans le presse-papier !");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Réserver une place"
      description={`Conducteur : ${carpool.driverName} • Départ : ${carpool.departureAddress}`}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {bookingSuccess ? (
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 text-2xl font-bold flex items-center justify-center mx-auto">
            ✓
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-neutral-900 font-heading">
              Demande enregistrée !
            </h3>
            <p className="text-neutral-500 text-xs">
              Envoyez maintenant la demande à {bookingSuccess.driverName} pour validation direct via WhatsApp ou SMS.
            </p>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-left text-xs text-neutral-700 space-y-1">
            <p className="font-semibold text-neutral-900">Message pré-rédigé :</p>
            <p className="italic text-neutral-600 line-clamp-3">"{bookingSuccess.messageText}"</p>
          </div>

          <div className="space-y-2 pt-2">
            <a
              href={bookingSuccess.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors border-none"
            >
              Envoyer via WhatsApp (Recommandé)
            </a>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={bookingSuccess.smsUrl}
                className="cal-button-secondary text-xs text-center justify-center"
              >
                SMS Natif
              </a>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleWebShare}
                className="w-full"
              >
                Partager / Copier
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Votre Prénom
            </label>
            <input
              type="text"
              required
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              placeholder="Ex: Camille"
              className="cal-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Votre N° Téléphone
            </label>
            <input
              type="tel"
              required
              value={passengerPhone}
              onChange={(e) => setPassengerPhone(e.target.value)}
              placeholder="06 12 34 56 78"
              className="cal-input"
            />
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600 leading-relaxed">
            Vos coordonnées seront uniquement transmises au conducteur pour confirmer le trajet.
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            className="w-full mt-2"
          >
            Demander ma place
          </Button>
        </form>
      )}
    </Modal>
  );
}
