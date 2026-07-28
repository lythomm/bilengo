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

    // Enforce 1 carpool/booking per user per event
    const existingDriverCarpool = await ctx.db
      .query("carpools")
      .withIndex("by_event", (q) => q.eq("eventId", carpool.eventId))
      .filter((q) =>
        q.and(
          q.eq(q.field("driverPhone"), passengerPhone),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .first();

    if (existingDriverCarpool) {
      throw new Error(
        "Vous proposez déjà un covoiturage pour cet événement. Vous ne pouvez pas réserver un autre trajet."
      );
    }

    const eventCarpools = await ctx.db
      .query("carpools")
      .withIndex("by_event", (q) => q.eq("eventId", carpool.eventId))
      .collect();

    for (const c of eventCarpools) {
      const existingBooking = await ctx.db
        .query("bookings")
        .withIndex("by_carpool", (q) => q.eq("carpoolId", c._id))
        .filter((q) =>
          q.and(
            q.eq(q.field("passengerPhone"), passengerPhone),
            q.neq(q.field("status"), "cancelled")
          )
        )
        .first();

      if (existingBooking) {
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

    if (booking.passengerPhone !== args.passengerPhone.trim()) {
      throw new Error("Non autorisé à annuler cette réservation.");
    }

    if (booking.status === "confirmed") {
      const carpool = await ctx.db.get(booking.carpoolId);
      if (carpool) {
        await ctx.db.patch(carpool._id, {
          availableSeats: carpool.availableSeats + 1,
          status: "active",
        });
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
