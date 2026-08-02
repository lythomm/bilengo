import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Mentions Légales — BilenGo",
  description: "Mentions légales, éditeur et hébergeur du service BilenGo.",
};

export default function MentionsLegalesPage() {
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
                Mentions Légales
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500">
                Dernière mise à jour : 2 août 2026
              </p>
            </header>

            <section className="space-y-6 text-sm text-neutral-700 leading-relaxed">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-heading mb-2">
                  1. Éditeur du Service
                </h2>
                <p>
                  Le site et le service <strong>BilenGo</strong> sont édités par l'équipe BilenGo.
                </p>
                <p className="mt-1">
                  Contact : <a href="mailto:contact@bilengo.com" className="text-neutral-900 underline font-medium">contact@bilengo.com</a>
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-heading mb-2">
                  2. Directeur de la Publication
                </h2>
                <p>Le directeur de la publication est le responsable éditorial de BilenGo.</p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-heading mb-2">
                  3. Hébergement
                </h2>
                <p>
                  Le service et les bases de données de BilenGo sont hébergés par :
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-neutral-600">
                  <li><strong>Vercel Inc.</strong> — 440 N San Mateo Rd, San Mateo, CA 94401, États-Unis (Hébergement Web & Next.js).</li>
                  <li><strong>Convex Inc.</strong> — San Francisco, CA, États-Unis (Base de données temps réel et authentification).</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-heading mb-2">
                  4. Propriété Intellectuelle
                </h2>
                <p>
                  L'ensemble des contenus présents sur le site BilenGo (marques, logos, textes, éléments graphiques, code source) est protégé par le droit d'auteur et la propriété intellectuelle. Toute reproduction ou représentation totale ou partielle sans autorisation écrite est strictement interdite.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-heading mb-2">
                  5. Contact
                </h2>
                <p>
                  Pour toute question relative aux mentions légales ou à l'utilisation du service, contactez-nous par email à <a href="mailto:contact@bilengo.com" className="text-neutral-900 underline font-medium">contact@bilengo.com</a>.
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
