"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatConvexError } from "@/lib/errors";

export function ConfirmBookingClient() {
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
    let ignore = false;

    if (!token) {
      setStatus("error");
      setErrorMessage("Token de validation manquant dans l'URL.");
      return;
    }

    const runConfirm = async () => {
      setStatus("loading");
      try {
        const res = await confirmBooking({ validationToken: token });
        if (!ignore) {
          setResultData(res);
          setStatus("success");
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error(err);
          setStatus("error");
          setErrorMessage(
            formatConvexError(err, "Impossible de valider cette réservation.")
          );
        }
      }
    };

    runConfirm();

    return () => {
      ignore = true;
    };
  }, [token, confirmBooking]);

  return (
    <Card variant="white" className="w-full max-w-md p-6 sm:p-8 shadow-xl text-center space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white font-bold flex items-center justify-center text-base">
          B
        </div>
        <span className="font-bold text-neutral-900 tracking-tight text-lg font-heading">
          BilenGo
        </span>
      </Link>

      {status === "loading" && (
        <div className="py-8 space-y-4">
          <div className="w-10 h-10 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto" />
          <p className="text-neutral-500 font-medium text-sm">
            Validation de la réservation en cours...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="py-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-700 text-2xl font-bold flex items-center justify-center mx-auto">
            ✕
          </div>
          <h2 className="text-lg font-bold text-neutral-900 font-heading">Validation échouée</h2>
          <p className="text-neutral-500 text-xs">{errorMessage}</p>
          {bookingInfo?.eventSlug && (
            <Link href={`/e/${bookingInfo.eventSlug}`}>
              <Button variant="secondary" size="sm" className="mt-2">
                Voir l'événement
              </Button>
            </Link>
          )}
        </div>
      )}

      {status === "success" && resultData && (
        <div className="py-4 space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 text-3xl font-bold flex items-center justify-center mx-auto">
            ✓
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight font-heading">
              {resultData.alreadyConfirmed
                ? "Déjà confirmée !"
                : "Place confirmée !"}
            </h2>
            <p className="text-neutral-600 text-xs">
              Tu as accepté la réservation de{" "}
              <span className="font-semibold text-neutral-900">
                {resultData.passengerName}
              </span>{" "}
              pour <span className="font-semibold text-neutral-900">{resultData.eventTitle}</span>.
            </p>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-left space-y-2 text-xs">
            <span className="text-neutral-400 font-medium">Coordonnées du passager :</span>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-900 text-sm">
                  {resultData.passengerName}
                </p>
                <p className="text-neutral-500 font-mono">
                  {resultData.passengerPhone}
                </p>
              </div>
              <a
                href={`tel:${resultData.passengerPhone}`}
                className="cal-button-secondary text-xs text-emerald-700 hover:bg-emerald-50"
              >
                Appeler
              </a>
            </div>
          </div>

          {resultData.availableSeatsRemaining !== undefined && (
            <div className="text-xs text-neutral-500">
              Places restantes sur ce trajet :{" "}
              <Badge variant="default">
                {resultData.availableSeatsRemaining} place(s)
              </Badge>
            </div>
          )}

          {resultData.eventSlug && (
            <Link href={`/e/${resultData.eventSlug}`} className="block">
              <Button variant="primary" size="md" className="w-full">
                Accéder à l'événement
              </Button>
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}
