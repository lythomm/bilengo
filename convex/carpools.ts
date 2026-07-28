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
      await ctx.db.patch(b._id, { status: "cancelled" });
    }

    await ctx.db.patch(args.carpoolId, {
      status: "cancelled",
      availableSeats: 0,
    });

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

export const seedMockCarpools = mutation({
  args: {
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    let event = null;
    if (args.eventId) {
      event = await ctx.db.get(args.eventId);
    } else {
      event = await ctx.db.query("events").order("desc").first();
    }

    if (!event) {
      throw new Error("Aucun événement trouvé pour insérer les covoiturages.");
    }

    const baseLat = event.destinationLat || 48.8566;
    const baseLng = event.destinationLng || 2.3522;

    const mockDrivers = [
      { name: "Thomas L.", phone: "+33612345671", city: "Chantilly", desc: "Clio 4 rouge, grand coffre." },
      { name: "Camille M.", phone: "+33612345672", city: "Senlis", desc: "2 places calmes, départ à l'heure." },
      { name: "Alexandre B.", phone: "+33612345673", city: "Creil", desc: "Peugeot 308 avec climatisation." },
      { name: "Sophie D.", phone: "+33612345674", city: "Compiègne", desc: "Voyage convivial avec musique." },
      { name: "Lucas V.", phone: "+33612345675", city: "Beaules-Fontaines", desc: "Départ flexible (+/- 15 min)." },
      { name: "Julie P.", phone: "+33612345676", city: "Noyon", desc: "Voiture électrique silencieuse." },
      { name: "Maxime R.", phone: "+33612345677", city: "Clermont", desc: "Retour prévu vers 23h." },
      { name: "Antoine G.", phone: "+33612345678", city: "Méru", desc: "Place pour petits bagages." },
      { name: "Élodie K.", phone: "+33612345679", city: "Pont-Sainte-Maxence", desc: "Rdv devant la gare." },
      { name: "Nicolas S.", phone: "+33612345680", city: "Gouvieux", desc: "4 places disponibles." },
    ];

    const insertedIds = [];

    for (let i = 0; i < mockDrivers.length; i++) {
      const driver = mockDrivers[i];
      // Random radius between 10km and 40km
      const radiusKm = 10 + (i * 3.3) % 30; // 10 to 40 km distributed
      const angleRad = (i / mockDrivers.length) * 2 * Math.PI;

      const latOffset = (radiusKm * Math.cos(angleRad)) / 111.0;
      const lngOffset = (radiusKm * Math.sin(angleRad)) / (111.0 * Math.cos((baseLat * Math.PI) / 180));

      const depLat = Math.round((baseLat + latOffset) * 100000) / 100000;
      const depLng = Math.round((baseLng + lngOffset) * 100000) / 100000;

      const seats = 3 + (i % 2);
      const hour = 14 + (i % 5);
      const minute = (i * 15) % 60;
      const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

      const carpoolId = await ctx.db.insert("carpools", {
        eventId: event._id,
        driverName: driver.name,
        driverPhone: driver.phone,
        departureAddress: `${driver.city} (~${Math.round(radiusKm)} km)`,
        departureLat: depLat,
        departureLng: depLng,
        departureTime: timeStr,
        totalSeats: seats,
        availableSeats: Math.max(1, seats - (i % 2)),
        status: "active",
        description: driver.desc,
      });

      insertedIds.push(carpoolId);
    }

    return { count: insertedIds.length, eventTitle: event.title };
  },
});
