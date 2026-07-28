"use client";

import { Drawer } from "@/components/ui/Drawer";
import { CarpoolItem } from "./MainEventDrawer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

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
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Détails du covoiturage
            </span>
            <h3 className="text-lg font-bold text-neutral-900 font-heading">
              {carpool.driverName}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1"
          >
            ✕
          </Button>
        </div>

        {/* Details Card */}
        <Card variant="gray" className="space-y-3 p-4">
          <div className="flex items-start gap-2 text-xs text-neutral-700">
            <span className="font-semibold text-neutral-900">Départ :</span>
            <span>{carpool.departureAddress}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-700">
            <span className="font-semibold text-neutral-900">Heure :</span>
            <span>
              {new Date(carpool.departureTime).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-700">
            <span className="font-semibold text-neutral-900">Places libres :</span>
            <Badge variant={carpool.availableSeats > 0 ? "emerald" : "default"}>
              {carpool.availableSeats} / {carpool.totalSeats}
            </Badge>
          </div>

          {carpool.description && (
            <div className="text-xs text-neutral-600 bg-white p-3 rounded-lg border border-neutral-200/60 italic">
              "{carpool.description}"
            </div>
          )}
        </Card>

        {/* Action Button */}
        {isDriver ? (
          <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-700 text-xs text-center font-medium">
            Vous proposez déjà un covoiturage pour cet événement.
          </div>
        ) : isPassenger ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs text-center font-medium">
            ✓ Vous avez réservé 1 place pour cet événement.
          </div>
        ) : (
          <Button
            variant="primary"
            size="md"
            disabled={carpool.availableSeats <= 0}
            onClick={() => onOpenBooking(carpool)}
            className="w-full"
          >
            Réserver 1 place
          </Button>
        )}
      </div>
    </Drawer>
  );
}
