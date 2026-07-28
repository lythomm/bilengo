"use client";

import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Smartphone, MessageSquare, MapPin, Plus, LogOut, ArrowRight, Car, Menu, X, LayoutDashboard } from "lucide-react";

export function HomeClient() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center shrink-0">
            <span className="text-xl font-bold tracking-tight text-neutral-900 font-heading whitespace-nowrap">
              BilenGo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {isAuthLoading ? (
              <div className="text-xs text-neutral-400 animate-pulse whitespace-nowrap">
                Chargement...
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3 shrink-0">
                <Link href="/dashboard" className="shrink-0">
                  <Button variant="primary" size="sm">
                    Mon Tableau de bord
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                  title="Déconnexion"
                  aria-label="Déconnexion"
                >
                  Déconnexion
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAuthOpen(true)}
              >
                Espace Organisateur
              </Button>
            )}
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
            {isAuthLoading ? (
              <div className="text-xs text-neutral-400 p-2 animate-pulse">
                Chargement...
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-1">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 w-full p-2.5 rounded-lg text-sm font-semibold text-neutral-900 hover:bg-neutral-100 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-neutral-600" />
                  Mon Tableau de bord
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-2.5 w-full p-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAuthOpen(true);
                }}
              >
                Espace Organisateur
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge variant="default" className="px-3 py-1 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Covoiturage Événementiel Sans Friction
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-neutral-900 max-w-4xl leading-[1.08] font-heading">
            Organisez vos événements. <br />
            <span className="text-neutral-500 font-normal">
              Facilitez le covoiturage de vos invités.
            </span>
          </h1>

          <p className="text-neutral-600 text-base sm:text-lg max-w-2xl leading-relaxed">
            Fini les fichiers Excel et les conversations WhatsApp désordonnées. Créez un événement en un instant, partagez le lien à vos participants. Aucun téléchargement requis.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {isAuthenticated ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Accéder au tableau de bord
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsAuthOpen(true)}
                className="w-full sm:w-auto"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Créer un événement gratuit
              </Button>
            )}
            <Link href="#features" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                En savoir plus
              </Button>
            </Link>
          </div>

          {/* Cal.com Product UI Fragment Card */}
          <div className="w-full max-w-4xl pt-10">
            <div className="bg-neutral-50 p-3 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-sm">
              <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6 text-left shadow-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-800 text-sm">
                      M
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900 font-heading">
                        Mariage de Sarah & Julien
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Château de Chantilly • 14 Septembre 2026
                      </p>
                    </div>
                  </div>
                  <Badge variant="emerald">
                    <Car className="w-3 h-3 inline mr-1" />
                    12 Conducteurs
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg border border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-neutral-800">Trajet Paris ➔ Chantilly</div>
                      <div className="text-xs text-neutral-500">Départ 14h00 • 3 places libres</div>
                    </div>
                    <Button variant="secondary" size="sm">Réserver</Button>
                  </div>
                  <div className="p-3.5 rounded-lg border border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-neutral-800">Trajet Lille ➔ Chantilly</div>
                      <div className="text-xs text-neutral-500">Départ 12h30 • 2 places libres</div>
                    </div>
                    <Button variant="secondary" size="sm">Réserver</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pt-16 text-left">
            <Card variant="gray" className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 text-neutral-900 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-neutral-800" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 font-heading">
                Zéro Application
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Vos invités ouvrent simplement le lien web partagé. Aucune application à installer ni mot de passe à retenir.
              </p>
            </Card>

            <Card variant="gray" className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 text-neutral-900 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-neutral-800" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 font-heading">
                Mise en relation WhatsApp
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Validation de réservation directe en 1 clic par le conducteur via WhatsApp ou SMS. Sans commission.
              </p>
            </Card>

            <Card variant="gray" className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 text-neutral-900 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-neutral-800" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 font-heading">
                Autocomplétion & Destination
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Tous les covoiturages convergent vers le lieu unique de votre événement avec cartes et suggestions interactives.
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Dark Footer (Signature Cal.com inverted footer #101010) */}
      <footer className="bg-[#101010] text-neutral-400 py-12 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-white text-[#101010] flex items-center justify-center font-bold text-xs">
              B
            </div>
            <span className="text-white font-semibold tracking-tight text-sm font-heading">
              bilengo
            </span>
          </div>
          <p className="text-neutral-500">
            © 2026 Bilengo. Tous droits réservés.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
