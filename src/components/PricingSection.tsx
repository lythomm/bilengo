"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PricingSectionProps {
  onAuthClick?: () => void;
}

export function PricingSection({ onAuthClick }: PricingSectionProps) {
  const tiers = [
    {
      id: "25",
      label: "25",
      countText: "25 invités",
      price: "0 €",
      period: "Gratuit à vie",
      badge: "Gratuit",
      isFree: true,
    },
    {
      id: "50",
      label: "50",
      countText: "50 invités",
      price: "9,99 €",
      period: "Paiement unique / événement",
      badge: null,
      isFree: false,
    },
    {
      id: "100",
      label: "100",
      countText: "100 invités",
      price: "14,99 €",
      period: "Paiement unique / événement",
      badge: "Offre conseillée",
      isFree: false,
    },
    {
      id: "150",
      label: "150",
      countText: "150 invités",
      price: "29,99 €",
      period: "Paiement unique / événement",
      badge: null,
      isFree: false,
    },
    {
      id: "250",
      label: "250",
      countText: "250 invités",
      price: "39,99 €",
      period: "Paiement unique / événement",
      badge: "Populaire",
      isFree: false,
    },
    {
      id: "500",
      label: "500",
      countText: "500 invités",
      price: "69,99 €",
      period: "Paiement unique / événement",
      badge: null,
      isFree: false,
    },
    {
      id: "1000",
      label: "1000+",
      countText: "1000+ invités",
      price: "119,99 €",
      period: "Paiement unique / événement",
      badge: "Gros volume",
      isFree: false,
    },
  ];

  const [selectedTierId, setSelectedTierId] = useState<string>("250");

  const currentTier = tiers.find((t) => t.id === selectedTierId) || tiers[4];

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 text-neutral-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Tarification simple & transparente
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 font-heading leading-[1.08]">
              Un prix unique <br className="hidden sm:block" />
              par événement.
            </h2>

            <p className="text-neutral-600 leading-relaxed max-w-xl font-normal">
              Vous ne payez qu'une seule fois par événement, sans abonnement ni renouvellement automatique. Le prix dépend uniquement du nombre d'invités que vous souhaitez accueillir.
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

              {/* Card Header: Guest Count Title & Dynamic Price */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <span>Jusqu'à</span>
                  <h3 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900 flex items-center gap-2">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentTier.id}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="inline-block"
                      >
                        {currentTier.countText}
                      </motion.span>
                    </AnimatePresence>
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTier.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <span className="text-2xl font-extrabold font-heading text-neutral-900 block">
                        {currentTier.price}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-medium">
                        {currentTier.period}
                      </span>
                    </motion.div>
                  </AnimatePresence>
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
