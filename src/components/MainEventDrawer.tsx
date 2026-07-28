"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Drawer } from "@/components/ui/Drawer";
import { getParticipantSession } from "@/lib/session";

export interface CarpoolItem {
  _id: string;
  driverName: string;
  driverPhone?: string;
  departureAddress: string;
  departureTime: string;
  totalSeats: number;
  availableSeats: number;
  departureLat?: number;
  departureLng?: number;
  description?: string;
}

interface MainEventDrawerProps {
  eventId: Id<"events">;
  carpools: CarpoolItem[];
  selectedCarpool: CarpoolItem | null;
  onSelectCarpool: (carpool: CarpoolItem | null) => void;
  onOpenBooking: (carpool: CarpoolItem) => void;
  onStartPickLocation?: () => void;
}

function cleanPhone(p?: string) {
  if (!p) return "";
  return p.replace(/[^0-9]/g, "");
}

export function MainEventDrawer({
  eventId,
  carpools,
  selectedCarpool,
  onSelectCarpool,
  onOpenBooking,
  onStartPickLocation,
}: MainEventDrawerProps) {
  const [activeTab, setActiveTab] = useState<"search" | "propose">("search");
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (selectedCarpool) {
      setIsExpanded(true);
    }
  }, [selectedCarpool]);

  const session = getParticipantSession();
  const userPhone = cleanPhone(
    session?.phone ||
      (typeof window !== "undefined"
        ? localStorage.getItem("bilengo_driver_phone") ||
          localStorage.getItem("bilengo_phone") ||
          ""
        : "")
  );

  const userRole = useQuery(
    api.carpools.getUserEventRole,
    eventId && userPhone ? { eventId, userPhone } : "skip"
  );

  const isDriver = userRole?.role === "driver";
  const isPassenger = userRole?.role === "passenger";

  const myProposedCarpools = carpools.filter((c) => {
    if (userPhone && c.driverPhone && cleanPhone(c.driverPhone) === userPhone) {
      return true;
    }
    return false;
  });

  const filteredCarpools = carpools.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.departureAddress.toLowerCase().includes(q) ||
      c.driverName.toLowerCase().includes(q)
    );
  });

  return (
    <Drawer
      isExpanded={isExpanded}
      onToggleExpand={() => setIsExpanded(!isExpanded)}
      allowCollapseToHandle={true}
    >
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
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🚗 Je propose {myProposedCarpools.length > 0 ? `(1)` : ""}
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="p-4 space-y-4">
        {activeTab === "search" ? (
          /* Search Rides Tab */
          <div className="space-y-3">
            {isPassenger && userRole?.carpool && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center justify-between">
                <span>
                  ✓ Vous avez réservé 1 place chez{" "}
                  <strong>{userRole.carpool.driverName}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => onSelectCarpool(userRole.carpool as any)}
                  className="underline font-bold hover:text-emerald-300"
                >
                  Voir
                </button>
              </div>
            )}

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
                {!isDriver && !isPassenger && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("propose")}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    Soyez le premier à proposer un trajet !
                  </button>
                )}
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
        ) : isPassenger ? (
          /* Passenger Restriction Banner in Propose Tab */
          <div className="py-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
              🚏
            </div>
            <h3 className="text-lg font-extrabold text-white">
              Vous êtes passager
            </h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Vous avez déjà réservé une place dans le covoiturage de{" "}
              <strong className="text-white">
                {userRole?.carpool?.driverName || "un conducteur"}
              </strong>
              . Vous ne pouvez pas proposer de trajet pour le même événement.
            </p>
            {userRole?.carpool && (
              <button
                type="button"
                onClick={() => onSelectCarpool(userRole.carpool as any)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Voir mon covoiturage réservé →
              </button>
            )}
          </div>
        ) : myProposedCarpools.length > 0 ? (
          /* My Proposed Carpool View */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">
                Mon covoiturage proposé
              </h3>
            </div>

            {myProposedCarpools.slice(0, 1).map((c) => (
              <div
                key={c._id}
                className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Conducteur (Vous)
                    </span>
                    <h4 className="text-base font-bold text-white">
                      {c.driverName}
                    </h4>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      c.availableSeats > 0
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {c.availableSeats > 0
                      ? `${c.availableSeats} / ${c.totalSeats} places libres`
                      : "Complet"}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl">
                  <div>
                    📍 Départ :{" "}
                    <span className="font-semibold text-white">
                      {c.departureAddress}
                    </span>
                  </div>
                  <div>
                    ⏰ Heure :{" "}
                    {new Date(c.departureTime).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {c.description && (
                    <div className="pt-1 italic text-slate-400 border-t border-slate-800/60 mt-1">
                      "{c.description}"
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCarpool(c)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors border border-slate-800"
                >
                  Voir mon itinéraire sur la carte →
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Propose Ride CTA View */
          <div className="py-6 flex flex-col items-center text-center space-y-6">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              Gérer ton covoit
            </h3>

            <div className="w-24 h-24 rounded-3xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-4xl shadow-inner">
              🚗
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-xs leading-relaxed">
              Deviens le héros de la soirée en proposant des places dans ton carrosse !
            </p>

            <button
              type="button"
              onClick={() => {
                if (onStartPickLocation) {
                  onStartPickLocation();
                }
              }}
              className="w-full max-w-xs py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all transform active:scale-95"
            >
              Proposer un covoit
            </button>
          </div>
        )}
      </div>
    </Drawer>
  );
}
