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
    slug: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_organizer", ["organizerId"]),

  carpools: defineTable({
    eventId: v.id("events"),
    driverName: v.string(),
    driverPhone: v.string(),
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
    .index("by_event_and_driver", ["eventId", "driverPhone"]),

  bookings: defineTable({
    carpoolId: v.id("carpools"),
    passengerName: v.string(),
    passengerPhone: v.string(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
    validationToken: v.string(),
  })
    .index("by_carpool", ["carpoolId"])
    .index("by_validation_token", ["validationToken"])
    .index("by_passenger_phone", ["passengerPhone"]),

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
