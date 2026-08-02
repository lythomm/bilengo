import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertPhoneNotRegistered } from "./authUtils";

function cleanPhone(p: string) {
  return p.trim().replace(/[^0-9]/g, "");
}

export const registerParticipant = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    phone: v.string(),
    transportMode: v.optional(
      v.union(v.literal("driver"), v.literal("passenger"), v.literal("autonomous"))
    ),
  },
  handler: async (ctx, args) => {
    const cleanName = args.name.trim();
    const phoneClean = cleanPhone(args.phone);

    if (!cleanName || !phoneClean) {
      throw new ConvexError("Nom et téléphone obligatoires.");
    }

    await assertPhoneNotRegistered(ctx, args.phone);

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Événement introuvable.");
    }

    // Check if participant already registered for this event
    const existing = await ctx.db
      .query("event_participants")
      .withIndex("by_event_and_phone", (q) =>
        q.eq("eventId", args.eventId).eq("phone", phoneClean)
      )
      .first();

    if (existing) {
      // Preserve driver or passenger status if already assigned
      const currentMode = existing.transportMode;
      const targetMode = args.transportMode;
      const keepCurrentMode =
        (currentMode === "driver" || currentMode === "passenger") &&
        (!targetMode || targetMode === "autonomous");

      await ctx.db.patch(existing._id, {
        name: cleanName,
        transportMode: keepCurrentMode ? currentMode : targetMode || currentMode || "autonomous",
      });
      return existing._id;
    }

    // Check max participants quota for new registrations
    const existingParticipants = await ctx.db
      .query("event_participants")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    if (existingParticipants.length >= event.maxParticipants) {
      throw new ConvexError("Le nombre maximum d'invités pour cet événement est atteint. Informez en l'organisateur.");
    }

    const participantId = await ctx.db.insert("event_participants", {
      eventId: args.eventId,
      name: cleanName,
      phone: phoneClean,
      transportMode: args.transportMode || "autonomous",
    });

    return participantId;
  },
});

export const getParticipantsByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("event_participants")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});
