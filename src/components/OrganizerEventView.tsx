"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PillGroup } from "@/components/ui/PillGroup";
import { Toast, useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { UpdateQuotaModal } from "@/components/UpdateQuotaModal";
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
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  AlertOctagon,
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
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"guests" | "carpools">("guests");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);

  const deleteCarpoolByOrganizer = useMutation(api.carpools.deleteCarpoolByOrganizer);
  const updateEventQuota = useMutation(api.events.updateEventQuota);
  const searchParams = useSearchParams();

  const { event, stats, guests, carpools } = organizerData;

  const quotaUpgrade = searchParams.get("quota_upgrade");
  const newQuotaParam = searchParams.get("new_quota");
  const tierIdParam = searchParams.get("tier_id");

  const handledQuotaUpgradeRef = useRef(false);

  useEffect(() => {
    if (handledQuotaUpgradeRef.current) return;

    if (quotaUpgrade === "success" && newQuotaParam && tierIdParam) {
      handledQuotaUpgradeRef.current = true;
      const newQuota = Number(newQuotaParam);
      updateEventQuota({
        eventId: event._id as Id<"events">,
        maxParticipants: newQuota,
        tierId: tierIdParam,
      })
        .then(() => {
          showToast("success", `Quota d'invités augmenté à ${newQuota} !`);
        })
        .catch((err: any) => {
          console.error(err);
          showToast("error", "Erreur lors de la mise à jour du quota.");
        })
        .finally(() => {
          window.history.replaceState({}, "", window.location.pathname);
        });
    } else if (quotaUpgrade === "cancel") {
      handledQuotaUpgradeRef.current = true;
      showToast("error", "Paiement annulé.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [quotaUpgrade, newQuotaParam, tierIdParam, event._id, updateEventQuota, showToast]);

  const handleDeleteCarpool = async () => {
    if (!confirmDeleteId) return;
    try {
      setIsDeleting(true);
      await deleteCarpoolByOrganizer({ carpoolId: confirmDeleteId as Id<"carpools"> });
      setConfirmDeleteId(null);
      showToast("success", "Covoiturage supprimé avec succès.");
    } catch (err: any) {
      showToast("error", err.message || "Erreur lors de la suppression du covoiturage.");
    } finally {
      setIsDeleting(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // Reset pagination to page 1 on filter/search/tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, activeTab]);

  const filteredGuests = guests.filter((g) => {
    if (statusFilter === "driver" && !g.proposesCarpool) return false;
    if (statusFilter === "passenger" && !g.isInCarpool) return false;
    if (statusFilter === "autonomous" && (g.proposesCarpool || g.isInCarpool)) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.phone.toLowerCase().includes(q) ||
      g.details.some((d) => d.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredGuests.length / ITEMS_PER_PAGE) || 1;
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const filteredCarpools = carpools.filter((c) => {
    if (statusFilter === "active" && c.availableSeats <= 0) return false;
    if (statusFilter === "full" && c.availableSeats > 0) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.driverName.toLowerCase().includes(q) ||
      c.driverPhone.toLowerCase().includes(q) ||
      c.departureAddress.toLowerCase().includes(q) ||
      c.bookings.some((b) => b.passengerName.toLowerCase().includes(q) || b.passengerPhone.toLowerCase().includes(q))
    );
  });

  return (
    <motion.div
      initial={{ x: "-100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="min-h-screen bg-white text-neutral-900 flex flex-col"
    >
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
                showToast("success", "Lien de l'événement copié !");
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

        {/* Quota Banner & Alert (>= 90% or 100%) */}
        {(() => {
          const isQuotaFull = stats.totalGuests >= event.maxParticipants;
          const isQuotaWarning = !isQuotaFull && stats.totalGuests >= Math.floor(event.maxParticipants * 0.9);

          if (!isQuotaFull && !isQuotaWarning) return null;

          return (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${isQuotaFull
                ? "bg-red-50 border-red-300 text-red-950"
                : "bg-amber-50 border-amber-300 text-amber-950"
                }`}
            >
              <div className="flex items-start gap-3 flex-1">
                {isQuotaFull ? (
                  <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm tracking-tight font-heading flex items-center gap-2">
                    {isQuotaFull
                      ? `Quota maximum d'invités atteint (${stats.totalGuests}/${event.maxParticipants})`
                      : `Quota d'invités bientôt atteint (${stats.totalGuests}/${event.maxParticipants})`}
                  </h4>
                  <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                    {isQuotaFull
                      ? "Les nouveaux invités sont actuellement bloqués et ne peuvent pas s'inscrire. Augmentez la capacité dès maintenant."
                      : "Votre événement a atteint 90% de sa capacité. Augmentez le quota pour éviter de bloquer de futurs invités."}
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto flex justify-end shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsQuotaModalOpen(true)}
                  className="font-semibold shadow-xs"
                >
                  Augmenter la capacité
                </Button>
              </div>
            </div>
          );
        })()}

        {/* Stats Grid */}
        {(() => {
          const isQuotaFull = stats.totalGuests >= event.maxParticipants;
          const isQuotaWarning = !isQuotaFull && stats.totalGuests >= Math.floor(event.maxParticipants * 0.9);

          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card
                variant="white"
                className={`p-3.5 sm:p-4 space-y-2 relative transition-all cursor-pointer hover:shadow-md ${isQuotaFull
                  ? "!bg-red-50/90 !border-red-400 ring-2 ring-red-200"
                  : isQuotaWarning
                    ? "!bg-amber-50/90 !border-amber-400"
                    : ""
                  }`}
                onClick={() => setIsQuotaModalOpen(true)}
              >
                {/* Header Row: ONLY Invités Label */}
                <div className="text-neutral-500 text-xs font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>Invités</span>
                </div>

                {/* Main Number Row */}
                <div className="text-2xl font-bold text-neutral-900 font-heading tracking-tight leading-none pt-0.5">
                  {stats.totalGuests}{" "}
                  <span className="text-sm font-normal text-neutral-400 font-sans">
                    / {event.maxParticipants === 1000 ? "1000+" : event.maxParticipants}
                  </span>
                </div>

                {/* Footer Status Line */}
                <div className="pt-1.5 border-t border-neutral-200/50">
                  {isQuotaFull ? (
                    <span className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3 shrink-0" />
                      Complet
                    </span>
                  ) : isQuotaWarning ? (
                    <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      Attention (90%)
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-neutral-500 flex items-center justify-between">
                      <span>Normal</span>
                      <span className="text-[10px] text-neutral-400 underline">Modifier</span>
                    </span>
                  )}
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
          );
        })()}

        {/* Directory Section */}
        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PillGroup
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val as "guests" | "carpools");
              setStatusFilter("all");
            }}
            className="w-full flex sm:w-auto sm:inline-flex sm:flex-shrink-0 text-nowrap!"
            itemClassName="flex-1 sm:flex-none text-center"
            options={[
              { id: "guests", label: `Invités (${guests.length})` },
              { id: "carpools", label: `Covoiturages (${carpools.length})` },
            ]}
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="cal-input w-full !pl-9 text-xs"
              />
            </div>

            <div className="relative shrink-0">
              <div className="flex items-center justify-center p-2.5 bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer">
                <Filter className="w-4 h-4 text-neutral-600" />
                {statusFilter !== "all" && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filtrer par statut"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              >
                <option value="all">Tous les statuts</option>
                {activeTab === "guests" ? (
                  <>
                    <option value="driver">Conducteurs</option>
                    <option value="passenger">Passagers</option>
                    <option value="autonomous">Sans covoiturage</option>
                  </>
                ) : (
                  <>
                    <option value="active">Places disponibles</option>
                    <option value="full">Complets</option>
                  </>
                )}
              </select>
            </div>
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
                    {paginatedGuests.map((guest, idx) => (
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

            {/* Pagination controls for guests */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200/80 text-xs text-neutral-500 font-medium">
                <div>
                  Affichage de{" "}
                  <span className="font-semibold text-neutral-900">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  à{" "}
                  <span className="font-semibold text-neutral-900">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredGuests.length)}
                  </span>{" "}
                  sur{" "}
                  <span className="font-semibold text-neutral-900">
                    {filteredGuests.length}
                  </span>{" "}
                  invités
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                    aria-label="Page précédente"
                  >
                    Précédent
                  </Button>

                  <span className="px-3 py-1 bg-neutral-100 rounded text-neutral-700 font-semibold">
                    {currentPage} / {totalPages}
                  </span>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    aria-label="Page suivante"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Carpools */}
        {activeTab === "carpools" && (
          <div className="space-y-4">
            {filteredCarpools.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 text-xs">
                Aucun covoiturage ne correspond à la recherche/filtre.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCarpools.map((c) => (
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

      <UpdateQuotaModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        eventId={event._id as Id<"events">}
        eventSlug={event.slug}
        currentQuota={event.maxParticipants}
        currentGuestsCount={stats.totalGuests}
        onSuccess={(newQuota) => {
          showToast("success", `Quota d'invités augmenté à ${newQuota}`);
        }}
      />
    </motion.div>
  );
}
