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

    // Enforce freemium limit server-side (< 50 max participants for free tier)
    if (args.maxParticipants > 50) {
      throw new Error(
        "Le compte gratuit est limité à un maximum de 50 participants."
      );
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
