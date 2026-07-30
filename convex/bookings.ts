import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function generateToken(): string {
  return (
    "val_" +
    Math.random().toString(36).substring(2, 12) +
    Math.random().toString(36).substring(2, 12)
  );
}

export const requestBooking = mutation({
  args: {
    carpoolId: v.id("carpools"),
    passengerName: v.string(),
    passengerPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const carpool = await ctx.db.get(args.carpoolId);
    if (!carpool) {
      throw new Error("Trajet non trouvé.");
    }

    if (carpool.status !== "active" || carpool.availableSeats <= 0) {
      throw new Error("Désolé, ce trajet n'a plus de places disponibles.");
    }

    const event = await ctx.db.get(carpool.eventId);
    if (!event) {
      throw new Error("Événement introuvable.");
    }

    const passengerName = args.passengerName.trim();
    const passengerPhone = args.passengerPhone.trim();
    if (!passengerName || !passengerPhone) {
      throw new Error("Le prénom et le numéro de téléphone sont obligatoires.");
    }

    // Enforce 1 carpool/booking per user per event (indexed O(1) lookups)
    const existingDriverCarpool = await ctx.db
      .query("carpools")
      .withIndex("by_event_and_driver", (q) =>
        q.eq("eventId", carpool.eventId).eq("driverPhone", passengerPhone)
      )
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .first();

    if (existingDriverCarpool) {
      throw new Error(
        "Vous proposez déjà un covoiturage pour cet événement. Vous ne pouvez pas réserver un autre trajet."
      );
    }

    const passengerBookings = await ctx.db
      .query("bookings")
      .withIndex("by_passenger_phone", (q) => q.eq("passengerPhone", passengerPhone))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    for (const b of passengerBookings) {
      const c = await ctx.db.get(b.carpoolId);
      if (c && c.eventId === carpool.eventId) {
        throw new Error(
          "Vous avez déjà réservé un trajet de covoiturage pour cet événement."
        );
      }
    }

    const validationToken = generateToken();

    const bookingId = await ctx.db.insert("bookings", {
      carpoolId: args.carpoolId,
      passengerName,
      passengerPhone,
      status: "pending",
      validationToken,
    });

    // Insert participant record with autonomous transportMode while booking is pending
    const cleanPhoneStr = passengerPhone.replace(/[^0-9]/g, "");
    const existingParticipant = await ctx.db
      .query("event_participants")
      .withIndex("by_event_and_phone", (q) =>
        q.eq("eventId", carpool.eventId).eq("phone", cleanPhoneStr)
      )
      .first();

    if (!existingParticipant) {
      await ctx.db.insert("event_participants", {
        eventId: carpool.eventId,
        name: passengerName,
        phone: cleanPhoneStr,
        transportMode: "autonomous",
      });
    }

    return {
      bookingId,
      validationToken,
      driverPhone: carpool.driverPhone,
      driverName: carpool.driverName,
      departureAddress: carpool.departureAddress,
      eventTitle: event.title,
    };
  },
});

export const confirmBooking = mutation({
  args: { validationToken: v.string() },
  handler: async (ctx, args) => {
    const token = args.validationToken.trim();
    if (!token) {
      throw new Error("Token de validation manquant.");
    }

    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_validation_token", (q) => q.eq("validationToken", token))
      .first();

    if (!booking) {
      throw new Error("Réservation introuvable ou lien invalide.");
    }

    if (booking.status === "confirmed") {
      return {
        alreadyConfirmed: true,
        passengerName: booking.passengerName,
        passengerPhone: booking.passengerPhone,
      };
    }

    if (booking.status === "cancelled") {
      throw new Error("Cette demande de réservation a été annulée.");
    }

    const carpool = await ctx.db.get(booking.carpoolId);
    if (!carpool) {
      throw new Error("Le trajet associé n'existe plus.");
    }

    if (carpool.availableSeats <= 0) {
      throw new Error("Impossible de valider : le trajet est désormais complet.");
    }

    // Atomic transaction
    const newAvailableSeats = carpool.availableSeats - 1;
    const newStatus = newAvailableSeats === 0 ? "full" : "active";

    await ctx.db.patch(carpool._id, {
      availableSeats: newAvailableSeats,
      status: newStatus,
    });

    await ctx.db.patch(booking._id, {
      status: "confirmed",
    });

    // Pass transportMode to passenger upon driver confirmation
    const cleanPhoneStr = booking.passengerPhone.replace(/[^0-9]/g, "");
    const participant = await ctx.db
      .query("event_participants")
      .withIndex("by_event_and_phone", (q) =>
        q.eq("eventId", carpool.eventId).eq("phone", cleanPhoneStr)
      )
      .first();

    if (participant && participant.transportMode !== "driver") {
      await ctx.db.patch(participant._id, {
        transportMode: "passenger",
      });
    }

    const event = await ctx.db.get(carpool.eventId);

    return {
      alreadyConfirmed: false,
      success: true,
      passengerName: booking.passengerName,
      passengerPhone: booking.passengerPhone,
      departureAddress: carpool.departureAddress,
      eventTitle: event?.title || "l'événement",
      eventSlug: event?.slug,
      availableSeatsRemaining: newAvailableSeats,
    };
  },
});

export const cancelBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    passengerPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Réservation introuvable.");
    }

    const cleanP = (p: string) => p.replace(/[^0-9]/g, "");
    if (cleanP(booking.passengerPhone) !== cleanP(args.passengerPhone)) {
      throw new Error("Non autorisé à annuler cette réservation.");
    }

    if (booking.status === "confirmed") {
      const carpool = await ctx.db.get(booking.carpoolId);
      if (carpool) {
        await ctx.db.patch(carpool._id, {
          availableSeats: carpool.availableSeats + 1,
          status: "active",
        });

        // Reset participant transportMode back to autonomous
        const cleanPhoneStr = booking.passengerPhone.replace(/[^0-9]/g, "");
        const participant = await ctx.db
          .query("event_participants")
          .withIndex("by_event_and_phone", (q) =>
            q.eq("eventId", carpool.eventId).eq("phone", cleanPhoneStr)
          )
          .first();

        if (participant && participant.transportMode === "passenger") {
          await ctx.db.patch(participant._id, {
            transportMode: "autonomous",
          });
        }
      }
    }

    await ctx.db.patch(booking._id, {
      status: "cancelled",
    });

    return true;
  },
});

export const getBookingByToken = query({
  args: { validationToken: v.string() },
  handler: async (ctx, args) => {
    const token = args.validationToken.trim();
    if (!token) return null;

    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_validation_token", (q) => q.eq("validationToken", token))
      .first();

    if (!booking) return null;

    const carpool = await ctx.db.get(booking.carpoolId);
    if (!carpool) return null;

    const event = await ctx.db.get(carpool.eventId);

    return {
      bookingId: booking._id,
      passengerName: booking.passengerName,
      passengerPhone: booking.passengerPhone,
      status: booking.status,
      carpoolId: carpool._id,
      driverName: carpool.driverName,
      departureAddress: carpool.departureAddress,
      departureTime: carpool.departureTime,
      availableSeats: carpool.availableSeats,
      eventTitle: event?.title || "Événement",
      eventSlug: event?.slug,
    };
  },
});

export const getCarpoolPassengers = query({
  args: { carpoolId: v.id("carpools") },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_carpool", (q) => q.eq("carpoolId", args.carpoolId))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();

    return bookings.map((b) => ({
      _id: b._id,
      passengerName: b.passengerName,
      passengerPhone: b.passengerPhone,
      status: b.status,
    }));
  },
});
