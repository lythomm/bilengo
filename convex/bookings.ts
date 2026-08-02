import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { assertPhoneNotRegistered } from "./authUtils";

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

    const { availableSeats, status: currentStatus } = await recalculateCarpoolSeats(ctx, carpool._id);

    if (currentStatus === "cancelled" || availableSeats <= 0) {
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

    await assertPhoneNotRegistered(ctx, passengerPhone);

    const cleanPhoneStr = passengerPhone.replace(/[^0-9]/g, "");
    let participant = await ctx.db
      .query("event_participants")
      .withIndex("by_event_and_phone", (q) =>
        q.eq("eventId", carpool.eventId).eq("phone", cleanPhoneStr)
      )
      .first();

    if (!participant) {
      const participantId = await ctx.db.insert("event_participants", {
        eventId: carpool.eventId,
        name: passengerName,
        phone: cleanPhoneStr,
        transportMode: "autonomous",
      });
      participant = (await ctx.db.get(participantId))!;
    }

    // Enforce 1 carpool/booking per user per event
    const existingDriverCarpool = await ctx.db
      .query("carpools")
      .withIndex("by_event_and_driver", (q) =>
        q.eq("eventId", carpool.eventId).eq("driverId", participant._id)
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
      .withIndex("by_passenger", (q) => q.eq("passengerId", participant._id))
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
      passengerId: participant._id,
      status: "pending",
      validationToken,
    });

    const driver = await ctx.db.get(carpool.driverId);

    return {
      bookingId,
      validationToken,
      driverPhone: driver?.phone || "",
      driverName: driver?.name || "Conducteur",
      departureAddress: carpool.departureAddress,
      eventTitle: event.title,
      eventSlug: event.slug,
    };
  },
});

export const confirmBooking = mutation({
  args: {
    validationToken: v.string(),
    driverPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const token = args.validationToken.trim();
    if (!token) {
      throw new ConvexError("Token de validation manquant.");
    }

    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_validation_token", (q) => q.eq("validationToken", token))
      .first();

    if (!booking) {
      throw new ConvexError("Réservation introuvable ou lien invalide.");
    }

    const carpool = await ctx.db.get(booking.carpoolId);
    if (!carpool) {
      throw new ConvexError("Le trajet associé n'existe plus.");
    }

    const driver = await ctx.db.get(carpool.driverId);
    const passenger = await ctx.db.get(booking.passengerId);

    const cleanP = (p: string) => p.replace(/[^0-9]/g, "");
    const providedPhone = cleanP(args.driverPhone);
    const expectedDriverPhone = driver ? cleanP(driver.phone) : "";

    if (!providedPhone || providedPhone !== expectedDriverPhone) {
      throw new ConvexError(
        `Action non autorisée : seul le conducteur de ce trajet (${driver?.name || "Conducteur"}) peut valider la réservation.`
      );
    }

    if (booking.status === "confirmed") {
      return {
        alreadyConfirmed: true,
        passengerName: passenger?.name || "",
        passengerPhone: passenger?.phone || "",
      };
    }

    if (booking.status === "cancelled") {
      throw new ConvexError("Cette demande de réservation a été annulée.");
    }

    if (carpool.availableSeats <= 0) {
      throw new ConvexError("Impossible de valider : le trajet est désormais complet.");
    }

    const newAvailableSeats = carpool.availableSeats - 1;
    const newStatus = newAvailableSeats === 0 ? "full" : "active";

    await ctx.db.patch(carpool._id, {
      availableSeats: newAvailableSeats,
      status: newStatus,
    });

    await ctx.db.patch(booking._id, {
      status: "confirmed",
    });

    if (passenger && passenger.transportMode !== "driver") {
      await ctx.db.patch(passenger._id, {
        transportMode: "passenger",
      });
    }

    const event = await ctx.db.get(carpool.eventId);

    return {
      alreadyConfirmed: false,
      success: true,
      passengerName: passenger?.name || "",
      passengerPhone: passenger?.phone || "",
      departureAddress: carpool.departureAddress,
      eventTitle: event?.title || "l'événement",
      eventSlug: event?.slug,
    };
  },
});

export async function recalculateCarpoolSeats(
  ctx: { db: any },
  carpoolId: any
) {
  const carpool = await ctx.db.get(carpoolId);
  if (!carpool) return { availableSeats: 0, status: "cancelled" };

  const allBookings = await ctx.db
    .query("bookings")
    .withIndex("by_carpool", (q: any) => q.eq("carpoolId", carpoolId))
    .collect();

  let confirmedCount = 0;
  for (const b of allBookings) {
    const latestB = await ctx.db.get(b._id);
    if (latestB && latestB.status === "confirmed") {
      confirmedCount++;
    }
  }

  const newAvailableSeats = Math.max(
    0,
    carpool.totalSeats - confirmedCount
  );
  const newStatus = newAvailableSeats === 0 ? "full" : "active";

  await ctx.db.patch(carpoolId, {
    availableSeats: newAvailableSeats,
    status: newStatus,
  });

  return { availableSeats: newAvailableSeats, status: newStatus };
}

