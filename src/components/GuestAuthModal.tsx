"use client";

import { useState } from "react";
import { setParticipantSession } from "@/lib/session";

interface GuestAuthModalProps {
  isOpen: boolean;
  eventTitle: string;
  onAuthenticated: (session: { firstName: string; phone: string }) => void;
}

export function GuestAuthModal({
  isOpen,
  eventTitle,
  onAuthenticated,
}: GuestAuthModalProps) {
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = firstName.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanPhone) {
      setError("Veuillez renseigner votre prénom et votre numéro de téléphone.");
      return;
    }

    const session = setParticipantSession(cleanName, cleanPhone);
    onAuthenticated({ firstName: session.firstName, phone: session.phone });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            B
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight pt-2">
            Rejoindre l'événement
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">
            {eventTitle}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Votre Prénom *
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ex: Thomas"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Votre N° de Téléphone *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 12 34 56 78"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all transform active:scale-95 mt-2"
          >
            Accéder à la carte & covoit →
          </button>
        </form>
      </div>
    </div>
  );
}
