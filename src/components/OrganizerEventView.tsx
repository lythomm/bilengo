"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PillGroup } from "@/components/ui/PillGroup";
import { Toast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import {
  Share2,
  Map,
  MapPin,
  Flag,
  Calendar,
  Check,
  ArrowLeft,
  Search,
  Trash2,
  Clock,
  Phone,
  Users,
  Car,
  UserCheck,
  CheckCircle2,
  User,
  Info,
} from "lucide-react";

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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Lien de l'événement copié !");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteCarpoolByOrganizer = useMutation(api.carpools.deleteCarpoolByOrganizer);

  const { event, stats, guests, carpools } = organizerData;

  const handleDeleteCarpool = async () => {
    if (!confirmDeleteId) return;
    try {
      setIsDeleting(true);
      await deleteCarpoolByOrganizer({ carpoolId: confirmDeleteId as Id<"carpools"> });
      setConfirmDeleteId(null);
      setToastMessage("Covoiturage supprimé avec succès.");
      setShowToast(true);
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression du covoiturage.");
    } finally {
      setIsDeleting(false);
    }
  };

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
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-neutral-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-lg font-bold text-neutral-900 tracking-tight font-heading whitespace-nowrap"
            >
              BilenGo
            </Link>
            <span className="text-neutral-300">|</span>
            <h1 className="text-base font-bold text-neutral-900 tracking-tight truncate max-w-xs sm:max-w-md font-heading">
              {event.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onCopyLink();
                setToastMessage("Lien de l'événement copié !");
                setShowToast(true);
              }}
              title={copied ? "Lien copié !" : "Partager le lien"}
              aria-label="Partager le lien"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onSwitchToMap}
              title="Voir la carte"
              aria-label="Voir la carte"
            >
              <Map className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="text-neutral-600 hover:text-neutral-900 -ml-2"
            >
              Retour
            </Button>
          </Link>
        </div>
        <div className="mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Tableau de bord de l'événement
          </span>
        </div>
        {/* Event Header Banner */}
        <Card variant="dark" className="p-6 sm:p-8 space-y-3 text-white!">
          <h2 className="text-2xl sm:text-3xl font-boldfont-heading">
            {event.title}
          </h2>
          <p className="text-white/80 text-xs sm:text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {event.destinationAddress}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(event.eventDate).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="white" className="p-4 space-y-1">
            <div className="text-neutral-500 text-xs font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              Invités
            </div>
            <div className="text-2xl font-bold text-neutral-900 font-heading">
              {stats.totalGuests}{" "}
              <span className="text-sm font-normal text-neutral-400">
                / {event.maxParticipants === 1000 ? "1000+" : event.maxParticipants}
              </span>
            </div>
          </Card>

          <Card variant="white" className="p-4 space-y-1">
            <div className="text-neutral-500 text-xs font-semibold flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              Conducteurs
            </div>
            <div className="text-2xl font-bold text-neutral-900 font-heading">
              {stats.totalDrivers}
            </div>
          </Card>

          <Card variant="white" className="p-4 space-y-1">
            <div className="text-neutral-500 text-xs font-semibold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              Réservées
            </div>
            <div className="text-2xl font-bold text-neutral-900 font-heading">
              {stats.totalSeatsBooked}{" "}
              <span className="text-sm font-normal text-neutral-400">
                / {stats.totalSeatsOffered}
              </span>
            </div>
          </Card>

          <Card variant="white" className="p-4 space-y-1">
            <div className="text-neutral-500 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Places Libres
            </div>
            <div className="text-2xl font-bold text-emerald-700 font-heading">
              {stats.totalSeatsAvailable}
            </div>
          </Card>
        </div>

        {/* Directory Section */}
        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PillGroup
            value={activeTab}
            onChange={(val) => setActiveTab(val as "guests" | "carpools")}
            className="w-full flex sm:w-auto sm:inline-flex sm:flex-shrink-0 text-nowrap!"
            itemClassName="flex-1 sm:flex-none text-center"
            options={[
              { id: "guests", label: `Invités (${guests.length})` },
              { id: "carpools", label: `Covoiturages (${carpools.length})` },
            ]}
          />

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher prénom, tél..."
              className="cal-input w-full !pl-9"
            />
          </div>
        </div>

        {/* Tab Content: Guests */}
        {activeTab === "guests" && (
          <div className="space-y-4">
            {filteredGuests.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 text-xs">
                Aucun invité ne correspond à la recherche.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider whitespace-nowrap">
                      <th className="py-2.5 px-3 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-neutral-400" /> Invité
                        </span>
                      </th>
                      <th className="py-2.5 px-3 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-neutral-400" /> Téléphone
                        </span>
                      </th>
                      <th className="py-2.5 px-3 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-neutral-400" /> Statut
                        </span>
                      </th>
                      <th className="py-2.5 px-3 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-neutral-400" /> Détails
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredGuests.map((guest, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50 whitespace-nowrap">
                        <td className="py-3 px-3 font-semibold text-neutral-900 whitespace-nowrap">
                          {guest.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-500 whitespace-nowrap">
                          {guest.phone ? (
                            <a
                              href={`tel:${guest.phone}`}
                              className="hover:text-neutral-900 transition-colors"
                            >
                              {guest.phone}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 flex-nowrap">
                            {guest.proposesCarpool && (
                              <Badge variant="orange">Conducteur</Badge>
                            )}
                            {guest.isInCarpool && (
                              <Badge variant="emerald">Passager</Badge>
                            )}
                            {!guest.proposesCarpool && !guest.isInCarpool && (
                              <Badge variant="default">Sans covoiturage</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-neutral-600 whitespace-nowrap">
                          <div className="flex items-center gap-2 flex-nowrap">
                            {guest.details.map((det, dIdx) => (
                              <span key={dIdx} className="inline-block bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[11px] whitespace-nowrap">
                                {det}
                              </span>
                            ))}
                          </div>
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
              <div className="text-center py-8 text-neutral-400 text-xs">
                Aucun covoiturage pour cet événement.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {carpools.map((c) => (
                  <Card key={c._id} variant="gray" className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                          <Car className="w-3 h-3 text-neutral-400 shrink-0" />
                          Conducteur
                        </span>
                        <h4 className="text-base font-bold text-neutral-900 font-heading">{c.driverName}</h4>
                        {c.driverPhone && (
                          <a
                            href={`tel:${c.driverPhone}`}
                            className="text-xs font-mono text-neutral-500 hover:text-neutral-900 transition-colors"
                          >
                            {c.driverPhone}
                          </a>
                        )}
                      </div>
                      <Badge variant={c.availableSeats > 0 ? "emerald" : "default"}>
                        {c.availableSeats > 0
                          ? `${c.availableSeats}/${c.totalSeats} libres`
                          : "Complet"}
                      </Badge>
                    </div>

                    <div className="text-xs text-neutral-600 space-y-1.5 bg-white p-3 rounded-lg border border-neutral-200/60">
                      <div className="flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="font-semibold text-neutral-900 truncate">{c.departureAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="font-semibold text-neutral-900">
                          {/^\d{2}:\d{2}$/.test(c.departureTime)
                            ? c.departureTime
                            : new Date(c.departureTime).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    {/* Passengers List */}
                    <div className="space-y-1.5 pt-2 border-t border-neutral-200">
                      <div className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        Passagers ({c.bookings.length})
                      </div>
                      {c.bookings.length === 0 ? (
                        <div className="text-xs text-neutral-400 italic">Aucune réservation.</div>
                      ) : (
                        <div className="space-y-1">
                          {c.bookings.map((b) => (
                            <div
                              key={b._id}
                              className="flex items-center justify-between text-xs bg-white p-2 rounded border border-neutral-200/60"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-semibold text-neutral-900 truncate">{b.passengerName}</span>
                                {b.passengerPhone && (
                                  <a
                                    href={`tel:${b.passengerPhone}`}
                                    className="text-neutral-500 font-mono text-[11px] shrink-0"
                                  >
                                    ({b.passengerPhone})
                                  </a>
                                )}
                              </div>
                              <Badge variant={b.status === "confirmed" ? "emerald" : b.status === "pending" ? "orange" : "default"}>
                                {b.status === "confirmed" ? "Confirmé" : b.status === "pending" ? "En attente" : "Annulé"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-neutral-200/80 flex justify-end">
                      <Button
                        variant="danger-outline"
                        size="sm"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={() => setConfirmDeleteId(c._id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Supprimer le covoiturage"
        description="Êtes-vous sûr de vouloir supprimer ce covoiturage ? Cette action est définitive et annulera toutes les réservations associées."
        maxWidthClass="max-w-md"
      >
        <div className="flex justify-end gap-2.5 pt-2">
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
            isLoading={isDeleting}
            onClick={handleDeleteCarpool}
          >
            Confirmer la suppression
          </Button>
        </div>
      </Modal>

      <Toast
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        variant="success"
      />
    </div>
  );
}
