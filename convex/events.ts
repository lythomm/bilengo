import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function generateUniqueSlug(
  ctx: any,
  title: string
): Promise<string> {
  const clean = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "event";

  for (let i = 0; i < 5; i++) {
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${clean}-${randomSuffix}`;
    const existing = await ctx.db
      .query("events")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .first();
    if (!existing) return slug;
  }
  return `${clean}-${Date.now().toString(36)}`;
}

export const createEvent = mutation({
  args: {
    title: v.string(),
    destinationAddress: v.string(),
    destinationLat: v.optional(v.number()),
    destinationLng: v.optional(v.number()),
    eventDate: v.string(),
    maxParticipants: v.number(),
    tierId: v.optional(v.string()),
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

    const slug = await generateUniqueSlug(ctx, title);

    const eventId = await ctx.db.insert("events", {
      organizerId: userId,
      title: title.substring(0, 200),
      destinationAddress: destinationAddress.substring(0, 300),
      destinationLat: args.destinationLat,
      destinationLng: args.destinationLng,
      eventDate: args.eventDate,
      maxParticipants: Math.min(Math.max(1, args.maxParticipants), 5000),
      tierId: args.tierId,
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

function normalizeGuestKey(phone?: string, name?: string): string {
  const p = (phone || "").replace(/[^0-9]/g, "");
  if (p) return p;
  return (name || "").trim().toLowerCase();
}

export const getOrganizerEventData = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const event = await ctx.db.get(args.eventId);
    if (!event || event.organizerId !== userId) {
      return null;
    }

    const [carpools, registeredParticipants] = await Promise.all([
      ctx.db
        .query("carpools")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .collect(),
      ctx.db
        .query("event_participants")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .collect(),
    ]);

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

    // Seed guestsMap with all registered event participants
    for (const p of registeredParticipants) {
      const key = normalizeGuestKey(p.phone, p.name);
      guestsMap.set(key, {
        name: p.name,
        phone: p.phone,
        proposesCarpool: p.transportMode === "driver",
        isInCarpool: p.transportMode === "passenger",
        details: p.transportMode === "autonomous" || !p.transportMode ? ["Autonome / Sans covoiturage"] : [],
      });
    }

    const allBookings = await Promise.all(
      carpools.map((c) =>
        ctx.db
          .query("bookings")
          .withIndex("by_carpool", (q) => q.eq("carpoolId", c._id))
          .collect()
      )
    );

    for (let i = 0; i < carpools.length; i++) {
      const c = carpools[i];
      const bookings = allBookings[i];
      const driver = await ctx.db.get(c.driverId);
      const driverName = driver?.name || "Conducteur";
      const driverPhone = driver?.phone || "";

      const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
      const pendingBookings = bookings.filter((b) => b.status === "pending");

      const enrichedBookings = [];
      for (const b of bookings) {
        const passenger = await ctx.db.get(b.passengerId);
        enrichedBookings.push({
          _id: b._id,
          passengerName: passenger?.name || "Passager",
          passengerPhone: passenger?.phone || "",
          status: b.status,
        });
      }

      carpoolDetails.push({
        ...c,
        driverName,
        driverPhone,
        confirmedBookingsCount: confirmedBookings.length,
        pendingBookingsCount: pendingBookings.length,
        bookings: enrichedBookings,
      });

      // Add driver to guests list
      const driverKey = normalizeGuestKey(driverPhone, driverName);
      let driverEntry = guestsMap.get(driverKey);
      if (!driverEntry) {
        driverEntry = {
          name: driverName,
          phone: driverPhone,
          proposesCarpool: true,
          isInCarpool: false,
          details: [`Départ : ${c.departureAddress} (${c.totalSeats} places)`],
        };
        guestsMap.set(driverKey, driverEntry);
      } else {
        driverEntry.proposesCarpool = true;
        if (driverEntry.details.includes("Autonome / Sans covoiturage")) {
          driverEntry.details = [];
        }
        driverEntry.details.push(
          `Départ : ${c.departureAddress} (${c.totalSeats} places)`
        );
      }

      // Add passengers to guests list
      for (const b of enrichedBookings) {
        if (b.status === "cancelled") continue;
        const passengerKey = normalizeGuestKey(b.passengerPhone, b.passengerName);
        let passengerEntry = guestsMap.get(passengerKey);
        if (!passengerEntry) {
          passengerEntry = {
            name: b.passengerName,
            phone: b.passengerPhone,
            proposesCarpool: false,
            isInCarpool: true,
            details: [
              `Passager avec ${driverName} (${b.status === "confirmed" ? "confirmé" : "en attente"})`,
            ],
          };
          guestsMap.set(passengerKey, passengerEntry);
        } else {
          passengerEntry.isInCarpool = true;
          if (passengerEntry.details.includes("Autonome / Sans covoiturage")) {
            passengerEntry.details = [];
          }
          passengerEntry.details.push(
            `Passager avec ${driverName} (${b.status === "confirmed" ? "confirmé" : "en attente"})`
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

export const updateEventQuota = mutation({
  args: {
    eventId: v.id("events"),
    maxParticipants: v.number(),
    tierId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Non autorisé. Vous devez être connecté.");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event || event.organizerId !== userId) {
      throw new ConvexError("Action non autorisée.");
    }

    const maxParticipants = Math.max(1, args.maxParticipants);
    await ctx.db.patch(args.eventId, {
      maxParticipants,
      ...(args.tierId ? { tierId: args.tierId } : {}),
    });

    return { success: true, maxParticipants };
  },
});
