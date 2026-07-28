"use client";

import { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CreateCarpoolModal } from "@/components/CreateCarpoolModal";
import { BookingModal } from "@/components/BookingModal";
import Link from "next/link";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default function EventPage({ params }: EventPageProps) {
  const { slug } = use(params);
  const [isCarpoolModalOpen, setIsCarpoolModalOpen] = useState(false);
  const [selectedCarpool, setSelectedCarpool] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const event = useQuery(api.events.getEventBySlug, { slug });
  const carpools = useQuery(
    api.carpools.getCarpoolsByEvent,
    event?._id ? { eventId: event._id } : "skip"
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredCarpools = (carpools || []).filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.departureAddress.toLowerCase().includes(q) ||
      c.driverName.toLowerCase().includes(q)
    );
  });

  if (event === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse text-lg">Chargement de l'événement...</div>
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4 text-center">
        <h1 className="text-3xl font-bold mb-3">Événement introuvable</h1>
        <p className="text-slate-400 mb-6">
          Ce lien d'événement n'existe pas ou a été supprimé.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
        >
          Retourner à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base">
              B
            </div>
            <span className="font-bold text-white tracking-tight">Bilengo</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            {copied ? "✓ Link copié !" : "Partager l'événement"}
          </button>
        </div>
      </header>

      {/* Main Event Hero & Carpool Board */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Event Info Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                📍 Tous les covoiturages vont ici
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {event.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-300 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400">📅</span>
                  <span>
                    {new Date(event.eventDate).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400">🏁</span>
                  <span>{event.destinationAddress}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCarpoolModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-colors text-center"
              >
                + Proposer un trajet
              </button>
            </div>
          </div>
        </div>

        {/* Carpool Listings & Search Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Trajets de covoiturage disponibles
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Recherchez par ville ou adresse de départ pour trouver votre trajet.
              </p>
            </div>

            {/* Search Filter */}
            <div className="w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Filtrer par ville de départ..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {carpools === undefined ? (
            <div className="py-12 text-center text-slate-500 animate-pulse">
              Chargement des trajets en cours...
            </div>
          ) : filteredCarpools.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center space-y-4">
              <div className="text-4xl">🚗</div>
              <h3 className="text-lg font-bold text-white">
                {searchQuery
                  ? "Aucun trajet correspondant à votre recherche"
                  : "Aucun trajet proposé pour le moment"}
              </h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                {searchQuery
                  ? "Essayez une autre recherche ou proposez un trajet depuis votre ville !"
                  : "Vous avez une voiture et vous vous rendez à cet événement ? Soyez le premier à proposer des places à bord !"}
              </p>
              <button
                type="button"
                onClick={() => setIsCarpoolModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-colors"
              >
                Proposer un trajet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCarpools.map((c) => (
                <div
                  key={c._id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-colors shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-slate-400 font-medium">Conducteur</span>
                        <h4 className="text-lg font-bold text-white">{c.driverName}</h4>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          c.availableSeats > 0
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/10 border border-red-500/20 text-red-400"
                        }`}
                      >
                        {c.availableSeats > 0
                          ? `${c.availableSeats} place(s) libre(s)`
                          : "Complet"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400">🚗 Départ :</span>
                        <span className="font-medium text-white">{c.departureAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">⏰ Heure :</span>
                        <span>
                          {new Date(c.departureTime).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Capacité : {c.totalSeats} places au total
                    </span>
                    <button
                      type="button"
                      disabled={c.availableSeats <= 0}
                      onClick={() => setSelectedCarpool(c)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-amber-500/10 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Réserver 1 place
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {event && (
        <CreateCarpoolModal
          eventId={event._id}
          eventTitle={event.title}
          isOpen={isCarpoolModalOpen}
          onClose={() => setIsCarpoolModalOpen(false)}
        />
      )}

      <BookingModal
        carpool={selectedCarpool}
        isOpen={!!selectedCarpool}
        onClose={() => setSelectedCarpool(null)}
      />
    </div>
  );
}
