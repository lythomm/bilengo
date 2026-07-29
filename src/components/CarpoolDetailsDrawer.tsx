"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Drawer } from "@/components/ui/Drawer";
import { Modal } from "@/components/ui/Modal";
import { CarpoolItem } from "./MainEventDrawer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getParticipantSession } from "@/lib/session";
import { Trash2 } from "lucide-react";

interface CarpoolDetailsDrawerProps {
  carpool: CarpoolItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: (carpool: CarpoolItem) => void;
  isDriver?: boolean;
  isPassenger?: boolean;
}

function cleanPhone(p?: string) {
  if (!p) return "";
  return p.replace(/[^0-9]/g, "");
}

export function CarpoolDetailsDrawer({
  carpool,
  isOpen,
  onClose,
  onOpenBooking,
  isDriver = false,
  isPassenger = false,
}: CarpoolDetailsDrawerProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const cancelCarpoolMutation = useMutation(api.carpools.cancelCarpool);

  if (!isOpen || !carpool) return null;

  const session = getParticipantSession();
  const userPhone = cleanPhone(
    session?.phone ||
    (typeof window !== "undefined"
      ? localStorage.getItem("bilengo_driver_phone") ||
      localStorage.getItem("bilengo_phone") ||
      ""
      : "")
  );

  const isOwnCarpool = !!(
    isDriver ||
    (userPhone &&
      carpool.driverPhone &&
      cleanPhone(carpool.driverPhone) === userPhone)
  );

  const handleCancel = async () => {
    const phoneToSend = userPhone || carpool.driverPhone || "";
    try {
      setIsDeleting(true);
      await cancelCarpoolMutation({
        carpoolId: carpool._id as Id<"carpools">,
        driverPhone: phoneToSend,
      });
      setIsConfirmingDelete(false);
      onClose();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression du covoiturage.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        allowCollapseToHandle={true}
        className="max-w-lg mx-auto"
      >
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Détails du covoiturage
              </span>
              <h3 className="text-xl font-bold text-neutral-900 font-heading">
                {carpool.driverName}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1.5 text-neutral-600"
            >
              ✕
            </Button>
          </div>

          {/* Details Card */}
          <Card variant="gray" className="space-y-3 p-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center text-center">
                <div className="min-h-7 flex items-center justify-center">
                  <span className="font-semibold text-neutral-900 text-sm line-clamp-2">
                    {carpool.departureAddress.replace(/\s*\([^)]*km\)/gi, "")}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 font-medium mt-1">Départ</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="min-h-7 flex items-center justify-center">
                  <span className="font-semibold text-neutral-900 text-sm">
                    {new Date(carpool.departureTime).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 font-medium mt-1">Heure</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="min-h-7 flex items-center justify-center">
                  <Badge variant={carpool.availableSeats > 0 ? "emerald" : "default"}>
                    {carpool.availableSeats} / {carpool.totalSeats}
                  </Badge>
                </div>
                <span className="text-xs text-neutral-500 font-medium mt-1">Places libres</span>
              </div>
            </div>


            {carpool.description && (
              <div className="text-sm text-neutral-700 bg-white p-3.5 rounded-lg border border-neutral-200/60 italic">
                "{carpool.description}"
              </div>
            )}
          </Card>

          {/* Action Button */}
          {isOwnCarpool ? (
            <div className="space-y-2">
              <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-800 text-sm text-center font-medium">
                Vous êtes le conducteur de ce covoiturage.
              </div>

              <Button
                variant="danger-outline"
                size="md"
                onClick={() => setIsConfirmingDelete(true)}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="w-full py-2.5"
              >
                Supprimer mon covoiturage
              </Button>
            </div>
          ) : isPassenger ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-sm text-center font-medium">
              ✓ Vous avez réservé 1 place pour cet événement.
            </div>
          ) : (
            <Button
              variant="primary"
              size="md"
              disabled={carpool.availableSeats <= 0}
              onClick={() => onOpenBooking(carpool)}
              className="w-full text-base font-semibold py-3"
            >
              Réserver 1 place
            </Button>
          )}
        </div>
      </Drawer>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        title="Supprimer mon covoiturage"
        description="Êtes-vous sûr de vouloir supprimer votre trajet ? Cette action est définitive et annulera les réservations passagers."
        maxWidthClass="max-w-md"
      >
        <div className="flex justify-end gap-2.5 pt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsConfirmingDelete(false)}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            size="md"
            disabled={isDeleting}
            onClick={handleCancel}
          >
            {isDeleting ? "Suppression..." : "Confirmer la suppression"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
