import { action, query } from "./_generated/server";
import { components } from "./_generated/api";
import { StripeSubscriptions } from "@convex-dev/stripe";
import { v } from "convex/values";

export const stripeClient = new StripeSubscriptions(components.stripe, {});

// Create checkout session for subscription or one-time payment
export const createCheckoutSession = action({
  args: {
    priceId: v.string(),
    mode: v.union(v.literal("subscription"), v.literal("payment")),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  returns: v.object({
    sessionId: v.string(),
    url: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: identity.subject,
      email: identity.email,
      name: identity.name,
    });

    return await stripeClient.createCheckoutSession(ctx, {
      priceId: args.priceId,
      customerId: customer.customerId,
      mode: args.mode,
      successUrl: args.successUrl,
      cancelUrl: args.cancelUrl,
      ...(args.mode === "subscription"
        ? { subscriptionMetadata: { userId: identity.subject } }
        : { paymentIntentMetadata: { userId: identity.subject } }),
    });
  },
});

// Create Customer Portal session for user billing management
export const createCustomerPortal = action({
  args: {
    returnUrl: v.string(),
  },
  returns: v.object({
    url: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: identity.subject,
      email: identity.email,
      name: identity.name,
    });

    return await stripeClient.createCustomerPortalSession(ctx, {
      customerId: customer.customerId,
      returnUrl: args.returnUrl,
    });
  },
});

// List subscriptions for authenticated user
export const getUserSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.runQuery(
      components.stripe.public.listSubscriptionsByUserId,
      { userId: identity.subject }
    );
  },
});
