"use client";

import { useState, useEffect } from "react";
import { useMutation, useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export function CreateEventClient() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const createEvent = useMutation(api.events.createEvent);
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [destinationLat, setDestinationLat] = useState<number | undefined>(undefined);
  const [destinationLng, setDestinationLng] = useState<number | undefined>(undefined);
  const [maxParticipants, setMaxParticipants] = useState<number>(50);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!title.trim()) {
        setError("Veuillez saisir un titre pour votre événement.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!eventDate) {
        setError("Veuillez sélectionner la date et l'heure de l'événement.");
        return;
      }
      if (!destinationAddress.trim()) {
        setError("Veuillez renseigner l'adresse de destination.");
        return;
      }

      if (destinationLat === undefined || destinationLng === undefined) {
        try {
          const res = await fetch(
            `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
              destinationAddress
            )}&limit=1`
          );
          if (res.ok) {
            const data = await res.json();
            const first = data.features?.[0];
            if (first?.geometry?.coordinates) {
              setDestinationLng(first.geometry.coordinates[0]);
              setDestinationLat(first.geometry.coordinates[1]);
            }
          }
        } catch (err) {
          console.error("Erreur géocodage destination:", err);
        }
      }

      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      let finalLat = destinationLat;
      let finalLng = destinationLng;

      if (finalLat === undefined || finalLng === undefined) {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
            destinationAddress
          )}&limit=1`
        );
        if (res.ok) {
          const data = await res.json();
          const first = data.features?.[0];
          if (first?.geometry?.coordinates) {
            finalLng = first.geometry.coordinates[0];
            finalLat = first.geometry.coordinates[1];
          }
        }
      }

      const res = await createEvent({
        title,
        eventDate,
        destinationAddress,
        destinationLat: finalLat,
        destinationLng: finalLng,
        maxParticipants: Number(maxParticipants),
      });

      router.push(`/e/${res.slug}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la création de l'événement.");
      setLoading(false);
    }
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-neutral-500">
        <div className="animate-pulse text-sm font-medium">Vérification de votre session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      {/* Top Header */}
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold text-base tracking-tighter">
              B
            </div>
            <span className="text-lg font-bold tracking-tight text-neutral-900 font-heading">
              bilengo
            </span>
          </Link>

          <Link href="/dashboard" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">
            ✕ Annuler
          </Link>
        </div>
      </header>

      {/* Main Multi-Step Form */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        {/* Progress Steps */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-400">
            <span className={step >= 1 ? "text-neutral-900 font-bold" : ""}>
              1. Informations
            </span>
            <span className={step >= 2 ? "text-neutral-900 font-bold" : ""}>
              2. Date & Lieu
            </span>
            <span className={step >= 3 ? "text-neutral-900 font-bold" : ""}>
              3. Validation
            </span>
          </div>

          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-900 transition-all duration-300 ease-out"
              style={{
                width: step === 1 ? "33%" : step === 2 ? "66%" : "100%",
              }}
            />
          </div>
        </div>

        {/* Card Container */}
        <Card variant="white" className="p-6 sm:p-8 space-y-6 shadow-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight mb-1 font-heading">
                  Nom de l'événement
                </h1>
                <p className="text-neutral-500 text-xs">
                  Donnez un nom clair pour vos invités.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Titre de l'événement *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Mariage de Sarah & Lucas, Anniversaire 30 ans..."
                  className="cal-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Participants Max
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className="cal-input"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Tier gratuit limité à 50 participants.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="md">
                  Continuer →
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight mb-1 font-heading">
                  Quand et où ?
                </h1>
                <p className="text-neutral-500 text-xs">
                  Date et lieu de destination de tous les covoiturages.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Date & Heure de début *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="cal-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Adresse de destination finale *
                </label>
                <AddressAutocomplete
                  value={destinationAddress}
                  onChange={(val) => {
                    setDestinationAddress(val);
                    setDestinationLat(undefined);
                    setDestinationLng(undefined);
                  }}
                  onSelect={(item) => {
                    setDestinationAddress(item.label);
                    setDestinationLat(item.lat);
                    setDestinationLng(item.lng);
                  }}
                  placeholder="Ex: 12 Rue du Stade, 75001 Paris"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setStep(1)}
                >
                  ← Précédent
                </Button>

                <Button type="submit" variant="primary" size="md">
                  Récapitulatif →
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight mb-1 font-heading">
                  Récapitulatif de l'événement
                </h1>
                <p className="text-neutral-500 text-xs">
                  Vérifiez les informations avant d'activer votre lien public.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3 text-xs">
                <div>
                  <span className="text-neutral-400 font-medium">Titre</span>
                  <p className="text-sm font-bold text-neutral-900 font-heading">{title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-200/60">
                  <div>
                    <span className="text-neutral-400 font-medium">Date & Heure</span>
                    <p className="font-semibold text-neutral-800">
                      {new Date(eventDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div>
                    <span className="text-neutral-400 font-medium">Participants max</span>
                    <p className="font-semibold text-neutral-800">{maxParticipants} max</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200/60">
                  <span className="text-neutral-400 font-medium">Destination</span>
                  <p className="font-semibold text-neutral-800">{destinationAddress}</p>
                  {destinationLat && destinationLng && (
                    <p className="text-[11px] text-emerald-600 font-mono mt-0.5">
                      ✓ Coordonnées GPS verrouillées ({destinationLat.toFixed(4)}, {destinationLng.toFixed(4)})
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setStep(2)}
                >
                  ← Modifier
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  isLoading={loading}
                  onClick={handleSubmit}
                >
                  Publier l'événement
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
