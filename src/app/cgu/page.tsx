import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Conditions Générales d'Utilisation (CGU) — BilenGo",
  description: "Conditions Générales d'Utilisation de la plateforme de covoiturage événementiel BilenGo.",
};

export default function CGUPage() {
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
                Conditions Générales d'Utilisation (CGU)
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500">
                Dernière mise à jour : 2 août 2026
              </p>
            </header>

            <section className="space-y-6 text-sm text-neutral-700 leading-relaxed">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-heading mb-2">
                  1. Objet du Service
                </h2>
                <p>
                  BilenGo est une plateforme de mise en relation destinée à faciliter l'organisation du covoiturage pour des événements privés et publics (mariages, anniversaires, soirées, festivals, séminaires). BilenGo agit uniquement en tant qu'intermédiaire d'information.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-heading mb-2">
                  2. Gratuité et Absences de Commission
                </h2>
                <p>
                  L'accès à la plateforme et la mise en relation entre conducteurs et passagers sont sans commission. Les conducteurs et passagers conviennent librement entre eux de tout partage éventuel des frais de carburant et de péage.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-heading mb-2">
                  3. Responsabilité des Conducteurs et Passagers
                </h2>
                <p>
                  Le conducteur s'engage à disposer d'un permis de conduire valide et d'une assurance automobile en vigueur couvant le transport de passagers à titre bénévole. BilenGo n'effectue pas de vérification des véhicules ni de l'assurance des utilisateurs et décline toute responsabilité en cas d'accident, de retard ou de litige entre participants.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-heading mb-2">
                  4. Engagements des Organisateurs d'Événements
                </h2>
                <p>
                  Les organisateurs s'engagent à fournir des informations exactes sur leurs événements et à respecter les limites du nombre d'invités associées à leur formule (gratuite ou premium).
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-heading mb-2">
                  5. Modification des Conditions
                </h2>
                <p>
                  BilenGo se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des mises à jour majeures directement sur la plateforme.
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
