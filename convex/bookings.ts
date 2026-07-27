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
