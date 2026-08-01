"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  HeartHandshake,
  PartyPopper,
  Users,
  Building2,
  LucideIcon,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseCase {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
  tagColor: string;
  image: string;
}

const useCases: UseCase[] = [
  {
    icon: HeartHandshake,
    title: "Mariages & Réceptions",
    description:
      "Permettez à vos familles et proches venus de loin de se regrouper facilement jusqu'au domaine. Une carte interactive claire sans tableau Excel.",
    badge: "Mariages",
    tagColor: "orange",
    image: "/images/home/wedding.jpg",
  },
  {
    icon: PartyPopper,
    title: "Anniversaires & Soirées",
    description:
      "Assurez des trajets retour sécurisés et conviviaux pour tous vos invités en fin de soirée. Vos proches rentrent en toute tranquillité.",
    badge: "Soirées",
    tagColor: "emerald",
    image: "/images/home/party.jpg",
  },
  {
    icon: Users,
    title: "Événements BDE & Écoles",
    description:
      "Organisez les départs en WEI, intégrations ou sorties de promos sans messages perdus sur les groupes WhatsApp.",
    badge: "Étudiants",
    tagColor: "blue",
    image: "/images/home/school.jpg",
  },
  {
    icon: Building2,
    title: "Séminaires d'Entreprise",
    description:
      "Réduisez l'empreinte carbone et optimisez la logistique des déplacements de vos collaborateurs lors des rassemblements professionnels.",
    badge: "Entreprises",
    tagColor: "dark",
    image: "/images/home/work.jpg",
  },
];

export function UseCasesStackedSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!cardsContainerRef.current) return;
    const cards = cardsRef.current.filter(Boolean);
    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      // Positionner initialement les cartes 1..N sous le cadre
      cards.forEach((card, index) => {
        gsap.set(card, {
          transformOrigin: "center top",
          scale: 1,
          y: 0,
        });
        if (index > 0) {
          gsap.set(card, { yPercent: 120 });
        }
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cardsContainerRef.current,
          pin: containerRef.current,
          start: "center center",
          end: `+=${cards.length * 110}%`,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      cards.forEach((card, index) => {
        if (index === 0) return;

        const stepLabel = `step-${index}`;

        // 1. Déplacer la carte entrante vers le haut
        tl.to(
          card,
          {
            yPercent: 0,
            duration: 1,
            ease: "none",
          },
          stepLabel
        );

        // 2. Empiler et réduire les cartes précédentes (0 à index-1)
        for (let prevIndex = 0; prevIndex < index; prevIndex++) {
          const depth = index - prevIndex;
          const targetScale = Math.max(0.86, 1 - depth * 0.04);
          const targetY = -depth * 16;

          tl.to(
            cards[prevIndex],
            {
              scale: targetScale,
              y: targetY,
              duration: 1,
              ease: "none",
            },
            stepLabel
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-16 sm:py-24 bg-white border-b border-neutral-100 overflow-hidden min-h-screen flex flex-col justify-center"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-6">
          <Badge variant="default" className="text-xs">
            Polyvalence Événementielle
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 font-heading">
            Conçu pour tous vos rassemblements
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg">
            Défilez pour découvrir la solution sur mesure adaptée à chaque événement.
          </p>
        </div>

        {/* Stacked Cards Frame Container with Ample Top Padding */}
        <div className="relative w-full max-w-6xl mx-auto overflow-hidden pt-16 sm:pt-20 pb-4">
          <div
            ref={cardsContainerRef}
            className="relative h-[480px] sm:h-[500px] w-full"
          >
            {useCases.map((uc, index) => {
              const IconComponent = uc.icon;
              return (
                <div
                  key={index}
                  ref={(el) => {
                    cardsRef.current[index] = el;
                  }}
                  style={{ zIndex: index + 1 }}
                  className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden border border-neutral-200/90 bg-neutral-900 shadow-xl"
                >
                  {/* Full-bleed Background Image */}
                  <Image
                    src={uc.image}
                    alt={`Covoiturage pour ${uc.title}`}
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-cover"
                  />

                  {/* Bottom-Left Text Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-12 space-y-3 text-white z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-md">
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h3 className="text-2xl sm:text-4xl font-extrabold text-white font-heading tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                        {uc.title}
                      </h3>
                    </div>

                    <p className="text-white text-sm sm:text-base max-w-2xl leading-relaxed font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                      {uc.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
