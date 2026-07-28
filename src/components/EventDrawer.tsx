"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";

interface CarpoolItem {
  _id: string;
  driverName: string;
  driverPhone?: string;
  departureAddress: string;
  departureTime: string;
  totalSeats: number;
  availableSeats: number;
  departureLat?: number;
  departureLng?: number;
}

interface EventDrawerProps {
  eventId: Id<"events">;
  eventTitle: string;
  carpools: CarpoolItem[];
  selectedCarpool: CarpoolItem | null;
  onSelectCarpool: (carpool: CarpoolItem | null) => void;
  onOpenBooking: (carpool: CarpoolItem) => void;
}

export function EventDrawer({
  eventId,
  eventTitle,
  carpools,
  selectedCarpool,
  onSelectCarpool,
  onOpenBooking,
}: EventDrawerProps) {
  const [activeTab, setActiveTab] = useState<"search" | "propose">("search");
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Propose form state
  const createCarpool = useMutation(api.carpools.createCarpool);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [departureAddress, setDepartureAddress] = useState("");
  const [departureLat, setDepartureLat] = useState<number | undefined>(undefined);
  const [departureLng, setDepartureLng] = useState<number | undefined>(undefined);
  const [departureTime, setDepartureTime] = useState("");
  const [totalSeats, setTotalSeats] = useState<number>(3);
  const [proposeLoading, setProposeLoading] = useState(false);
  const [proposeError, setProposeError] = useState<string | null>(null);

  const filteredCarpools = carpools.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.departureAddress.toLowerCase().includes(q) ||
      c.driverName.toLowerCase().includes(q)
    );
  });

  const handleProposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProposeError(null);

    if (!departureAddress.trim()) {
      setProposeError("Veuillez renseigner votre adresse de départ.");
      return;
    }

    setProposeLoading(true);

    try {
      let finalLat = departureLat;
      let finalLng = departureLng;

      // Geocode departure address if not captured via select
      if (finalLat === undefined || finalLng === undefined) {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
            departureAddress
          )}&limit=1`
        );
        if (res.ok) {
          const data = await res.json();
          const first = data.features?.[0];
          if (first?.geometry?.coordinates) {
            finalLng = first.geometry.coordinates[0];
            finalLat = first.geometry.coordinates[1];
          }
        }
      }

      await createCarpool({
        eventId,
        driverName,
        driverPhone,
        departureAddress,
        departureLat: finalLat,
        departureLng: finalLng,
        departureTime,
        totalSeats,
      });

      // Save driver session locally
      localStorage.setItem("bilengo_driver_name", driverName);
      localStorage.setItem("bilengo_driver_phone", driverPhone);

      // Reset form & switch tab
      setDriverName("");
      setDriverPhone("");
      setDepartureAddress("");
      setDepartureLat(undefined);
      setDepartureLng(undefined);
      setDepartureTime("");
      setActiveTab("search");
    } catch (err: any) {
      console.error(err);
      setProposeError(err.message || "Erreur lors de la création du trajet.");
    } finally {
      setProposeLoading(false);
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-in-out flex flex-col max-h-[85vh] ${
        isExpanded ? "translate-y-0" : "translate-y-[calc(100%-28px)]"
      }`}
    >
      {/* Drag Handle & Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full pt-3 pb-2 flex flex-col items-center cursor-pointer select-none"
      >
        <div className="w-12 h-1.5 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors" />
      </div>

      {/* Tabs */}
      <div className="px-4 pb-3 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800/80 flex-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("search");
              onSelectCarpool(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors text-center ${
              activeTab === "search"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🔍 Je cherche ({carpools.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("propose");
              onSelectCarpool(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors text-center ${
              activeTab === "propose"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🚗 Je propose un trajet
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedCarpool ? (
          /* Selected Carpool View */
          <div className="space-y-4 bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-400">Conducteur</span>
                <h4 className="text-lg font-bold text-white">
                  {selectedCarpool.driverName}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onSelectCarpool(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Fermer
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-amber-400">🚗 Départ :</span>
                <span className="font-semibold text-white">
                  {selectedCarpool.departureAddress}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">⏰ Heure :</span>
                <span>
                  {new Date(selectedCarpool.departureTime).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">💺 Places libres :</span>
                <span className="font-bold text-emerald-400">
                  {selectedCarpool.availableSeats} / {selectedCarpool.totalSeats}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={selectedCarpool.availableSeats <= 0}
              onClick={() => onOpenBooking(selectedCarpool)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-40"
            >
              Réserver 1 place
            </button>
          </div>
        ) : activeTab === "search" ? (
          /* Search Rides Tab */
          <div className="space-y-3">
            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Filtrer par ville ou départ..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            {filteredCarpools.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <div className="text-3xl">🚗</div>
                <p className="text-xs">
                  {searchQuery
                    ? "Aucun trajet pour cette recherche"
                    : "Aucun trajet proposé pour le moment"}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("propose")}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Soyez le premier à proposer un trajet !
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCarpools.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => onSelectCarpool(c)}
                    className="p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {c.driverName}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            c.availableSeats > 0
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {c.availableSeats > 0
                            ? `${c.availableSeats} place(s)`
                            : "Complet"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        📍 {c.departureAddress}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-[11px] text-amber-400 font-medium">
                        {new Date(c.departureTime).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">
                        Voir itinéraire →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Propose Ride Tab */
          <form onSubmit={handleProposeSubmit} className="space-y-3">
            {proposeError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                ⚠️ {proposeError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Votre Prénom *
              </label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Ex: Thomas"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Votre N° Téléphone *
              </label>
              <input
                type="tel"
                required
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Adresse de départ *
              </label>
              <AddressAutocomplete
                value={departureAddress}
                onChange={(val) => {
                  setDepartureAddress(val);
                  setDepartureLat(undefined);
                  setDepartureLng(undefined);
                }}
                onSelect={(item) => {
                  setDepartureAddress(item.label);
                  setDepartureLat(item.lat);
                  setDepartureLng(item.lng);
                }}
                placeholder="Ex: Gare de Lyon, Paris"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Heure de départ *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Places disponibles *
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={proposeLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2"
            >
              {proposeLoading ? "Publication..." : "🚗 Publier mon trajet"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
