"use client";

import Link from "next/link";
import { Leaf, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#101010] text-neutral-400 border-t border-neutral-800 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-neutral-800/80">
          {/* Brand & Description (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white text-[#101010] flex items-center justify-center font-bold text-base font-heading">
                B
              </div>
              <span className="text-white font-bold tracking-tight text-xl font-heading">
                BilenGo
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
              La plateforme de covoiturage événementiel sans friction. Simplifiez les trajets de vos invités pour vos mariages, anniversaires, soirées et festivals sans commission.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Leaf className="w-3.5 h-3.5" />
                Mobilité décarbonée
              </span>
              <span className="flex items-center gap-1.5 text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Sécurisé & RGPD
              </span>
            </div>
          </div>

          {/* Navigation Produit */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-heading">
              Plateforme
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog & Guides
                </Link>
              </li>
              <li>
                <Link href="/#tarifs" className="hover:text-white transition-colors">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="/events/create" className="hover:text-white transition-colors">
                  Créer un événement
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Espace Organisateur
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-heading">
              Informations Légales
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/mentions-legales" className="hover:text-white transition-colors">
                  Mentions Légales
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="hover:text-white transition-colors">
                  CGU (Conditions d'Utilisation)
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:text-white transition-colors">
                  Politique de Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} BilenGo. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            Fait avec <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> pour simplifier vos trajets.
          </p>
        </div>
      </div>
    </footer>
  );
}
