"use client";

import { useState, useEffect } from "react";
import { useMutation, useAction, useConvexAuth } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { EventLocationPickerMap } from "@/components/EventLocationPickerMap";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { PRICING_TIERS, getTierByQuota } from "@/config/pricing";

export function CreateEventClient() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const createEvent = useMutation(api.events.createEvent);
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentStatus = searchParams.get("payment_status");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [destinationLat, setDestinationLat] = useState<number>(48.8566);
  const [destinationLng, setDestinationLng] = useState<number>(2.3522);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [maxParticipants, setMaxParticipants] = useState<number>(25);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapPinMoved, setMapPinMoved] = useState(false);

  const selectedTier = getTierByQuota(Number(maxParticipants));
  const isFree = selectedTier.isFree || selectedTier.quota <= 25;

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Handle return from Stripe payment
  useEffect(() => {
    if (!isAuthenticated || isAuthLoading) return;

    if (paymentStatus === "success") {
      const savedDraft = sessionStorage.getItem("pending_event_draft");
      if (savedDraft) {
        setIsProcessingPayment(true);
        try {
          const draft = JSON.parse(savedDraft);
          createEvent({
            title: draft.title,
            eventDate: draft.eventDate,
            destinationAddress: draft.destinationAddress,
            destinationLat: draft.destinationLat,
            destinationLng: draft.destinationLng,
            maxParticipants: draft.maxParticipants,
            tierId: draft.tierId,
          })
            .then((res) => {
              sessionStorage.removeItem("pending_event_draft");
              router.push(`/e/${res.slug}/dashboard`);
            })
            .catch((err) => {
              console.error(err);
              setError(err.message || "Erreur lors de la création de l'événement après paiement.");
              setIsProcessingPayment(false);
            });
        } catch (e) {
          console.error(e);
          setIsProcessingPayment(false);
        }
      }
    } else if (paymentStatus === "cancel") {
      const savedDraft = sessionStorage.getItem("pending_event_draft");
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft.title) setTitle(draft.title);
          if (draft.eventDate) setEventDate(draft.eventDate);
          if (draft.destinationAddress) setDestinationAddress(draft.destinationAddress);
          if (draft.destinationLat) setDestinationLat(draft.destinationLat);
          if (draft.destinationLng) setDestinationLng(draft.destinationLng);
          if (draft.maxParticipants) setMaxParticipants(draft.maxParticipants);
        } catch (e) {
          console.error(e);
        }
      }
      setStep(4);
      setError("Le paiement a été annulé ou a échoué. Votre événement n'a pas été créé.");
      window.history.replaceState({}, "", "/events/create");
    }
  }, [paymentStatus, isAuthenticated, isAuthLoading, createEvent, router]);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!title.trim()) {
        setError("Veuillez saisir un titre pour votre événement.");
        return;
      }
      if (!eventDate) {
        setError("Veuillez sélectionner la date et l'heure de l'événement.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (mapPinMoved || !destinationAddress.trim()) {
        setIsGeocoding(true);
        try {
          const lat = destinationLat;
          const lng = destinationLng;
          let reverseAddress = "";

          // 1. Try BAN with type=housenumber for exact house number & street address
          try {
            const res = await fetch(
              `https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}&type=housenumber`
            );
            if (res.ok) {
              const data = await res.json();
              if (data.features && data.features.length > 0) {
                const prop = data.features[0].properties;
                reverseAddress = prop.label || prop.name || "";
              }
            }
          } catch (e) {
            console.warn("api-adresse type=housenumber failed", e);
          }

          // 2. Try standard BAN if type=housenumber didn't yield a result
          if (!reverseAddress) {
            try {
              const res = await fetch(
                `https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}`
              );
              if (res.ok) {
                const data = await res.json();
                if (data.features && data.features.length > 0) {
                  const houseFeat = data.features.find(
                    (f: any) => f.properties?.type === "housenumber" || f.properties?.housenumber
                  );
                  const prop = houseFeat ? houseFeat.properties : data.features[0].properties;
                  reverseAddress = prop.label || prop.name || (prop.street ? `${prop.street}, ${prop.city}` : "");
                }
              }
            } catch (e) {
              console.warn("api-adresse standard reverse failed", e);
            }
          }

          // 3. Fallback to OpenStreetMap Nominatim
          if (!reverseAddress) {
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`
              );
              if (res.ok) {
                const data = await res.json();
                if (data.address) {
                  const a = data.address;
                  const num = a.house_number ? `${a.house_number} ` : "";
                  const street = a.road || a.pedestrian || "";
                  const city = a.city || a.town || a.village || "";
                  const postcode = a.postcode || "";
                  if (street && city) {
                    reverseAddress = `${num}${street}, ${postcode} ${city}`.trim();
                  }
                }
                if (!reverseAddress) {
                  reverseAddress = data.display_name || "";
                }
              }
            } catch (e) {
              console.warn("nominatim reverse geocoding failed", e);
            }
          }

          if (reverseAddress) {
            setDestinationAddress(reverseAddress);
          } else if (!destinationAddress.trim()) {
            setDestinationAddress(`Point sur la carte (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          }
          setPickedLocation({ lat, lng });
        } catch (err) {
          console.error("Erreur lors de la géolocalisation de l'adresse", err);
        } finally {
          setIsGeocoding(false);
        }
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      if (isFree) {
        const res = await createEvent({
          title,
          eventDate,
          destinationAddress: destinationAddress || `Destination (${destinationLat.toFixed(4)}, ${destinationLng.toFixed(4)})`,
          destinationLat,
          destinationLng,
          maxParticipants: Number(maxParticipants),
          tierId: selectedTier.id,
        });

        router.push(`/e/${res.slug}/dashboard`);
      } else {
        if (!selectedTier.stripePriceId) {
          throw new Error("Tarif Stripe non configuré pour ce palier.");
        }

        // Save event draft in sessionStorage before redirecting to Stripe
        sessionStorage.setItem(
          "pending_event_draft",
          JSON.stringify({
            title,
            eventDate,
            destinationAddress: destinationAddress || `Destination (${destinationLat.toFixed(4)}, ${destinationLng.toFixed(4)})`,
            destinationLat,
            destinationLng,
            maxParticipants: Number(maxParticipants),
            tierId: selectedTier.id,
          })
        );

        const { url } = await createCheckoutSession({
          priceId: selectedTier.stripePriceId,
          mode: "payment",
          successUrl: `${window.location.origin}/events/create?payment_status=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/events/create?payment_status=cancel`,
        });

        if (url) {
          window.location.href = url;
        } else {
          throw new Error("Impossible d'initialiser la session de paiement Stripe.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors du traitement.");
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

  if (isProcessingPayment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-neutral-900 px-4 text-center">
        <div className="w-10 h-10 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold font-heading">Paiement validé !</h2>
        <p className="text-xs text-neutral-500 mt-1">Création de votre événement en cours, veuillez patienter...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-neutral-900 font-heading">
              BilenGo
            </span>
          </Link>

          <Link href="/dashboard" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">
            ✕ Annuler
          </Link>
        </div>
      </header>

      {/* Main Multi-Step Form */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        {/* Progress Steps */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-400">
            <span className={step >= 1 ? "text-neutral-900 font-bold" : ""}>
              1. Titre & Date
            </span>
            <span className={step >= 2 ? "text-neutral-900 font-bold" : ""}>
              2. Lieu
            </span>
            <span className={step >= 3 ? "text-neutral-900 font-bold" : ""}>
              3. Capacité
            </span>
            <span className={step >= 4 ? "text-neutral-900 font-bold" : ""}>
              4. Validation
            </span>
          </div>

          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-900 transition-all duration-300 ease-out"
              style={{
                width: step === 1 ? "25%" : step === 2 ? "50%" : step === 3 ? "75%" : "100%",
              }}
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="space-y-6">
          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-heading text-neutral-900 tracking-tight">
                  Informations de l'événement
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Définissez le nom et la date de votre événement.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
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
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
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

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="md">
                  Choisir le lieu →
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight mb-1 font-heading">
                  Lieu de l'événement
                </h1>
                <p className="text-neutral-500 text-xs">
                  Saisissez une adresse ou déplacez la carte pour cibler l'endroit exact.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Rechercher une adresse
                </label>
                <AddressAutocomplete
                  value={destinationAddress}
                  onChange={(val) => {
                    setDestinationAddress(val);
                    setMapPinMoved(false);
                  }}
                  onSelect={(item) => {
                    setDestinationAddress(item.label);
                    setMapPinMoved(false);
                    if (item.lat && item.lng) {
                      setDestinationLat(item.lat);
                      setDestinationLng(item.lng);
                      setPickedLocation({ lat: item.lat, lng: item.lng });
                    }
                  }}
                  placeholder="Ex: Stade de France, 93200 Saint-Denis..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Positionner sur la carte
                </label>
                <EventLocationPickerMap
                  initialLat={destinationLat}
                  initialLng={destinationLng}
                  pickedLocation={pickedLocation}
                  onCenterChange={(center) => {
                    setDestinationLat(center.lat);
                    setDestinationLng(center.lng);
                    setPickedLocation({ lat: center.lat, lng: center.lng });
                    setMapPinMoved(true);
                  }}
                />
                <p className="text-[11px] text-neutral-500 text-right font-mono">
                  Coordonnées GPS : {destinationLat.toFixed(5)}, {destinationLng.toFixed(5)}
                </p>
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

                <Button type="submit" variant="primary" size="md" isLoading={isGeocoding}>
                  Définir la capacité →
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight mb-1 font-heading">
                  Nombre d'invités maximum
                </h1>
                <p className="text-neutral-500 text-xs">
                  Choisissez la capacité d'invités autorisée pour cet événement.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-3">
                  Capacité d'invités
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRICING_TIERS.map((opt) => (
                    <button
                      key={opt.quota}
                      type="button"
                      onClick={() => setMaxParticipants(opt.quota)}
                      className={`p-3 text-left rounded-xl border transition-all flex flex-col justify-between ${
                        maxParticipants === opt.quota
                          ? "bg-neutral-900 text-white border-neutral-900 shadow-md ring-2 ring-neutral-900/20"
                          : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-sm">{opt.countText}</span>
                        {opt.badge && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                              maxParticipants === opt.quota
                                ? "bg-white/20 text-white"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs ${
                          maxParticipants === opt.quota ? "text-neutral-300" : "text-neutral-500"
                        }`}
                      >
                        {opt.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setStep(2)}
                >
                  ← Précédent
                </Button>

                <Button type="submit" variant="primary" size="md">
                  Récapitulatif →
                </Button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight mb-1 font-heading">
                  Récapitulatif de l'événement
                </h1>
                <p className="text-neutral-500 text-xs">
                  Vérifiez les informations avant de publier l'événement.
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
                    <p className="font-semibold text-neutral-800">
                      {maxParticipants === 1000 ? "1000+" : maxParticipants} max
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200/60">
                  <span className="text-neutral-400 font-medium">Lieu de destination</span>
                  <p className="font-semibold text-neutral-800">{destinationAddress || "Position sur la carte"}</p>
                  <p className="text-[11px] text-emerald-600 font-mono mt-0.5">
                    ✓ GPS verrouillé ({destinationLat.toFixed(5)}, {destinationLng.toFixed(5)})
                  </p>
                </div>

                {!isFree && (
                  <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                    <span className="text-neutral-400 font-medium">Pass Événement ({selectedTier.countText})</span>
                    <span className="font-bold text-neutral-900 text-sm">{selectedTier.price} TTC</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setStep(3)}
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
                  {isFree ? "Publier l'événement" : `Payer ${selectedTier.price} & Publier`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
