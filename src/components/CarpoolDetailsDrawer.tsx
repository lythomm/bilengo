"use client";

import { Drawer } from "@/components/ui/Drawer";
import { CarpoolItem } from "./MainEventDrawer";

interface CarpoolDetailsDrawerProps {
  carpool: CarpoolItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: (carpool: CarpoolItem) => void;
  isDriver?: boolean;
  isPassenger?: boolean;
}

export function CarpoolDetailsDrawer({
  carpool,
  isOpen,
  onClose,
  onOpenBooking,
  isDriver = false,
  isPassenger = false,
}: CarpoolDetailsDrawerProps) {
  if (!isOpen || !carpool) return null;

  return (
    <Drawer
      isOpen={isOpen}
      allowCollapseToHandle={true}
      className="max-w-lg mx-auto"
    >
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Détails du covoiturage
            </span>
            <h3 className="text-xl font-extrabold text-white">
              {carpool.driverName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white font-bold flex items-center justify-center text-xs transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Details Card */}
        <div className="space-y-3 bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-start gap-2.5 text-xs text-slate-200">
            <span className="text-amber-400 font-bold">🚗 Départ :</span>
            <span className="font-semibold text-white">
              {carpool.departureAddress}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <span className="text-amber-400 font-bold">⏰ Heure :</span>
            <span>
              {new Date(carpool.departureTime).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <span className="text-emerald-400 font-bold">💺 Places libres :</span>
            <span className="font-bold text-emerald-400">
              {carpool.availableSeats} / {carpool.totalSeats}
            </span>
          </div>

          {carpool.description && (
            <div className="text-xs text-slate-300 bg-slate-900/80 border border-slate-800 p-3 rounded-xl italic">
              "{carpool.description}"
            </div>
          )}
        </div>

        {/* Action Button */}
        {isDriver ? (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-xs text-center font-medium">
            ⚠️ Vous proposez déjà un covoiturage pour cet événement.
          </div>
        ) : isPassenger ? (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs text-center font-medium">
            ✓ Vous avez déjà réservé 1 place pour cet événement.
          </div>
        ) : (
          <button
            type="button"
            disabled={carpool.availableSeats <= 0}
            onClick={() => onOpenBooking(carpool)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-amber-500/20 disabled:opacity-40"
          >
            Réserver 1 place
          </button>
        )}
      </div>
    </Drawer>
  );
}
