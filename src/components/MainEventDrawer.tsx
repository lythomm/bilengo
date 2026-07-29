"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Drawer } from "@/components/ui/Drawer";
import { Modal } from "@/components/ui/Modal";
import { getParticipantSession } from "@/lib/session";
import { PillGroup } from "@/components/ui/PillGroup";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Trash2, MapPin } from "lucide-react";
import Image from "next/image";
import googleMapsIcon from "@/assets/icons/google-maps.svg";
import wazeIcon from "@/assets/icons/waze.webp";

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
  eventTitle?: string;
  destinationAddress?: string;
  destinationLat?: number;
  destinationLng?: number;
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

function getDistanceKm(lat1?: number, lng1?: number, lat2?: number, lng2?: number): number {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return 999999;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function MainEventDrawer({
  eventId,
  eventTitle,
  destinationAddress,
  destinationLat,
  destinationLng,
  carpools,
  selectedCarpool,
  onSelectCarpool,
  onOpenBooking,
  onStartPickLocation,
}: MainEventDrawerProps) {
  const [activeTab, setActiveTab] = useState<"search" | "propose">("search");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const cancelCarpoolMutation = useMutation(api.carpools.cancelCarpool);

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

  const handleCancelCarpool = async (carpoolId: Id<"carpools">) => {
    const target = carpools.find((c) => c._id === carpoolId);
    const phoneToSend = userPhone || target?.driverPhone || "";
    try {
      setIsDeleting(true);
      await cancelCarpoolMutation({
        carpoolId,
        driverPhone: phoneToSend,
      });
      setConfirmDeleteId(null);
      onSelectCarpool(null);
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  };

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

  const sortedCarpools = [...carpools].sort((a, b) => {
    const distA = getDistanceKm(destinationLat, destinationLng, a.departureLat, a.departureLng);
    const distB = getDistanceKm(destinationLat, destinationLng, b.departureLat, b.departureLng);
    return distA - distB;
  });

  return (
    <>
      <Drawer
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        allowCollapseToHandle={true}
        maxHeightClass="max-h-[65dvh]"
      >
        {/* Signature Cal.com Pill Group Tabs */}
        <div className="px-4 pb-3 border-b border-neutral-100 flex items-center justify-center">
          <PillGroup
            fullWidth
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val as "search" | "propose");
              onSelectCarpool(null);
            }}
            options={[
              {
                id: "search",
                label: `Je cherche (${carpools.length})`,
              },
              {
                id: "propose",
                label: "Je propose",
              },
            ]}
          />
        </div>

        {/* Drawer Body */}
        <div className="p-4 space-y-4">
          {activeTab === "search" ? (
            /* Search Rides Tab */
            <div className="space-y-3">
              {isPassenger && userRole?.carpool && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium flex items-center justify-between">
                  <span>
                    ✓ Place réservée chez <strong>{userRole.carpool.driverName}</strong>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectCarpool(userRole.carpool as any)}
                  >
                    Voir
                  </Button>
                </div>
              )}

              <h3 className="text-lg font-bold text-neutral-900 tracking-tight font-heading">
                Covoit à proximité
              </h3>

              {carpools.length === 0 ? (
                <div className="py-8 text-center text-neutral-500 space-y-2">
                  <p className="text-sm font-medium">
                    Aucun trajet disponible
                  </p>
                  {!isDriver && !isPassenger && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveTab("propose")}
                    >
                      Proposer le premier trajet
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {sortedCarpools.map((c) => {
                    const distKm = getDistanceKm(destinationLat, destinationLng, c.departureLat, c.departureLng);
                    return (
                      <div
                        key={c._id}
                        onClick={() => onSelectCarpool(c)}
                        className="p-4 bg-neutral-50 border border-neutral-200/80 hover:border-neutral-300 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 text-base font-heading">
                              {c.driverName}
                            </span>
                            <Badge
                              variant={c.availableSeats > 0 ? "emerald" : "default"}
                            >
                              {c.availableSeats > 0
                                ? `${c.availableSeats} place(s)`
                                : "Complet"}
                            </Badge>
                            {distKm < 9999 && (
                              <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-200/60 px-1.5 py-0.5 rounded">
                                {distKm < 1 ? "< 1 km" : `${Math.round(distKm)} km`}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 font-medium line-clamp-1 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                            {c.departureAddress.replace(/\s*\([^)]*km\)/gi, "")}
                          </p>
                        </div>

                        <div className="text-right flex flex-col items-end shrink-0">
                          <span className="text-sm font-bold text-neutral-900">
                            {new Date(c.departureTime).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="text-xs font-semibold text-neutral-500 mt-1">
                            Itinéraire →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : isPassenger ? (
            /* Passenger Restriction Banner */
            <div className="py-6 flex flex-col items-center text-center space-y-3">
              <h3 className="text-lg font-bold text-neutral-900 font-heading">
                Vous êtes déjà passager
              </h3>
              <p className="text-sm text-neutral-600 max-w-xs leading-relaxed">
                Vous avez réservé 1 place chez{" "}
                <strong>{userRole?.carpool?.driverName || "un conducteur"}</strong>.
              </p>
              {userRole?.carpool && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelectCarpool(userRole.carpool as any)}
                >
                  Voir mon trajet réservé →
                </Button>
              )}
            </div>
          ) : myProposedCarpools.length > 0 ? (
            /* My Proposed Carpool View */
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-neutral-900 font-heading">
                Gérer ton covoit
              </h3>

              {myProposedCarpools.slice(0, 1).map((c) => (
                <Card key={c._id} variant="gray" className="space-y-3 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Conducteur (Vous)
                      </span>
                      <h4 className="text-lg font-bold text-neutral-900 font-heading">
                        {c.driverName}
                      </h4>
                    </div>
                    <Badge variant={c.availableSeats > 0 ? "emerald" : "default"}>
                      {c.availableSeats > 0
                        ? `${c.availableSeats} / ${c.totalSeats} libres`
                        : "Complet"}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-sm text-neutral-700 bg-white p-3.5 rounded-lg border border-neutral-200/60 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
                      <span className="font-bold text-neutral-900">{c.departureAddress}</span>
                    </div>
                    <div>
                      Heure :{" "}
                      {new Date(c.departureTime).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => onSelectCarpool(c)}
                      className="flex-1 font-semibold"
                    >
                      Voir sur la carte →
                    </Button>

                    <Button
                      variant="danger-outline"
                      size="md"
                      onClick={() => setConfirmDeleteId(c._id)}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      className="shrink-0"
                    >
                      Supprimer
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Propose Ride CTA View */
            <div className="py-6 flex flex-col items-center text-center space-y-4">
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight font-heading">
                Proposer un trajet
              </h3>

              <p className="text-sm text-neutral-600 max-w-xs leading-relaxed">
                Proposez vos places libres pour cet événement.
              </p>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (onStartPickLocation) {
                    onStartPickLocation();
                  }
                }}
                className="w-full max-w-xs"
              >
                Proposer un covoiturage
              </Button>
            </div>
          )}
        </div>

        {/* Pinned Bottom Navigation Box: Event Name + Google Maps & Waze Buttons */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 pt-2 border-t border-neutral-200/80 shrink-0 z-10">
          <div className="flex items-center justify-between gap-3 bg-neutral-900 text-white p-3.5 rounded-2xl shadow-xl border border-neutral-800">
            <div className="truncate flex-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Événement
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white truncate font-heading tracking-tight">
                {eventTitle || "Lieu de l'événement"}
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={
                  destinationLat && destinationLng
                    ? `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationAddress || eventTitle || "")}`
                }
                target="_blank"
                rel="noopener noreferrer"
                title="Ouvrir dans Google Maps"
                className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 p-2.5 rounded-xl transition-all flex items-center justify-center hover:scale-105 active:scale-95"
              >
                <Image src={googleMapsIcon} alt="Google Maps" className="w-5 h-5 object-contain" />
              </a>

              <a
                href={
                  destinationLat && destinationLng
                    ? `https://waze.com/ul?ll=${destinationLat},${destinationLng}&navigate=yes`
                    : `https://waze.com/ul?q=${encodeURIComponent(destinationAddress || eventTitle || "")}&navigate=yes`
                }
                target="_blank"
                rel="noopener noreferrer"
                title="Ouvrir dans Waze"
                className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 p-2.5 rounded-xl transition-all flex items-center justify-center hover:scale-105 active:scale-95"
              >
                <Image src={wazeIcon} alt="Waze" className="w-5 h-5 object-contain" />
              </a>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Confirmation Modal for Carpool Deletion */}
      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Supprimer mon covoiturage"
        description="Êtes-vous sûr de vouloir supprimer votre trajet ? Cette action est définitive et annulera toutes les réservations associées."
        maxWidthClass="max-w-md"
      >
        <div className="flex justify-end gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setConfirmDeleteId(null)}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            size="md"
            disabled={isDeleting}
            onClick={() => {
              if (confirmDeleteId) handleCancelCarpool(confirmDeleteId as any);
            }}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
