import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

function slugify(text: string): string {
  const clean = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${clean || "event"}-${randomSuffix}`;
}

export const createEvent = mutation({
  args: {
    title: v.string(),
    destinationAddress: v.string(),
    destinationLat: v.optional(v.number()),
    destinationLng: v.optional(v.number()),
    eventDate: v.string(),
    maxParticipants: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Non autorisé. Vous devez être connecté.");
    }

    // Sanitation & validation
    const title = args.title.trim();
    const destinationAddress = args.destinationAddress.trim();
    if (!title || !destinationAddress) {
      throw new Error("Le titre et l'adresse sont obligatoires.");
    }

    const maxParticipants = Math.max(1, args.maxParticipants);

    const slug = slugify(title);

    const eventId = await ctx.db.insert("events", {
      organizerId: userId,
      title,
      destinationAddress,
      destinationLat: args.destinationLat,
      destinationLng: args.destinationLng,
      eventDate: args.eventDate,
      maxParticipants,
      slug,
    });

    return { eventId, slug };
  },
});

export const getMyEvents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("events")
      .withIndex("by_organizer", (q) => q.eq("organizerId", userId))
      .order("desc")
      .collect();
  },
});

export const getAllEvents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  },
});

export const getEventBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const cleanSlug = args.slug.trim();
    if (!cleanSlug) return null;

    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", cleanSlug))
      .first();

    if (!event) return null;

    return {
      _id: event._id,
      title: event.title,
      destinationAddress: event.destinationAddress,
      destinationLat: event.destinationLat,
      destinationLng: event.destinationLng,
      eventDate: event.eventDate,
      maxParticipants: event.maxParticipants,
      slug: event.slug,
      organizerId: event.organizerId,
    };
  },
});

export const getOrganizerEventData = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const event = await ctx.db.get(args.eventId);
    if (!event || event.organizerId !== userId) {
      return null;
    }

    const carpools = await ctx.db
      .query("carpools")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const carpoolDetails = [];
    const guestsMap = new Map<
      string,
      {
        name: string;
        phone: string;
        proposesCarpool: boolean;
        isInCarpool: boolean;
        details: string[];
      }
    >();

    for (const c of carpools) {
      const bookings = await ctx.db
        .query("bookings")
        .withIndex("by_carpool", (q) => q.eq("carpoolId", c._id))
        .collect();

      const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
      const pendingBookings = bookings.filter((b) => b.status === "pending");

      carpoolDetails.push({
        ...c,
        confirmedBookingsCount: confirmedBookings.length,
        pendingBookingsCount: pendingBookings.length,
        bookings: bookings.map((b) => ({
          _id: b._id,
          passengerName: b.passengerName,
          passengerPhone: b.passengerPhone,
          status: b.status,
        })),
      });

      // Add driver to guests list
      const driverKey = (c.driverPhone || c.driverName).trim().toLowerCase();
      let driverEntry = guestsMap.get(driverKey);
      if (!driverEntry) {
        driverEntry = {
          name: c.driverName,
          phone: c.driverPhone,
          proposesCarpool: true,
          isInCarpool: false,
          details: [`Départ : ${c.departureAddress} (${c.totalSeats} places)`],
        };
        guestsMap.set(driverKey, driverEntry);
      } else {
        driverEntry.proposesCarpool = true;
        driverEntry.details.push(
          `Départ : ${c.departureAddress} (${c.totalSeats} places)`
        );
      }

      // Add passengers to guests list
      for (const b of bookings) {
        if (b.status === "cancelled") continue;
        const passengerKey = (b.passengerPhone || b.passengerName)
          .trim()
          .toLowerCase();
        let passengerEntry = guestsMap.get(passengerKey);
        if (!passengerEntry) {
          passengerEntry = {
            name: b.passengerName,
            phone: b.passengerPhone,
            proposesCarpool: false,
            isInCarpool: true,
            details: [
              `Passager avec ${c.driverName} (${b.status === "confirmed" ? "confirmé" : "en attente"})`,
            ],
          };
          guestsMap.set(passengerKey, passengerEntry);
        } else {
          passengerEntry.isInCarpool = true;
          passengerEntry.details.push(
            `Passager avec ${c.driverName} (${b.status === "confirmed" ? "confirmé" : "en attente"})`
          );
        }
      }
    }

    const guests = Array.from(guestsMap.values());
    const totalDrivers = carpools.length;
    const totalSeatsOffered = carpools.reduce((s, c) => s + c.totalSeats, 0);
    const totalSeatsAvailable = carpools.reduce((s, c) => s + c.availableSeats, 0);
    const totalSeatsBooked = totalSeatsOffered - totalSeatsAvailable;

    return {
      isOrganizer: true,
      event,
      carpools: carpoolDetails,
      guests,
      stats: {
        totalGuests: guests.length,
        totalDrivers,
        totalSeatsOffered,
        totalSeatsBooked,
        totalSeatsAvailable,
      },
    };
  },
});
