"use client";

import { useState, useEffect } from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Plus, Copy, Check, LogOut, MapPin, Calendar, ExternalLink, CalendarPlus, Menu, X } from "lucide-react";

export function DashboardClient() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();

  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-neutral-500">
        <div className="animate-pulse text-sm font-medium">
          Chargement du tableau de bord...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="text-xl font-bold tracking-tight text-neutral-900 font-heading whitespace-nowrap">
              BilenGo
            </span>
            <Badge variant="default" className="hidden sm:inline-flex">
              Espace Organisateur
            </Badge>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Link href="/events/create" className="shrink-0">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Créer un événement
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              title="Déconnexion"
              aria-label="Déconnexion"
            >
              Déconnexion
            </Button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors border-none bg-transparent cursor-pointer"
              aria-label="Menu principal"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-neutral-900" />
              ) : (
                <Menu className="w-6 h-6 text-neutral-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Overlay - shadcn style) */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 z-50 sm:hidden border-b border-neutral-200/90 bg-white/95 backdrop-blur-md px-4 py-3 space-y-2 shadow-xl">
            <Link
              href="/events/create"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 w-full p-2.5 rounded-lg text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors justify-center"
            >
              <Plus className="w-4 h-4" />
              Créer un événement
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleSignOut();
              }}
              className="flex items-center gap-2.5 w-full p-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              Déconnexion
            </button>
          </div>
        )}
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight font-heading">
                Tableau de bord Organisateur
              </h1>
              <p className="text-neutral-500 text-sm mt-1">
                Gérez vos événements et facilitez le covoiturage pour vos invités.
              </p>
            </div>
            <Link href="/events/create" className="self-start sm:self-auto">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Créer un nouvel événement
              </Button>
            </Link>
          </div>

          {myEvents === undefined ? (
            <div className="py-12 text-center text-neutral-400 text-sm animate-pulse">
              Chargement de vos événements...
            </div>
          ) : myEvents.length === 0 ? (
            <Card variant="gray" className="p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 text-neutral-800 flex items-center justify-center mx-auto">
                <CalendarPlus className="w-6 h-6 text-neutral-700" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 font-heading">
                Vous n'avez pas encore créé d'événement
              </h3>
              <p className="text-neutral-500 text-sm max-w-md mx-auto">
                Créez votre premier événement en 1 clic et partagez son lien public à vos invités.
              </p>
              <Link href="/events/create" className="inline-block">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Créer mon premier événement
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((evt: any) => (
                <Card
                  key={evt._id}
                  variant="white"
                  className="flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="default">
                        Gratuit ({evt.maxParticipants} max)
                      </Badge>
                      <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(evt.eventDate).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 line-clamp-1 font-heading">
                      {evt.title}
                    </h3>

                    <p className="text-neutral-500 text-xs line-clamp-2 flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      <span>{evt.destinationAddress}</span>
                    </p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-neutral-100 flex items-center gap-2">
                    <Link href={`/e/${evt.slug}`} className="flex-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      >
                        Voir la page
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyLink(evt.slug)}
                      leftIcon={
                        copiedSlug === evt.slug ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-neutral-500" />
                        )
                      }
                    >
                      {copiedSlug === evt.slug ? "Copié !" : "Copier"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#101010] text-neutral-400 py-8 border-t border-neutral-800 text-center text-xs">
        <p>© 2026 Bilengo. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
