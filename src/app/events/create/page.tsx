import { Suspense } from "react";
import { CreateEventClient } from "./CreateEventClient";

export const dynamic = "force-dynamic";

export default function CreateEventPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-neutral-500">
          <div className="animate-pulse text-xs">Chargement...</div>
        </div>
      }
    >
      <CreateEventClient />
    </Suspense>
  );
}
