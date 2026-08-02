"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Menu, X, LayoutDashboard, LogOut, Plus } from "lucide-react";

export interface NavbarProps {
  badge?: ReactNode;
  rightContent?: ReactNode;
  onAuthClick?: () => void;
  isDashboard?: boolean;
}

export function Navbar({
  badge,
  rightContent,
  onAuthClick,
  isDashboard = false,
}: NavbarProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left Logo & Optional Badge */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="text-xl font-bold tracking-tight text-neutral-900 font-heading whitespace-nowrap">
            BilenGo
          </span>
          {badge}
        </Link>

        {/* Custom Right Content (e.g. Cancel button) if provided */}
        {rightContent ? (
          <div className="flex items-center gap-3 shrink-0">
            {rightContent}
          </div>
        ) : (
          <>
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              {isAuthLoading ? (
                <div className="text-xs text-neutral-400 animate-pulse whitespace-nowrap">
                  Chargement...
                </div>
              ) : isDashboard ? (
                <>
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
                </>
              ) : isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="shrink-0">
                    <Button variant="primary" size="sm">
                      Mon Tableau de bord
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
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onAuthClick}
                  >
                    Espace Organisateur
                  </Button>
                </>
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
          </>
        )}
      </div>

      {/* Mobile Dropdown Popover */}
      {!rightContent && isMobileMenuOpen && (
        <div className="absolute top-full right-4 mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl p-1.5 z-50 sm:hidden">
          {isAuthLoading ? (
            <div className="text-xs text-neutral-400 p-2.5 animate-pulse">
              Chargement...
            </div>
          ) : isDashboard ? (
            <div className="space-y-0.5">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Navigation
              </div>
              <Link
                href="/events/create"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-neutral-100 transition-colors"
              >
                <Plus className="w-4 h-4 text-neutral-500" />
                Créer un événement
              </Link>
              <div className="h-px bg-neutral-100 my-1" />
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                Déconnexion
              </button>
            </div>
          ) : isAuthenticated ? (
            <div className="space-y-0.5">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Mon Compte
              </div>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-neutral-100 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-neutral-500" />
                Mon Tableau de bord
              </Link>
              <div className="h-px bg-neutral-100 my-1" />
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onAuthClick) onAuthClick();
                }}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-neutral-100 transition-colors border-none bg-transparent cursor-pointer text-left"
              >
                <Plus className="w-4 h-4 text-neutral-500" />
                Espace Organisateur
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
