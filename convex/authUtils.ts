import { ConvexError } from "convex/values";
import { MutationCtx, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export function cleanPhone(p: string): string {
  return p.trim().replace(/[^0-9]/g, "");
}

export async function assertPhoneNotRegistered(
  ctx: MutationCtx | QueryCtx,
  phone: string
) {
  const cleanStr = cleanPhone(phone);
  if (!cleanStr) return;

  const currentUserId = await getAuthUserId(ctx);
  if (currentUserId) {
    const currentUser = await ctx.db.get(currentUserId);
    if (currentUser && currentUser.phone) {
      const currentUserPhone = cleanPhone(currentUser.phone as string);
      if (currentUserPhone === cleanStr) {
        return;
      }
    }
  }

  const match = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("phone"), phone.trim()))
    .first();

  if (match && match._id !== currentUserId) {
    throw new ConvexError(
      "Ce numéro de téléphone appartient déjà à un compte organisateur."
    );
  }
}
