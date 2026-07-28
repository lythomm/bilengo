import { Suspense } from "react";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-neutral-500">
          <div className="animate-pulse text-xs">Chargement du tableau de bord...</div>
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  );
}
