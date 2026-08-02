import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Politique de Confidentialité — BilenGo",
  description: "Politique de protection des données personnelles et respect du RGPD sur BilenGo.",
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <Navbar />

      <main className="flex-1 w-full bg-neutral-50/50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <nav className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour à l'accueil
            </Link>
          </nav>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
            <header className="border-b border-neutral-200/80 pb-6 space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 font-heading">
                Politique de Confidentialité
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500">
                Dernière mise à jour : 2 août 2026
              </p>
            </header>

            <section className="space-y-6 text-sm text-neutral-700 leading-relaxed">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-heading mb-2">
                  1. Protection des Données Personnelles (RGPD)
                </h2>
                <p>
                  BilenGo accorde une importance primordiale au respect de votre vie privée et à la protection de vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-heading mb-2">
                  2. Données Collectées
                </h2>
                <p>
                  Nous collectons uniquement les données strictement nécessaires au fonctionnement du service de covoiturage :
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-neutral-600">
                  <li>Prénom / Nom ou Pseudonyme.</li>
                  <li>Numéro de téléphone ou email (utilisé uniquement pour la mise en relation directe par WhatsApp/SMS entre participants).</li>
                  <li>Ville ou lieu de départ du covoiturage et nombre de places disponibles.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-heading mb-2">
                  3. Utilisation des Données & Non-Revente
                </h2>
                <p>
                  Vos données personnelles ne sont jamais vendues, cédées ni transmises à des tiers à des fins publicitaires. Elles servent exclusivement à permettre la mise en relation entre conducteurs et passagers d'un même événement.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-heading mb-2">
                  4. Vos Droits (Accès, Rectification, Suppression)
                </h2>
                <p>
                  Conformément à la loi informatique et libertés, vous disposez à tout moment d'un droit d'accès, de rectification et de suppression de vos données personnelles en envoyant une simple demande à <a href="mailto:contact@bilengo.com" className="text-neutral-900 underline font-medium">contact@bilengo.com</a>.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
