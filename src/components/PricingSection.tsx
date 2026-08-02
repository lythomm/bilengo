"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

import { PRICING_TIERS } from "@/config/pricing";

interface PricingSectionProps {
  onAuthClick?: () => void;
}

function getFixedPriceSlots(priceStr: string): string[] {
  if (priceStr.trim() === "0 €") {
    return [" ", " ", "0", " ", "€"];
  }

  const match = priceStr.match(/^(\d+),(\d{2})\s*€$/);
  if (!match) return priceStr.split("");

  const intPart = match[1].padStart(3, " ");
  const decPart = match[2];

  return [
    intPart[0],
    intPart[1],
    intPart[2],
    ",",
    decPart[0],
    decPart[1],
    " ",
    "€",
  ];
}

function SlotChar({ char, slotIdx }: { char: string; slotIdx: number }) {
  const isBlank = char === " ";

  return (
    <div className={`relative overflow-hidden h-9 inline-flex items-center justify-center ${isBlank ? "w-0 shrink-0" : ""}`}>
      <AnimatePresence mode="wait" initial={false}>
        {!isBlank && (
          <motion.span
            key={`${slotIdx}-${char}`}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block"
          >
            {char}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function SeniorOdometer({ priceStr }: { priceStr: string }) {
  const slots = getFixedPriceSlots(priceStr);

  return (
    <div className="flex items-center justify-end font-heading text-2xl sm:text-3xl font-extrabold text-neutral-900 tabular-nums">
      {slots.map((char, idx) => (
        <SlotChar key={idx} char={char} slotIdx={idx} />
      ))}
    </div>
  );
}

export function PricingSection({ onAuthClick }: PricingSectionProps) {
  const tiers = PRICING_TIERS.map((t) => ({
    ...t,
    period: t.isFree ? "Gratuit à vie" : "Paiement unique / événement",
  }));

  const [selectedTierId, setSelectedTierId] = useState<string>(tiers[0].id);

  const currentTier = tiers.find((t) => t.id === selectedTierId) || tiers[0];

  const sharedFeatures = [
    "Création de la page d'événement en 2 minutes",
    "Carte interactive centralisée des trajets et départs",
    "Mise en relation directe entre passagers et conducteurs",
    "Aucun téléchargement d'application requis pour les invités",
    "Notifications et lien WhatsApp / SMS pré-rempli",
    "Tableau de bord organisateur et statistiques de remplissage",
    "Conservation et accès illimité à l'événement sans expiration",
  ];

  return (
    <section id="tarifs" className="py-20 sm:py-28 bg-white text-neutral-900 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Headline & Value Prop */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 font-heading leading-[1.08]">
              Un prix unique <br className="hidden sm:block" />
              par événement.
            </h2>

            <p className="text-neutral-600 leading-relaxed max-w-xl font-normal">
              Sans abonnement ni renouvellement automatique. Le prix dépend uniquement du nombre d'invités que vous souhaitez accueillir.
            </p>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={onAuthClick}
                className="!bg-neutral-900 !text-white hover:!bg-neutral-800 font-semibold cursor-pointer border-none"
                rightIcon={<ArrowRight className="w-4 h-4 text-white" />}
              >
                Créer mon événement gratuit
              </Button>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-neutral-500 font-medium">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Paiement 100% sécurisé
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Jusqu'à 25 invités offerts
              </span>
            </div>
          </div>

          {/* Right Column: Light Interactive Pricing Card */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 relative overflow-hidden">

              {/* Card Header: Guest Count Title & Senior Odometer Price */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <span>Jusqu'à</span>
                  <h3 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900 flex items-center gap-2">
                    <motion.span
                      key={currentTier.id}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      {currentTier.countText}
                    </motion.span>
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <SeniorOdometer priceStr={currentTier.price} />
                  <span className="text-[11px] text-neutral-500 font-medium">
                    {currentTier.period}
                  </span>
                </div>
              </div>

              {/* Pill Selector for Guest Capacities */}
              <div className="mb-8">
                <div className="grid grid-cols-7 gap-1.5 p-1.5 bg-neutral-100/90 rounded-2xl">
                  {tiers.map((tier) => {
                    const isSelected = tier.id === selectedTierId;
                    return (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedTierId(tier.id)}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all relative cursor-pointer border-none text-center ${isSelected
                          ? "bg-neutral-900 text-white font-bold"
                          : "bg-transparent text-neutral-600 font-medium hover:text-neutral-900 hover:bg-white/80"
                          }`}
                      >
                        {tier.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Description & Feature List */}
              <div className="space-y-5">

                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 block mb-3">
                    Fonctionnalités incluses :
                  </span>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-xs sm:text-sm text-neutral-800">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-neutral-900">
                        Jusqu'à <strong className="text-emerald-700 font-bold">{currentTier.countText}</strong> acceptés
                      </span>
                    </li>

                    {sharedFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-600">
                        <div className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-200">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={onAuthClick}
                    className="w-full !bg-neutral-900 hover:!bg-neutral-800 !text-white font-bold text-sm cursor-pointer border-none py-3"
                  >
                    {currentTier.isFree ? "Démarrer gratuitement (0 €)" : `Choisir la formule (${currentTier.countText})`}
                  </Button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
