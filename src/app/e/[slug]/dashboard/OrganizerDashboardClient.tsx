"use client";

import { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrganizerEventView } from "@/components/OrganizerEventView";
import { Button } from "@/components/ui/Button";

interface OrganizerDashboardClientProps {
  params: Promise<{ slug: string }>;
}

export function OrganizerDashboardClient({ params }: OrganizerDashboardClientProps) {
  const { slug } = use(params);
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const event = useQuery(api.events.getEventBySlug, { slug });
  const organizerData = useQuery(
    api.events.getOrganizerEventData,
    event ? { eventId: event._id } : "skip"
  );

  const handleCopyLink = () => {
    const url = `${window.location.origin}/e/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (event === undefined || organizerData === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-neutral-500">
        <div className="animate-pulse text-sm font-medium">Chargement du tableau de bord...</div>
      </div>
    );
  }

  if (event === null || !organizerData || !organizerData.isOrganizer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-neutral-900 p-4 text-center">
        <h1 className="text-2xl font-bold mb-2 font-heading">Accès non autorisé</h1>
        <p className="text-neutral-500 text-sm mb-6">
          Vous n'êtes pas l'organisateur de cet événement ou l'événement n'existe pas.
        </p>
        <Link href={`/e/${slug}`}>
          <Button variant="primary" size="md">
            Voir la carte de l'événement
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <OrganizerEventView
      organizerData={organizerData as any}
      onSwitchToMap={() => router.push(`/e/${slug}`)}
      onCopyLink={handleCopyLink}
      copied={copied}
    />
  );
}
