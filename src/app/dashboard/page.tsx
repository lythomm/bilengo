"use client";

import { useState, useEffect } from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function DashboardPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();

  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Route Guard: Redirect to home page if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const myEvents = useQuery(
    api.events.getMyEvents,
    isAuthenticated ? {} : "skip"
  );

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/e/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse text-lg">Vérification de votre session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
              B
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Bilengo
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                Espace Organisateur
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/events/create"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors shadow-md"
            >
              + Créer un événement
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 text-sm transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            <Link
              href="/events/create"
              className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
            >
              + Créer un nouvel événement
            </Link>
          </div>

          {myEvents === undefined ? (
            <div className="py-12 text-center text-slate-500 animate-pulse">
              Chargement de vos événements...
            </div>
          ) : myEvents.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <h3 className="text-lg font-bold text-white">
                Vous n'avez pas encore créé d'événement
              </h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Créez votre premier événement en 1 clic et partagez son lien public à vos invités pour organiser le covoiturage.
              </p>
              <Link
                href="/events/create"
                className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
              >
                + Créer mon premier événement
              </Link>
            </div>
          ) : (
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
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Bilengo. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
