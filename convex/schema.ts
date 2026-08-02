import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  events: defineTable({
    organizerId: v.id("users"),
    title: v.string(),
    destinationAddress: v.string(),
    destinationLat: v.optional(v.number()),
    destinationLng: v.optional(v.number()),
    eventDate: v.string(),
    maxParticipants: v.number(),
    tierId: v.optional(v.string()),
    slug: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_organizer", ["organizerId"]),

  carpools: defineTable({
    eventId: v.id("events"),
    driverId: v.id("event_participants"),
    departureAddress: v.string(),
    departureLat: v.optional(v.number()),
    departureLng: v.optional(v.number()),
    departureTime: v.string(),
    totalSeats: v.number(),
    availableSeats: v.number(),
    status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("full")),
    description: v.optional(v.string()),
  })
    .index("by_event", ["eventId"])
    .index("by_driver", ["driverId"])
    .index("by_event_and_driver", ["eventId", "driverId"]),

  bookings: defineTable({
    carpoolId: v.id("carpools"),
    passengerId: v.id("event_participants"),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
    validationToken: v.string(),
  })
    .index("by_carpool", ["carpoolId"])
    .index("by_passenger", ["passengerId"])
    .index("by_carpool_and_passenger", ["carpoolId", "passengerId"])
    .index("by_validation_token", ["validationToken"]),

  event_participants: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    phone: v.string(),
    transportMode: v.optional(
      v.union(v.literal("driver"), v.literal("passenger"), v.literal("autonomous"))
    ),
  })
    .index("by_event", ["eventId"])
    .index("by_event_and_phone", ["eventId", "phone"]),
});
