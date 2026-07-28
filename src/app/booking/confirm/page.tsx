"use client";

import { useState, useEffect, Suspense } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ConfirmBookingContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const confirmBooking = useMutation(api.bookings.confirmBooking);
  const bookingInfo = useQuery(
    api.bookings.getBookingByToken,
    token ? { validationToken: token } : "skip"
  );

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [resultData, setResultData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Token de validation manquant dans l'URL.");
      return;
    }

    const runConfirm = async () => {
      setStatus("loading");
      try {
        const res = await confirmBooking({ validationToken: token });
        setResultData(res);
        setStatus("success");
      } catch (err: any) {
        console.error(err);
        setStatus("error");
        setErrorMessage(
          err.message || "Impossible de valider cette réservation."
        );
      }
    };

    runConfirm();
  }, [token]);

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base">
          B
        </div>
        <span className="font-bold text-white tracking-tight text-lg">
          Bilengo
        </span>
      </Link>

      {status === "loading" && (
        <div className="py-8 space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-300 font-medium text-sm">
            Validation de la réservation en cours...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-3xl flex items-center justify-center mx-auto">
            ✕
          </div>
          <h2 className="text-xl font-bold text-white">Validation échouée</h2>
          <p className="text-slate-400 text-sm">{errorMessage}</p>
          {bookingInfo?.eventSlug && (
            <Link
              href={`/e/${bookingInfo.eventSlug}`}
              className="inline-block px-5 py-2.5 rounded-xl bg-slate-800 text-white font-medium text-sm hover:bg-slate-700 transition-all mt-2"
            >
              Voir l'événement
            </Link>
          )}
        </div>
      )}

      {status === "success" && resultData && (
        <div className="py-4 space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-4xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            ✓
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {resultData.alreadyConfirmed
                ? "Déjà confirmée !"
                : "Place confirmée !"}
            </h2>
            <p className="text-slate-300 text-sm">
              Vous avez accepté la place de{" "}
              <span className="font-bold text-amber-400">
                {resultData.passengerName}
              </span>{" "}
              pour <span className="font-semibold text-white">{resultData.eventTitle}</span>.
            </p>
          </div>

          {/* Passenger Contact Card */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left space-y-3">
            <span className="text-xs text-slate-400 font-medium">
              Coordonnées du passager :
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-base">
                  {resultData.passengerName}
                </p>
                <p className="text-slate-400 text-xs font-mono">
                  {resultData.passengerPhone}
                </p>
              </div>
              <a
                href={`tel:${resultData.passengerPhone}`}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
              >
                📞 Appeler
              </a>
            </div>
          </div>

          {resultData.availableSeatsRemaining !== undefined && (
            <p className="text-xs text-slate-400">
              Il vous reste{" "}
              <span className="font-bold text-amber-400">
                {resultData.availableSeatsRemaining} place(s) libre(s)
              </span>{" "}
              sur ce trajet.
            </p>
          )}

          {resultData.eventSlug && (
            <Link
              href={`/e/${resultData.eventSlug}`}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm transition-all block text-center shadow-lg shadow-amber-500/20"
            >
              Accéder à la page de l'événement
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConfirmBookingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4 selection:bg-amber-500 selection:text-slate-950">
      <Suspense
        fallback={
          <div className="text-slate-400 animate-pulse text-sm">
            Chargement...
          </div>
        }
      >
        <ConfirmBookingContent />
      </Suspense>
    </div>
  );
}
