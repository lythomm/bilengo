import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createCarpool = mutation({
  args: {
    eventId: v.id("events"),
    driverName: v.string(),
    driverPhone: v.string(),
    departureAddress: v.string(),
    departureLat: v.optional(v.number()),
    departureLng: v.optional(v.number()),
    departureTime: v.string(),
    totalSeats: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Événement non trouvé.");
    }

    const driverName = args.driverName.trim();
    const driverPhone = args.driverPhone.trim();
    const departureAddress = args.departureAddress.trim();

    if (!driverName || !driverPhone || !departureAddress) {
      throw new Error("Toutes les informations du conducteur sont obligatoires.");
    }

    // Enforce single carpool or booking per user per event
    const existingCarpool = await ctx.db
      .query("carpools")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) =>
        q.and(
          q.eq(q.field("driverPhone"), driverPhone),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .first();

    if (existingCarpool) {
      throw new Error("Vous avez déjà proposé un covoiturage pour cet événement.");
    }

    const eventCarpools = await ctx.db
      .query("carpools")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const c of eventCarpools) {
      const existingBooking = await ctx.db
        .query("bookings")
        .withIndex("by_carpool", (q) => q.eq("carpoolId", c._id))
        .filter((q) =>
          q.and(
            q.eq(q.field("passengerPhone"), driverPhone),
            q.neq(q.field("status"), "cancelled")
          )
        )
        .first();

      if (existingBooking) {
        throw new Error(
          "Vous participez déjà à cet événement en tant que passager."
        );
      }
    }

    const totalSeats = Math.max(1, args.totalSeats);

    const carpoolId = await ctx.db.insert("carpools", {
      eventId: args.eventId,
      driverName,
      driverPhone,
      departureAddress,
      departureLat: args.departureLat,
      departureLng: args.departureLng,
      departureTime: args.departureTime,
      totalSeats,
      availableSeats: totalSeats,
      status: "active",
      description: args.description?.trim(),
    });

    return carpoolId;
  },
});

export const cancelCarpool = mutation({
  args: {
    carpoolId: v.id("carpools"),
    driverPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const carpool = await ctx.db.get(args.carpoolId);
    if (!carpool) {
      throw new Error("Trajet introuvable.");
    }

    const cleanP = (p: string) => p.replace(/[^0-9]/g, "");
    if (!args.driverPhone || cleanP(carpool.driverPhone) !== cleanP(args.driverPhone)) {
      throw new Error("Non autorisé à annuler ce trajet.");
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_carpool", (q) => q.eq("carpoolId", args.carpoolId))
      .collect();

    for (const b of bookings) {
      await ctx.db.delete(b._id);
    }

    await ctx.db.delete(args.carpoolId);

    return true;
  },
});

export const deleteCarpoolByOrganizer = mutation({
  args: {
    carpoolId: v.id("carpools"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Non authentifié.");
    }

    const carpool = await ctx.db.get(args.carpoolId);
    if (!carpool) {
      throw new Error("Trajet introuvable.");
    }

    const event = await ctx.db.get(carpool.eventId);
    if (!event || event.organizerId !== userId) {
      throw new Error("Action non autorisée.");
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_carpool", (q) => q.eq("carpoolId", args.carpoolId))
      .collect();

    for (const b of bookings) {
      await ctx.db.delete(b._id);
    }

    await ctx.db.delete(args.carpoolId);
    return true;
  },
});

export const getUserEventRole = query({
  args: { eventId: v.id("events"), userPhone: v.string() },
  handler: async (ctx, args) => {
    const cleanP = args.userPhone.trim();
    if (!cleanP) return null;

    // Check if driver
    const driverCarpool = await ctx.db
      .query("carpools")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) =>
        q.and(
          q.eq(q.field("driverPhone"), cleanP),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .first();

    if (driverCarpool) {
      return {
        role: "driver" as const,
        carpool: {
          _id: driverCarpool._id,
          driverName: driverCarpool.driverName,
          driverPhone: driverCarpool.driverPhone,
          departureAddress: driverCarpool.departureAddress,
          departureTime: driverCarpool.departureTime,
          totalSeats: driverCarpool.totalSeats,
          availableSeats: driverCarpool.availableSeats,
          description: driverCarpool.description,
        },
      };
    }

    // Check if passenger
    const eventCarpools = await ctx.db
      .query("carpools")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const c of eventCarpools) {
      const booking = await ctx.db
        .query("bookings")
        .withIndex("by_carpool", (q) => q.eq("carpoolId", c._id))
        .filter((q) =>
          q.and(
            q.eq(q.field("passengerPhone"), cleanP),
            q.neq(q.field("status"), "cancelled")
          )
        )
        .first();

      if (booking) {
        return {
          role: "passenger" as const,
          booking: {
            _id: booking._id,
            passengerName: booking.passengerName,
            passengerPhone: booking.passengerPhone,
            status: booking.status,
          },
          carpool: {
            _id: c._id,
            driverName: c.driverName,
            driverPhone: c.driverPhone,
            departureAddress: c.departureAddress,
            departureTime: c.departureTime,
            totalSeats: c.totalSeats,
            availableSeats: c.availableSeats,
            description: c.description,
          },
        };
      }
    }

    return null;
  },
});

export const getCarpoolsByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const carpools = await ctx.db
      .query("carpools")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .order("desc")
      .collect();

    return carpools.map((c) => ({
      _id: c._id,
      driverName: c.driverName,
      driverPhone: c.driverPhone,
      departureAddress: c.departureAddress,
      departureLat: c.departureLat,
      departureLng: c.departureLng,
      departureTime: c.departureTime,
      totalSeats: c.totalSeats,
      availableSeats: c.availableSeats,
      status: c.status,
      description: c.description,
    }));
  },
});



