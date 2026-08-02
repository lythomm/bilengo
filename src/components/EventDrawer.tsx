"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MainEventDrawer, CarpoolItem } from "./MainEventDrawer";
import { ProposeFinalizeDrawer } from "./ProposeFinalizeDrawer";
import { CarpoolDetailsDrawer } from "./CarpoolDetailsDrawer";
import { getParticipantSession } from "@/lib/session";

export type { CarpoolItem };

interface EventDrawerProps {
  eventId: Id<"events">;
  eventTitle: string;
  destinationAddress?: string;
  destinationLat?: number;
  destinationLng?: number;
  carpools: CarpoolItem[];
  selectedCarpool: CarpoolItem | null;
  onSelectCarpool: (carpool: CarpoolItem | null) => void;
  onOpenBooking: (carpool: CarpoolItem) => void;
  onStartPickLocation?: () => void;
  prefilledAddress?: { label: string; lat: number; lng: number } | null;
  onCloseFinalize?: () => void;
}

function cleanPhone(p?: string) {
  if (!p) return "";
  return p.replace(/[^0-9]/g, "");
}

export function EventDrawer({
  eventId,
  eventTitle,
  destinationAddress,
  destinationLat,
  destinationLng,
  carpools,
  selectedCarpool,
  onSelectCarpool,
  onOpenBooking,
  onStartPickLocation,
  prefilledAddress,
  onCloseFinalize,
}: EventDrawerProps) {
  const session = getParticipantSession();
  const userPhone = cleanPhone(
    session?.phone ||
      (typeof window !== "undefined"
        ? localStorage.getItem("bilengo_driver_phone") ||
          localStorage.getItem("bilengo_phone") ||
          ""
        : "")
  );

  const userRole = useQuery(
    api.carpools.getUserEventRole,
    eventId && userPhone ? { eventId, userPhone } : "skip"
  );

  const isDriver = userRole?.role === "driver";
  const isPassenger = userRole?.role === "passenger";

  return (
    <>
      {/* Main Drawer (Hidden when viewing carpool details or finalizing carpool) */}
      {!selectedCarpool && !prefilledAddress && (
        <MainEventDrawer
          eventId={eventId}
          eventTitle={eventTitle}
          destinationAddress={destinationAddress}
          destinationLat={destinationLat}
          destinationLng={destinationLng}
          carpools={carpools}
          selectedCarpool={selectedCarpool}
          onSelectCarpool={onSelectCarpool}
          onOpenBooking={onOpenBooking}
          onStartPickLocation={onStartPickLocation}
        />
      )}

      {/* Standalone Dedicated Carpool Details Drawer */}
      {selectedCarpool && (
        <CarpoolDetailsDrawer
          carpool={selectedCarpool}
          carpools={carpools}
          isOpen={!!selectedCarpool}
          onClose={() => onSelectCarpool(null)}
          onOpenBooking={onOpenBooking}
          isDriver={
            (userRole?.role === "driver" && userRole?.carpool?._id === selectedCarpool._id) ||
            !!(userPhone && selectedCarpool.driverPhone && cleanPhone(selectedCarpool.driverPhone) === userPhone)
          }
          isPassenger={
            userRole?.role === "passenger" && userRole?.carpool?._id === selectedCarpool._id
          }
          bookingStatus={
            userRole?.role === "passenger" && userRole?.carpool?._id === selectedCarpool._id
              ? userRole.booking?.status
              : undefined
          }
          bookingId={
            userRole?.role === "passenger" && userRole?.carpool?._id === selectedCarpool._id
              ? (userRole.booking?._id as Id<"bookings">)
              : undefined
          }
        />
      )}

      {/* Finalize Creation Drawer */}
      <ProposeFinalizeDrawer
        eventId={eventId}
        prefilledAddress={prefilledAddress || null}
        isOpen={!!prefilledAddress}
        onClose={() => {
          if (onCloseFinalize) onCloseFinalize();
        }}
        onSuccess={() => {
          if (onCloseFinalize) onCloseFinalize();
        }}
      />
    </>
  );
}
