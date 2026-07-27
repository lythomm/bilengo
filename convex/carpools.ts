import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    });

    return carpoolId;
  },
});

export const getCarpoolsByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const carpools = await ctx.db
      .query("carpools")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
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
    }));
  },
});
