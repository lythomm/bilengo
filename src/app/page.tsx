import { Suspense } from "react";
import { HomeClient } from "./HomeClient";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-neutral-500">
          <div className="animate-pulse text-xs">Chargement...</div>
        </div>
      }
    >
      <HomeClient />
    </Suspense>
  );
}
