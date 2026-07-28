"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Drawer } from "@/components/ui/Drawer";
import { getParticipantSession } from "@/lib/session";
import { PillGroup } from "@/components/ui/PillGroup";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

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
      {/* Signature Cal.com Pill Group Tabs */}
      <div className="px-4 pb-3 border-b border-neutral-100 flex items-center justify-center">
        <PillGroup
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
              label: `Je propose ${myProposedCarpools.length > 0 ? "(1)" : ""}`,
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
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between">
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

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer par ville ou départ..."
              className="cal-input"
            />

            {filteredCarpools.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 space-y-2">
                <p className="text-xs">
                  {searchQuery
                    ? "Aucun trajet trouvé"
                    : "Aucun trajet disponible"}
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
              <div className="space-y-2">
                {filteredCarpools.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => onSelectCarpool(c)}
                    className="p-3.5 bg-neutral-50 border border-neutral-200/80 hover:border-neutral-300 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900 text-sm font-heading">
                          {c.driverName}
                        </span>
                        <Badge
                          variant={c.availableSeats > 0 ? "emerald" : "default"}
                        >
                          {c.availableSeats > 0
                            ? `${c.availableSeats} place(s)`
                            : "Complet"}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-500 line-clamp-1">
                        Départ : {c.departureAddress}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end shrink-0">
                      <span className="text-xs font-semibold text-neutral-900">
                        {new Date(c.departureTime).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-[11px] text-neutral-400 mt-1">
                        Itinéraire →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : isPassenger ? (
          /* Passenger Restriction Banner */
          <div className="py-6 flex flex-col items-center text-center space-y-3">
            <h3 className="text-base font-bold text-neutral-900 font-heading">
              Vous êtes déjà passager
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
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
            <h3 className="text-sm font-bold text-neutral-900 font-heading">
              Mon covoiturage proposé
            </h3>

            {myProposedCarpools.slice(0, 1).map((c) => (
              <Card key={c._id} variant="gray" className="space-y-3 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      Conducteur (Vous)
                    </span>
                    <h4 className="text-base font-bold text-neutral-900 font-heading">
                      {c.driverName}
                    </h4>
                  </div>
                  <Badge variant={c.availableSeats > 0 ? "emerald" : "default"}>
                    {c.availableSeats > 0
                      ? `${c.availableSeats} / ${c.totalSeats} libres`
                      : "Complet"}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs text-neutral-600 bg-white p-3 rounded-lg border border-neutral-200/60">
                  <div>
                    Départ : <span className="font-semibold text-neutral-900">{c.departureAddress}</span>
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

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelectCarpool(c)}
                  className="w-full"
                >
                  Voir sur la carte →
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          /* Propose Ride CTA View */
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <h3 className="text-xl font-bold text-neutral-900 tracking-tight font-heading">
              Proposer un trajet
            </h3>

            <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
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
    </Drawer>
  );
}
