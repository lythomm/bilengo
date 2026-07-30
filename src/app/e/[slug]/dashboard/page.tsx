import { Suspense } from "react";
import { OrganizerDashboardClient } from "./OrganizerDashboardClient";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  params: Promise<{ slug: string }>;
}

export default function OrganizerDashboardPage({ params }: DashboardPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-neutral-500">
          <div className="animate-pulse text-xs">Chargement du tableau de bord...</div>
        </div>
      }
    >
      <OrganizerDashboardClient params={params} />
    </Suspense>
  );
}
