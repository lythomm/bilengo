"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatConvexError } from "@/lib/errors";
import { ShieldCheck } from "lucide-react";
import { PRICING_TIERS, PricingTier } from "@/config/pricing";

const UPGRADE_TIERS = PRICING_TIERS.filter((t) => !t.isFree);

interface UpdateQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: Id<"events">;
  currentQuota: number;
  currentGuestsCount: number;
  onSuccess?: (newQuota: number) => void;
}

export function UpdateQuotaModal({
  isOpen,
  onClose,
  eventId,
  currentQuota,
  currentGuestsCount,
  onSuccess,
}: UpdateQuotaModalProps) {
  const updateQuota = useMutation(api.events.updateEventQuota);

  const [selectedQuota, setSelectedQuota] = useState<number>(() => {
    const recommended =
      UPGRADE_TIERS.find((t) => t.quota > currentQuota) ||
      UPGRADE_TIERS[UPGRADE_TIERS.length - 1];
    return recommended.quota;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const recommended =
        UPGRADE_TIERS.find((t) => t.quota > currentQuota) ||
        UPGRADE_TIERS[UPGRADE_TIERS.length - 1];
      setSelectedQuota(recommended.quota);
      setError(null);
    }
  }, [isOpen, currentQuota]);

  const selectedTier = UPGRADE_TIERS.find((t) => t.quota === selectedQuota) || UPGRADE_TIERS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedQuota || selectedQuota <= 0) {
      setError("Veuillez choisir un quota valide.");
      return;
    }

    if (selectedQuota <= currentQuota) {
      setError("Veuillez sélectionner une capacité supérieure à votre quota actuel.");
      return;
    }

    setLoading(true);
    try {
      await updateQuota({
        eventId,
        maxParticipants: selectedQuota,
        tierId: selectedTier.id,
      });
      if (onSuccess) onSuccess(selectedQuota);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError(
        formatConvexError(err, "Impossible de mettre à jour le quota.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Augmenter la capacité d'invités"
      description="Sélectionnez la tranche d'invités adaptée à votre événement."
      maxWidthClass="max-w-xl"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-neutral-500 block">Quota actuel :</span>
            <span className="font-bold text-neutral-900 text-sm">
              {currentQuota} invités
            </span>
          </div>
          <div className="text-right">
            <span className="text-neutral-500 block">Inscrits actuels :</span>
            <span className="font-bold text-emerald-600 text-sm">
              {currentGuestsCount} invités
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2.5">
            Choisir la nouvelle capacité :
          </label>
          <div className="grid grid-cols-6 gap-1.5 p-1.5 bg-neutral-100/90 rounded-2xl border border-neutral-200/60">
            {UPGRADE_TIERS.map((tier) => {
              const isSelected = selectedQuota === tier.quota;
              const isDisabled = tier.quota <= currentQuota;

              return (
                <button
                  key={tier.quota}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setSelectedQuota(tier.quota)}
                  className={`py-3 px-1 rounded-xl text-xs sm:text-sm font-bold transition-all text-center border-none ${isDisabled
                    ? "opacity-30 cursor-not-allowed text-neutral-400 bg-transparent"
                    : isSelected
                      ? "bg-neutral-900 text-white shadow-xs cursor-pointer"
                      : "bg-transparent text-neutral-700 hover:text-neutral-900 hover:bg-white cursor-pointer"
                    }`}
                >
                  {tier.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900/5 border border-neutral-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-neutral-700">
              Paiement unique et sécurisé.
            </span>
          </div>
        </div>

        <div className="pt-1">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            disabled={selectedQuota <= currentQuota}
            className="w-full py-3 font-semibold"
          >
            {selectedQuota <= currentQuota
              ? "Capacité actuelle (Aucune augmentation)"
              : `Passer à ${selectedTier.countText} (${selectedTier.price})`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


