"use client";

import { useState } from "react";
import Link from "next/link";

interface Guest {
  name: string;
  phone: string;
  proposesCarpool: boolean;
  isInCarpool: boolean;
  details: string[];
}

interface Booking {
  _id: string;
  passengerName: string;
  passengerPhone: string;
  status: "pending" | "confirmed" | "cancelled";
}

interface CarpoolDetail {
  _id: string;
  driverName: string;
  driverPhone: string;
  departureAddress: string;
  departureTime: string;
  totalSeats: number;
  availableSeats: number;
  status: "active" | "cancelled" | "full";
  confirmedBookingsCount: number;
  pendingBookingsCount: number;
  bookings: Booking[];
}

interface OrganizerData {
  isOrganizer: boolean;
  event: {
    _id: string;
    title: string;
    destinationAddress: string;
    eventDate: string;
    maxParticipants: number;
    slug: string;
  };
  carpools: CarpoolDetail[];
  guests: Guest[];
  stats: {
    totalGuests: number;
    totalDrivers: number;
    totalSeatsOffered: number;
    totalSeatsBooked: number;
    totalSeatsAvailable: number;
  };
}

interface OrganizerEventViewProps {
  organizerData: OrganizerData;
  onSwitchToMap: () => void;
  onCopyLink: () => void;
  copied: boolean;
}

export function OrganizerEventView({
  organizerData,
  onSwitchToMap,
  onCopyLink,
  copied,
}: OrganizerEventViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"guests" | "carpools">("guests");

  const { event, stats, guests, carpools } = organizerData;

  const filteredGuests = guests.filter((g) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.phone.toLowerCase().includes(q) ||
      g.details.some((d) => d.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
            >
              B
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  Vue Organisateur
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  • {event.title}
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight truncate max-w-xs sm:max-w-md">
                {event.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onCopyLink}
              className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              {copied ? "✓ Lien copié !" : "🔗 Partager le lien"}
            </button>

            <button
              type="button"
              onClick={onSwitchToMap}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <span>🗺️ Voir la carte</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner & Location Info */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Tableau de bord de l'événement
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {event.title}
            </h2>
            <p className="text-slate-400 text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>📍 {event.destinationAddress}</span>
              <span>
                📅{" "}
                {new Date(event.eventDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={onSwitchToMap}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-extrabold shadow-xl shadow-amber-500/20 transition-all text-center flex items-center justify-center gap-2"
            >
              <span>🗺️ Ouvrir la carte des trajets (Vue Invité)</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Total Invités</span>
              <span className="text-xl">👥</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stats.totalGuests}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Participants actifs répertoriés
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Conducteurs</span>
              <span className="text-xl">🚗</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">
              {stats.totalDrivers}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Trajets créés sur la plateforme
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Places Réservées</span>
              <span className="text-xl">💺</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {stats.totalSeatsBooked}{" "}
              <span className="text-sm font-normal text-slate-400">
                / {stats.totalSeatsOffered}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Places proposées au total
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Places Libres</span>
              <span className="text-xl">📍</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400">
              {stats.totalSeatsAvailable}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Encore disponibles pour les passagers
            </div>
          </div>
        </div>

        {/* Directory Section */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          {/* Section Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("guests")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "guests"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                👥 Répertoire des Invités ({guests.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("carpools")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "carpools"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🚗 Trajets & Covoiturages ({carpools.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Rechercher prénom, tél..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2 text-xs text-slate-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Tab Content: Guests */}
          {activeTab === "guests" && (
            <div className="space-y-4">
              {filteredGuests.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <div className="text-3xl">🔍</div>
                  <p className="text-sm font-medium">Aucun invité ne correspond à la recherche.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Invité</th>
                        <th className="py-3 px-4">Téléphone</th>
                        <th className="py-3 px-4">Statut Covoiturage</th>
                        <th className="py-3 px-4">Détails</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredGuests.map((guest, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">
                            {guest.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {guest.phone || "—"}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1.5">
                              {guest.proposesCarpool && (
                                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[11px]">
                                  🚗 Propose un covoiturage
                                </span>
                              )}
                              {guest.isInCarpool && (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                                  💺 Dans un covoiturage
                                </span>
                              )}
                              {!guest.proposesCarpool && !guest.isInCarpool && (
                                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[11px]">
                                  Sans covoiturage
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            <ul className="list-disc list-inside space-y-0.5">
                              {guest.details.map((det, dIdx) => (
                                <li key={dIdx}>{det}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Carpools */}
          {activeTab === "carpools" && (
            <div className="space-y-4">
              {carpools.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <div className="text-3xl">🚗</div>
                  <p className="text-sm font-medium">
                    Aucun covoiturage n'a été créé pour cet événement pour le moment.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {carpools.map((c) => (
                    <div
                      key={c._id}
                      className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs text-amber-400 font-semibold">Conducteur</span>
                          <h4 className="text-lg font-bold text-white">{c.driverName}</h4>
                          <p className="text-xs font-mono text-slate-400">{c.driverPhone}</p>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            c.availableSeats > 0
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {c.availableSeats > 0
                            ? `${c.availableSeats}/${c.totalSeats} places libres`
                            : "Complet"}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-3 rounded-xl">
                        <div>📍 Départ : <span className="font-semibold text-white">{c.departureAddress}</span></div>
                        <div>⏰ Heure : {new Date(c.departureTime).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                      </div>

                      {/* Passengers List */}
                      <div className="space-y-2 pt-2 border-t border-slate-900">
                        <div className="text-xs font-bold text-slate-400">
                          Passagers inscrits ({c.bookings.length}) :
                        </div>
                        {c.bookings.length === 0 ? (
                          <div className="text-xs text-slate-500 italic">Aucune réservation.</div>
                        ) : (
                          <div className="space-y-1.5">
                            {c.bookings.map((b) => (
                              <div
                                key={b._id}
                                className="flex items-center justify-between text-xs bg-slate-900 px-3 py-2 rounded-lg"
                              >
                                <div>
                                  <span className="font-semibold text-white">{b.passengerName}</span>
                                  <span className="text-slate-400 font-mono ml-2">({b.passengerPhone})</span>
                                </div>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                    b.status === "confirmed"
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : b.status === "pending"
                                      ? "bg-amber-500/20 text-amber-400"
                                      : "bg-slate-800 text-slate-500"
                                  }`}
                                >
                                  {b.status === "confirmed"
                                    ? "Confirmé"
                                    : b.status === "pending"
                                    ? "En attente"
                                    : "Annulé"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
