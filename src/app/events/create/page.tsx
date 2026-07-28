"use client";

import { useState, useEffect } from "react";
import { useMutation, useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import Link from "next/link";

export default function CreateEventPage() {
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

  // Route Guard: Redirect to home page if not authenticated
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

      // Geocode if coordinates not captured via dropdown selection
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

      // Double check geocoding
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse text-lg">Vérification de votre session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
              B
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Bilengo
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ✕ Annuler
          </Link>
        </div>
      </header>

      {/* Main Multi-Step Form */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        {/* Progress Bar & Steps */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className={step >= 1 ? "text-amber-400" : ""}>
              1. Informations
            </span>
            <span className={step >= 2 ? "text-amber-400" : ""}>
              2. Date & Lieu
            </span>
            <span className={step >= 3 ? "text-amber-400" : ""}>
              3. Validation
            </span>
          </div>

          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-amber-500 transition-all duration-300 ease-out"
              style={{
                width: step === 1 ? "33%" : step === 2 ? "66%" : "100%",
              }}
            />
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
                  Nom de l'événement
                </h1>
                <p className="text-slate-400 text-sm">
                  Donnez un nom clair à votre événement pour que vos invités s'y retrouvent facilement.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Titre de l'événement *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Mariage de Sarah & Lucas, Anniversaire 30 ans..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Nombre maximum de participants
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Tier gratuit limité à 50 participants max par événement.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
                >
                  Continuer →
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
                  Quand et où ?
                </h1>
                <p className="text-slate-400 text-sm">
                  Précisez la date et le lieu exact où tous les covoiturages doivent arriver.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Date & Heure de début *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
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

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
                >
                  ← Précédent
                </button>

                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
                >
                  Récapitulatif →
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
                  Récapitulatif de votre événement
                </h1>
                <p className="text-slate-400 text-sm">
                  Vérifiez les informations ci-dessous avant d'activer votre page publique.
                </p>
              </div>

              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Titre</span>
                  <p className="text-lg font-bold text-white">{title}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-900">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">📅 Date & Heure</span>
                    <p className="text-sm font-medium text-amber-400">
                      {new Date(eventDate).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 font-medium">👥 Participants max</span>
                    <p className="text-sm font-medium text-white">{maxParticipants} max</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <span className="text-xs text-slate-500 font-medium">📍 Destination</span>
                  <p className="text-sm font-medium text-white">{destinationAddress}</p>
                  {destinationLat && destinationLng && (
                    <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                      ✓ Coordonnées GPS verrouillées ({destinationLat.toFixed(4)}, {destinationLng.toFixed(4)})
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
                >
                  ← Modifier
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm transition-colors shadow-xl shadow-amber-500/25 disabled:opacity-50"
                >
                  {loading ? "Création en cours..." : "🚀 Publier l'événement"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
