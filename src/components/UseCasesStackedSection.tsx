"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";
import {
  HeartHandshake,
  PartyPopper,
  Music,
  Building2,
  LucideIcon,
  Sparkles,
} from "lucide-react";

interface UseCase {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
  image: string;
  spanClass: string;
  aspectHeight: string;
}

const useCases: UseCase[] = [
  {
    id: "wedding",
    icon: HeartHandshake,
    title: "Mariages & Réceptions",
    description:
      "Permettez à vos familles et proches venus de loin de se regrouper facilement jusqu'au domaine. Une carte interactive claire sans tableau Excel.",
    badge: "Mariages",
    image: "/images/home/wedding.jpg",
    spanClass: "md:col-span-2",
    aspectHeight: "min-h-[360px] sm:min-h-[400px]",
  },
  {
    id: "party",
    icon: PartyPopper,
    title: "Anniversaires & Soirées",
    description:
      "Assurez des trajets retour sécurisés et conviviaux pour tous vos invités en fin de soirée. Vos proches rentrent en toute tranquillité.",
    badge: "Soirées",
    image: "/images/home/parties.jpg",
    spanClass: "md:col-span-1",
    aspectHeight: "min-h-[360px] sm:min-h-[400px]",
  },
  {
    id: "corporate",
    icon: Building2,
    title: "Séminaires d'Entreprise",
    description:
      "Réduisez l'empreinte carbone et optimisez la logistique des déplacements de vos collaborateurs lors des rassemblements professionnels.",
    badge: "Entreprises",
    image: "/images/home/work.jpg",
    spanClass: "md:col-span-1",
    aspectHeight: "min-h-[320px]",
  },
  {
    id: "festival",
    icon: Music,
    title: "Concerts & Festivals",
    description:
      "Facilitez l'accès à votre festival ou soirée Shotgun. Offrez une solution de covoiturage fluide à votre public pour maximiser la billetterie.",
    badge: "Festivals",
    image: "/images/home/festival.jpg",
    spanClass: "md:col-span-2",
    aspectHeight: "min-h-[320px]",
  },
];

export function UseCasesStackedSection() {
  return (
    <section className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        {/* Animated Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.21, 0.45, 0.27, 0.9] }}
          className="text-center space-y-4 max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 font-heading">
            Conçu pour tous vos rassemblements
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg">
            Une solution sur mesure et adaptée à chaque type d'événement.
          </p>
        </motion.div>

        {/* Animated Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((uc, index) => {
            const Icon = uc.icon;
            return (
              <motion.div
                key={uc.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.12,
                  ease: [0.21, 0.45, 0.27, 0.9],
                }}
                whileHover={{ y: -6 }}
                className={`group relative ${uc.spanClass} ${uc.aspectHeight} rounded-3xl overflow-hidden bg-neutral-900 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border-none`}
              >
                {/* Background Image with Dynamic Zoom Effect */}
                <Image
                  src={uc.image}
                  alt={`Covoiturage pour ${uc.title}`}
                  fill
                  sizes={
                    uc.spanClass.includes("col-span-2")
                      ? "(max-width: 768px) 100vw, 66vw"
                      : "(max-width: 768px) 100vw, 33vw"
                  }
                  className="object-cover"
                />

                {/* Soft Lighting Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-300 group-hover:opacity-95" />

                {/* Content Overlay with Compact Titles & Icons */}
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 space-y-2 z-10 text-white transform group-hover:-translate-y-1 transition-transform duration-300 ease-out">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-white/25 transition-all duration-300">
                      <Icon className="w-4 h-4 group-hover:rotate-6 transition-transform duration-300" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold font-heading tracking-tight text-white">
                      {uc.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                    {uc.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
