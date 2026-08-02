import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { assertPhoneNotRegistered } from "./authUtils";

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

    await assertPhoneNotRegistered(ctx, driverPhone);

    const cleanPhoneStr = driverPhone.replace(/[^0-9]/g, "");
    let participant = await ctx.db
      .query("event_participants")
      .withIndex("by_event_and_phone", (q) =>
        q.eq("eventId", args.eventId).eq("phone", cleanPhoneStr)
      )
      .first();

    if (!participant) {
      const participantId = await ctx.db.insert("event_participants", {
        eventId: args.eventId,
        name: driverName,
        phone: cleanPhoneStr,
        transportMode: "driver",
      });
      participant = (await ctx.db.get(participantId))!;
    } else {
      await ctx.db.patch(participant._id, {
        name: driverName,
        transportMode: "driver",
      });
    }

    // Enforce single carpool or booking per user per event
    const existingCarpool = await ctx.db
      .query("carpools")
      .withIndex("by_event_and_driver", (q) =>
        q.eq("eventId", args.eventId).eq("driverId", participant._id)
      )
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .first();

    if (existingCarpool) {
      throw new Error("Vous avez déjà proposé un covoiturage pour cet événement.");
    }

    const passengerBookings = await ctx.db
      .query("bookings")
      .withIndex("by_passenger", (q) => q.eq("passengerId", participant._id))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    for (const b of passengerBookings) {
      const c = await ctx.db.get(b.carpoolId);
      if (c && c.eventId === args.eventId) {
        throw new Error("Vous participez déjà à cet événement en tant que passager.");
      }
    }

    const totalSeats = Math.max(1, args.totalSeats);

    const carpoolId = await ctx.db.insert("carpools", {
      eventId: args.eventId,
      driverId: participant._id,
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

    const driver = await ctx.db.get(carpool.driverId);
    const cleanP = (p: string) => p.replace(/[^0-9]/g, "");
    if (!driver || !args.driverPhone || cleanP(driver.phone) !== cleanP(args.driverPhone)) {
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
    const cleanP = args.userPhone.trim().replace(/[^0-9]/g, "");
    if (!cleanP) return null;

    const participant = await ctx.db
      .query("event_participants")
      .withIndex("by_event_and_phone", (q) =>
        q.eq("eventId", args.eventId).eq("phone", cleanP)
      )
      .first();

    if (!participant) return null;

    // Check if driver
    const driverCarpool = await ctx.db
      .query("carpools")
      .withIndex("by_event_and_driver", (q) =>
        q.eq("eventId", args.eventId).eq("driverId", participant._id)
      )
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .first();

    if (driverCarpool) {
      const confirmedCount = (
        await ctx.db
          .query("bookings")
          .withIndex("by_carpool", (q) => q.eq("carpoolId", driverCarpool._id))
          .filter((q) => q.eq(q.field("status"), "confirmed"))
          .collect()
      ).length;

      return {
        role: "driver" as const,
        carpool: {
          _id: driverCarpool._id,
          driverName: participant.name,
          driverPhone: participant.phone,
          departureAddress: driverCarpool.departureAddress,
          departureTime: driverCarpool.departureTime,
          totalSeats: driverCarpool.totalSeats,
          availableSeats: Math.max(0, driverCarpool.totalSeats - confirmedCount),
          description: driverCarpool.description,
        },
      };
    }

    // Check if passenger
    const userBookings = await ctx.db
      .query("bookings")
      .withIndex("by_passenger", (q) => q.eq("passengerId", participant._id))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    for (const booking of userBookings) {
      const c = await ctx.db.get(booking.carpoolId);
      if (c && c.eventId === args.eventId) {
        const confirmedCount = (
          await ctx.db
            .query("bookings")
            .withIndex("by_carpool", (q) => q.eq("carpoolId", c._id))
            .filter((q) => q.eq(q.field("status"), "confirmed"))
            .collect()
        ).length;

        const driver = await ctx.db.get(c.driverId);

        return {
          role: "passenger" as const,
          booking: {
            _id: booking._id,
            passengerName: participant.name,
            passengerPhone: participant.phone,
            status: booking.status,
          },
          carpool: {
            _id: c._id,
            driverName: driver?.name || "Conducteur",
            driverPhone: driver?.phone || "",
            departureAddress: c.departureAddress,
            departureTime: c.departureTime,
            totalSeats: c.totalSeats,
            availableSeats: Math.max(0, c.totalSeats - confirmedCount),
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

    const result = [];
    for (const c of carpools) {
      const confirmedBookings = await ctx.db
        .query("bookings")
        .withIndex("by_carpool", (q) => q.eq("carpoolId", c._id))
        .filter((q) => q.eq(q.field("status"), "confirmed"))
        .collect();

      const driver = await ctx.db.get(c.driverId);

      const realAvailableSeats = Math.max(
        0,
        c.totalSeats - confirmedBookings.length
      );
      const realStatus =
        realAvailableSeats === 0
          ? "full"
          : c.status === "cancelled"
          ? "cancelled"
          : "active";

      result.push({
        _id: c._id,
        driverName: driver?.name || "Conducteur",
        departureAddress: c.departureAddress,
        departureLat: c.departureLat,
        departureLng: c.departureLng,
        departureTime: c.departureTime,
        totalSeats: c.totalSeats,
        availableSeats: realAvailableSeats,
        status: realStatus,
        description: c.description,
      });
    }

    return result;
  },
});