export const syncCarpoolSeats = mutation({
  args: { carpoolId: v.id("carpools") },
  handler: async (ctx, args) => {
    return await recalculateCarpoolSeats(ctx, args.carpoolId);
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

    const passenger = await ctx.db.get(booking.passengerId);
    const cleanP = (p: string) => p.replace(/[^0-9]/g, "");
    if (!passenger || cleanP(passenger.phone) !== cleanP(args.passengerPhone)) {
      throw new Error("Non autorisé à annuler cette réservation.");
    }

    const carpool = await ctx.db.get(booking.carpoolId);

    await ctx.db.patch(booking._id, {
      status: "cancelled",
    });

    if (carpool) {
      if (booking.status === "confirmed" && passenger.transportMode === "passenger") {
        await ctx.db.patch(passenger._id, {
          transportMode: "autonomous",
        });
      }

      await recalculateCarpoolSeats(ctx, carpool._id);
    }

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

    const passenger = await ctx.db.get(booking.passengerId);
    const driver = await ctx.db.get(carpool.driverId);
    const event = await ctx.db.get(carpool.eventId);

    return {
      bookingId: booking._id,
      passengerName: passenger?.name || "",
      passengerPhone: passenger?.phone || "",
      status: booking.status,
      carpoolId: carpool._id,
      driverName: driver?.name || "",
      driverPhone: driver?.phone || "",
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

    const result = [];
    for (const b of bookings) {
      const passenger = await ctx.db.get(b.passengerId);
      result.push({
        _id: b._id,
        passengerName: passenger?.name || "Passager",
        status: b.status,
      });
    }

    return result;
  },
});

export const getPendingBookingsForCarpool = query({
  args: { carpoolId: v.id("carpools") },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_carpool", (q) => q.eq("carpoolId", args.carpoolId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const result = [];
    for (const b of bookings) {
      const passenger = await ctx.db.get(b.passengerId);
      result.push({
        _id: b._id,
        passengerName: passenger?.name || "Passager",
        status: b.status,
      });
    }

    return result;
  },
});

export const getAllBookingsForCarpool = query({
  args: {
    carpoolId: v.id("carpools"),
    driverPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const carpool = await ctx.db.get(args.carpoolId);
    if (!carpool) return [];

    const driver = await ctx.db.get(carpool.driverId);
    const userId = await getAuthUserId(ctx);
    let isAuthorized = false;

    if (userId) {
      const event = await ctx.db.get(carpool.eventId);
      if (event && event.organizerId === userId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && args.driverPhone && driver) {
      const cleanP = (p: string) => p.replace(/[^0-9]/g, "");
      if (cleanP(args.driverPhone) === cleanP(driver.phone)) {
        isAuthorized = true;
      }
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_carpool", (q) => q.eq("carpoolId", args.carpoolId))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    const result = [];
    for (const b of bookings) {
      const passenger = await ctx.db.get(b.passengerId);
      result.push({
        _id: b._id,
        passengerName: passenger?.name || "Passager",
        passengerPhone: isAuthorized ? passenger?.phone : undefined,
        status: b.status,
      });
    }

    return result;
  },
});

export const respondToBookingByDriver = mutation({
  args: {
    bookingId: v.id("bookings"),
    driverPhone: v.string(),
    action: v.union(v.literal("accept"), v.literal("reject")),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new ConvexError("Réservation introuvable.");
    }

    const carpool = await ctx.db.get(booking.carpoolId);
    if (!carpool) {
      throw new ConvexError("Le trajet associé n'existe plus.");
    }

    const driver = await ctx.db.get(carpool.driverId);
    const cleanP = (p: string) => p.replace(/[^0-9]/g, "");
    const providedPhone = cleanP(args.driverPhone);
    const expectedDriverPhone = driver ? cleanP(driver.phone) : "";

    if (!providedPhone || providedPhone !== expectedDriverPhone) {
      throw new ConvexError(
        `Action non autorisée : seul le conducteur de ce trajet (${driver?.name || "Conducteur"}) peut répondre à la demande.`
      );
    }

    if (booking.status !== "pending") {
      throw new ConvexError("Cette demande a déjà été traitée ou annulée.");
    }

    const passenger = await ctx.db.get(booking.passengerId);

    if (args.action === "accept") {
      const { availableSeats: currentAvailable } = await recalculateCarpoolSeats(ctx, carpool._id);

      if (currentAvailable <= 0) {
        throw new ConvexError("Impossible d'accepter : le trajet est complet.");
      }

      await ctx.db.patch(booking._id, {
        status: "confirmed",
      });

      if (passenger && passenger.transportMode !== "driver") {
        await ctx.db.patch(passenger._id, {
          transportMode: "passenger",
        });
      }
    } else {
      await ctx.db.patch(booking._id, {
        status: "cancelled",
      });
    }

    await recalculateCarpoolSeats(ctx, carpool._id);

    return true;
  },
});
