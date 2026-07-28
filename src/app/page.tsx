"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { AuthModal } from "@/components/AuthModal";
import { CreateEventModal } from "@/components/CreateEventModal";
import Link from "next/link";

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const { signOut } = useAuthActions();
  const myEvents = useQuery(api.events.getMyEvents);

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/e/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
              B
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Bilengo
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                Covoiturage Événementiel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {myEvents !== undefined && myEvents.length > 0 ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors shadow-md"
                >
                  + Créer un événement
                </button>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 text-sm transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/15"
              >
                Espace Organisateur
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero / Dashboard Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {myEvents !== undefined && myEvents.length > 0 ? (
          /* Dashboard Section for Logged-In Organizers */
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  Tableau de bord Organisateur
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Gérez vos événements et facilitez le covoiturage pour vos participants.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
              >
                + Créer un nouvel événement
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((evt: any) => (
                <div
                  key={evt._id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-colors shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
                        Gratuit ({evt.maxParticipants} max)
                      </span>
                      <span className="text-xs text-amber-400 font-medium">
                        {new Date(evt.eventDate).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white line-clamp-1">
                      {evt.title}
                    </h3>

                    <p className="text-slate-400 text-sm line-clamp-2 flex items-start gap-1.5">
                      <span>📍</span>
                      <span>{evt.destinationAddress}</span>
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center gap-3">
                    <Link
                      href={`/e/${evt.slug}`}
                      className="flex-1 py-2.5 text-center rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                    >
                      Voir la page
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(evt.slug)}
                      className="px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium transition-colors"
                    >
                      {copiedSlug === evt.slug ? "✓ Copié !" : "Copier le lien"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Public Hero Section */
          <div className="py-12 sm:py-20 flex flex-col items-center text-center space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
              <span>🚀</span>
              <span>Covoiturage Événementiel Sans Friction</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl leading-tight">
              Organisez vos événements. <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                Facilitez le covoiturage de tous vos invités.
              </span>
            </h1>

            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl leading-relaxed">
              Fini les feuilles Excel et les groupes Facebook désordonnés. Créez votre événement en 1 clic, partagez le lien à vos invités. Aucun téléchargement d'application ni mot de passe requis pour les participants.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-lg transition-colors shadow-xl shadow-amber-500/25"
              >
                Créer mon premier événement gratuit
              </button>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl pt-16 text-left">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl">
                  ⚡
                </div>
                <h3 className="text-lg font-bold text-white">Zéro Application</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Vos invités ouvrent simplement le lien web partagé. Aucune application à installer ni mot de passe à retenir.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl">
                  📲
                </div>
                <h3 className="text-lg font-bold text-white">Mise en relation WhatsApp</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Validation de réservation directe en 1 clic par le conducteur via WhatsApp ou SMS. 0 € de frais pour la plateforme.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl">
                  📍
                </div>
                <h3 className="text-lg font-bold text-white">Autocomplétion & Destination</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Tous les covoiturages convergent vers le lieu unique de votre événement. Autocomplétion d'adresses gratuite intégrée.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Bilengo. Tous droits réservés.</p>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(slug) => {
          setIsCreateOpen(false);
        }}
      />
    </div>
  );
}
