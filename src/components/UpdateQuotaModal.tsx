"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatConvexError } from "@/lib/errors";
import { Users, Check } from "lucide-react";

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

  const [selectedQuota, setSelectedQuota] = useState<number>(
    currentQuota < 500 ? 500 : currentQuota < 1000 ? 1000 : currentQuota + 500
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [500, 1000, 2000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedQuota || selectedQuota <= 0) {
      setError("Veuillez choisir un quota valide.");
      return;
    }

    if (selectedQuota < currentGuestsCount) {
      setError(
        `Le quota ne peut pas être inférieur au nombre d'invités actuels (${currentGuestsCount}).`
      );
      return;
    }

    setLoading(true);
    try {
      await updateQuota({
        eventId,
        maxParticipants: selectedQuota,
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
      description="Débloquez de nouvelles inscriptions pour votre événement."
      maxWidthClass="max-w-md"
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
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
            Choisir la nouvelle capacité :
          </label>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((preset) => {
              const isSelected = selectedQuota === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSelectedQuota(preset)}
                  className={`py-3 px-2 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${isSelected
                    ? "border-neutral-900 bg-neutral-900 text-white shadow-xs"
                    : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                >
                  <Users className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span>{preset}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            className="w-full py-3"
          >
            Augmenter la capacité ({selectedQuota})
          </Button>
        </div>
      </form>
    </Modal>
  );
}
