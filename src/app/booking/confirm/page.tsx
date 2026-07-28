import { Suspense } from "react";
import { ConfirmBookingClient } from "./ConfirmBookingClient";

export const dynamic = "force-dynamic";

export default function ConfirmBookingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-neutral-900 p-4">
      <Suspense
        fallback={
          <div className="text-neutral-400 animate-pulse text-xs">
            Chargement...
          </div>
        }
      >
        <ConfirmBookingClient />
      </Suspense>
    </div>
  );
}
