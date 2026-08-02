"use client";

import Image from "next/image";
import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { UseCasesStackedSection } from "@/components/UseCasesStackedSection";
import { PricingSection } from "@/components/PricingSection";
import {
  Smartphone,
  MessageSquare,
  MapPin,
  Plus,
  ArrowRight,
  Car,
  CheckCircle2,
  Leaf,
  Clock,
  ShieldCheck,
  ChevronDown,
  Zap,
  Share2,
  Users,
  Sparkles,
  HeartHandshake,
  PartyPopper,
  Building2,
  Calendar,
  Fuel,
  X,
} from "lucide-react";

export function HomeClient() {
  const { isAuthenticated } = useConvexAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Calculator state
  const [guestCount, setGuestCount] = useState<number>(80);
  const [avgDistance, setAvgDistance] = useState<number>(45);

  // FAQ open states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Calculated values
  const carsSaved = Math.round(guestCount / 2.8);
  const co2SavedKg = Math.round(carsSaved * avgDistance * 0.19);
  const fuelSavedEuros = Math.round(carsSaved * avgDistance * 0.12);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "Comment organiser le covoiturage d'un mariage, anniversaire ou événement ?",
      answer:
        "Pour organiser le covoiturage de votre événement sur BilenGo, créez la page de votre rassemblement en 2 minutes. Vous obtenez un lien web unique à inclure dans vos faire-part, invitations ou groupes. Les conducteurs y publient leurs places libres et les passagers les réservent en 1 clic.",
    },
    {
      question: "BilenGo est-il gratuit pour organiser un covoiturage événementiel ?",
      answer:
        "Oui ! BilenGo propose une formule gratuite jusqu'à 25 invités (idéal pour les anniversaires, réceptions familiales et petites soirées). La formule gratuite comprend l'accès complet au tableau de bord organisateur, la carte interactive des départs et la mise en relation illimitée sans commission.",
    },
    {
      question: "Faut-il télécharger une application de covoiturage pour participer ?",
      answer:
        "Non, aucun téléchargement d'application ni aucune inscription complexe n'est requis. BilenGo est une plateforme 100% web compatible sur tous les smartphones, tablettes et ordinateurs.",
    },
    {
      question: "Comment fonctionne la mise en relation par WhatsApp ou SMS ?",
      answer:
        "Lorsqu'un invité réserve son siège en covoiturage, un message pré-rempli s'ouvre automatiquement sur WhatsApp ou SMS vers le conducteur. La confirmation se fait directement de personne à personne en toute simplicité.",
    },
    {
      question: "Quels sont les avantages de BilenGo par rapport aux tableaux Excel et groupes WhatsApp ?",
      answer:
        "BilenGo remplace les tableurs Excel illisibles et les messages noyés dans les groupes de discussion par une carte interactive centralisée. L'organisateur suit le taux de remplissage en temps réel et les invités s'auto-organisent en toute autonomie.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Top Navigation */}
      <Navbar onAuthClick={() => setIsAuthOpen(true)} />

      <main className="flex-1 w-full">
        {/* ================= 1. HERO SECTION ================= */}
        <section className="relative overflow-hidden min-h-[calc(100vh-72px)] flex flex-col justify-center py-12 sm:py-20 bg-gradient-to-b from-neutral-50/60 via-white to-white">
          {/* Real Light Vector Map Layer (Heavily Blurred Google Maps Theme) */}
          <div className="absolute inset-0 pointer-events-none select-none opacity-50 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_65%,transparent_100%)]">
            <Image
              src="/images/home/light_map.jpg"
              alt="Google Maps Light Vector Background"
              fill
              priority
              sizes="100vw"
              className="object-cover brightness-105 contrast-105 blur-[14px]"
            />
          </div>

          {/* Cartographic Map Grid Pattern Overlay */}
          <div className="absolute inset-0 pointer-events-none select-none opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_60%,transparent_100%)]">
            <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hero-map-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.75" className="text-neutral-400/80" />
                  <circle cx="48" cy="48" r="1.5" className="fill-neutral-500/80" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-map-grid)" />
            </svg>
          </div>

          {/* Soft White Gradient Fade at Section Bottom */}
          <div className="absolute bottom-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 max-w-4xl leading-[1.06] font-heading"
              >
                Le covoiturage événementiel sans friction. <br />
                <span className="text-neutral-400 font-normal">
                  Simplifiez les trajets de tous vos invités.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-neutral-600 text-base sm:text-xl max-w-2xl leading-relaxed font-normal"
              >
                Fini le casse-tête des groupes Facebook et des fichiers Excel illisibles. Offrez une solution sur mesure à vos invités et ne vous souciez plus jamais de la logistique.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-2"
              >
                {isAuthenticated ? (
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all"
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
                    className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all cursor-pointer"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Créer un événement gratuit
                  </Button>
                )}
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto cursor-pointer">
                    Découvrir le fonctionnement
                  </Button>
                </a>
              </motion.div>

              {/* Social Proof Trust Pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 text-xs font-medium text-neutral-500"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Gratuit jusqu'à 25 invités</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Zéro application à télécharger</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Contact WhatsApp & SMS direct</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================= 3. HOW IT WORKS (3 STEPS) ================= */}
        <section id="how-it-works" className="py-20 sm:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-4 max-w-2xl mx-auto mb-16"
            >
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 font-heading">
                Comment ça marche ?
              </h2>
              <p className="text-neutral-600 text-base sm:text-lg">
                La plateforme de covoiturage pensée pour vos événements, sans téléchargement d'application.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -6 }}
              >
                <Card variant="gray" className="space-y-4 p-6 sm:p-8 relative hover:border-neutral-300 transition-all h-full">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg font-heading shadow-xs">
                      01
                    </div>
                    <Zap className="w-5 h-5 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 font-heading">
                    Créez votre événement
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Renseignez la date, l'adresse et le lieu de votre rassemblement. Générez votre lien personnalisé en moins de 2 minutes.
                  </p>
                </Card>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -6 }}
              >
                <Card variant="gray" className="space-y-4 p-6 sm:p-8 relative hover:border-neutral-300 transition-all h-full">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg font-heading shadow-xs">
                      02
                    </div>
                    <Share2 className="w-5 h-5 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 font-heading">
                    Partagez le lien unique
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Insérez le lien web dans vos faire-part, SMS ou groupes. Vos invités y accèdent instantanément sans aucune inscription.
                  </p>
                </Card>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -6 }}
              >
                <Card variant="gray" className="space-y-4 p-6 sm:p-8 relative hover:border-neutral-300 transition-all h-full">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg font-heading shadow-xs">
                      03
                    </div>
                    <HeartHandshake className="w-5 h-5 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 font-heading">
                    Mise en relation directe
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Les conducteurs proposent leurs véhicules, les passagers réservent leur siège avec confirmation directe via WhatsApp & SMS.
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================= 5. USE CASES SECTION ================= */}
        <UseCasesStackedSection />

        {/* ================= 6. INTERACTIVE SAVINGS & CARBON CALCULATOR (FULL-BLEED DARK SECTION) ================= */}
        <section className="py-20 sm:py-28 bg-neutral-900 text-white border-b border-neutral-800">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12"
          >
            {/* Main Hero Counter */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <motion.div
                key={co2SavedKg}
                initial={{ scale: 0.94 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="text-6xl sm:text-8xl font-black font-heading text-emerald-400 tracking-tight"
              >
                -{co2SavedKg} <span className="text-3xl sm:text-4xl font-light text-white">kg de CO₂</span>
              </motion.div>

              <p className="text-neutral-300 text-base sm:text-lg max-w-xl mx-auto font-normal">
                Jusqu'à <strong className="text-emerald-300">{co2SavedKg} kg de CO₂ non émis</strong>, soit <strong className="text-white">{carsSaved} voitures en moins</strong> sur les routes et <strong className="text-white">~{fuelSavedEuros} €</strong> de carburant préservé.
              </p>
            </div>

            {/* Interactive Sliders Bar */}
            <div className="max-w-3xl mx-auto bg-neutral-800/60 p-6 sm:p-8 rounded-2xl border border-neutral-700/80 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-lg">
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-semibold text-neutral-300">
                  <span>Nombre d'invités :</span>
                  <span className="text-white font-bold">{guestCount} personnes</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm font-semibold text-neutral-300">
                  <span>Distance aller (km) :</span>
                  <span className="text-white font-bold">{avgDistance} km</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="200"
                  step="5"
                  value={avgDistance}
                  onChange={(e) => setAvgDistance(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            {/* Sources Footnote */}
            <div className="text-[11px] text-neutral-400 text-center leading-relaxed max-w-2xl mx-auto border-t border-neutral-800/80 pt-6">
              * Estimations basées sur la <strong>Base Empreinte ADEME</strong>, les données du <strong>Ministère de la Transition Écologique</strong> et l'étude d'occupation en covoiturage événementiel (<strong>Observatoire du Covoiturage</strong>).
            </div>
          </motion.div>
        </section>

        {/* ================= 6.5 PRICING SECTION ================= */}
        <PricingSection onAuthClick={() => setIsAuthOpen(true)} />

        {/* ================= 7. FAQ ACCORDION ================= */}
        <section className="py-20 bg-neutral-50">
          {/* Structured Data JSON-LD FAQPage for AI & Traditional SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqItems.map((item) => ({
                  "@type": "Question",
                  "name": item.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.answer,
                  },
                })),
              }),
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto px-4 sm:px-6"
          >
            <div className="text-center space-y-4 max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 font-heading">
                Tout ce que vous devez savoir
              </h2>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/50 transition-colors border-none bg-transparent"
                  >
                    <span className="text-sm sm:text-base font-semibold text-neutral-900 font-heading">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${openFaqIndex === index ? "rotate-180 text-neutral-900" : ""
                        }`}
                    />
                  </button>

                  <AnimatePresence>
                    {openFaqIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ================= BLOG PREVIEW SECTION ================= */}
        <section className="py-20  bg-neutral-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div className="space-y-2">
                <Badge variant="default">Blog & Guides</Badge>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-heading">
                  Conseils pour vos covoiturages événementiels
                </h2>
                <p className="text-sm text-neutral-600 max-w-xl">
                  Découvrez nos guides pratiques et conseils pour organiser la mobilité de vos événements sans commission.
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900 hover:text-neutral-600 transition-colors shrink-0"
              >
                Voir tous les articles
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 space-y-4 hover:border-neutral-300 transition-colors group" variant="white">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                    Guide Pilier
                  </span>
                  <span className="text-xs text-neutral-400">02 Août 2026</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 font-heading group-hover:text-neutral-600 transition-colors">
                  Covoiturage Événementiel Gratuit : La Solution Ultime pour Mariages, Festivals et Sports
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Découvrez comment organiser le covoiturage d'un événement privé ou public sans frais ni commission grâce à BilenGo.
                </p>
                <Link
                  href="/blog/covoiturage-evenementiel-gratuit"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 group-hover:underline pt-2"
                >
                  Lire le guide complet
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Card>

              <Card className="p-6 space-y-4 hover:border-neutral-300 transition-colors group" variant="white">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                    Organisateurs
                  </span>
                  <span className="text-xs text-neutral-400">02 Août 2026</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 font-heading group-hover:text-neutral-600 transition-colors">
                  Comment simplifier les trajets de vos invités sans créer de groupe WhatsApp ?
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Centralisez les départs des invités sur une carte unique et évitez les discussions illisibles.
                </p>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 group-hover:underline pt-2"
                >
                  Découvrir les astuces
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* ================= 8. CLOSING CONVERSION CTA ================= */}
        <section className="py-20 sm:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-14 text-center space-y-8 relative overflow-hidden shadow-2xl"
            >
              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-heading leading-tight">
                  Créez le covoiturage de votre événement en 2 minutes.
                </h2>

                <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                  Pas de frais, pas de téléchargement, pas de complications. Vos invités vous remercieront.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  {isAuthenticated ? (
                    <Link href="/dashboard" className="w-full sm:w-auto">
                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full sm:w-auto !bg-white !text-neutral-900 hover:!bg-neutral-100 shadow-xl cursor-pointer font-semibold border-none"
                        rightIcon={<ArrowRight className="w-4 h-4 text-neutral-900" />}
                      >
                        Mon Tableau de bord
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => setIsAuthOpen(true)}
                      className="w-full sm:w-auto !bg-white !text-neutral-900 hover:!bg-neutral-100 shadow-xl cursor-pointer font-semibold border-none"
                      leftIcon={<Plus className="w-4 h-4 text-neutral-900" />}
                    >
                      Créer un événement gratuit
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ================= 9. DARK SIGNATURE FOOTER ================= */}
      <footer className="bg-[#101010] text-neutral-400 py-12 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white text-[#101010] flex items-center justify-center font-bold text-sm font-heading">
              B
            </div>
            <span className="text-white font-bold tracking-tight text-base font-heading">
              BilenGo
            </span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-400">Covoiturage Événementiel Sans Friction</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog & Guides
            </Link>
          </div>

          <p className="text-neutral-500">
            © 2026 BilenGo. Tous droits réservés.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
