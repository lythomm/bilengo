"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getParticipantSession, setParticipantSession } from "@/lib/session";

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
      setParticipantSession(passengerName, passengerPhone);

      const res = await requestBooking({
        carpoolId: carpool._id,
        passengerName,
        passengerPhone,
      });

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
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Impossible d'effectuer la demande de réservation."
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Réserver une place</h2>
            <p className="text-xs text-amber-400 font-medium mt-0.5">
              Conducteur : {carpool.driverName} ({carpool.departureAddress})
            </p>
          </div>
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

        {bookingSuccess ? (
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-3xl flex items-center justify-center mx-auto">
              ✓
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">
                Demande enregistrée !
              </h3>
              <p className="text-slate-400 text-sm">
                Envoyez maintenant la demande à {bookingSuccess.driverName} pour qu'il valide votre place en 1 clic.
              </p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Message à envoyer :</p>
              <p className="italic line-clamp-3">"{bookingSuccess.messageText}"</p>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={bookingSuccess.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <span>💬</span>
                <span>Envoyer via WhatsApp (Recommandé)</span>
              </a>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={bookingSuccess.smsUrl}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>📱</span>
                  <span>SMS Natif</span>
                </a>

                <button
                  onClick={handleWebShare}
                  className="py-2.5 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>🔗</span>
                  <span>Partager / Copier</span>
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-4 text-xs text-slate-500 hover:text-slate-300 underline"
            >
              Fermer la fenêtre
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Votre Prénom
              </label>
              <input
                type="text"
                required
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="Ex: Camille"
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
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 leading-relaxed">
              💡 Aucune création de compte requise. Vos coordonnées seront uniquement transmises au conducteur pour confirmer le trajet.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm transition-all duration-200 disabled:opacity-50 mt-2 shadow-lg shadow-amber-500/20"
            >
              {loading ? "Préparation de la demande..." : "Demander ma place"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
