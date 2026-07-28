import { Suspense } from "react";
import { EventClient } from "./EventClient";

export const dynamic = "force-dynamic";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default function EventPage({ params }: EventPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-neutral-500">
          <div className="animate-pulse text-xs">Chargement de l'événement...</div>
        </div>
      }
    >
      <EventClient params={params} />
    </Suspense>
  );
}
