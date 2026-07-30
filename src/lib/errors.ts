import { ConvexError } from "convex/values";

/**
 * Formats errors from Convex mutations/queries or generic catch blocks
 * into clean, user-friendly error strings.
 */
export function formatConvexError(
  err: unknown,
  fallbackMessage: string = "Une erreur est survenue."
): string {
  if (!err) return fallbackMessage;

  // Handling ConvexError instances
  if (err instanceof ConvexError) {
    if (typeof err.data === "string") return err.data;
    if (typeof err.data === "object" && err.data !== null && "message" in err.data) {
      return String((err.data as { message: unknown }).message);
    }
  }

  let message = "";
  if (typeof err === "string") {
    message = err;
  } else if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === "object" && err !== null && "message" in err) {
    message = String((err as { message?: unknown }).message);
  }

  if (!message) return fallbackMessage;

  // Extract clean message from raw Convex error wrapper if present
  if (message.includes("Uncaught Error:")) {
    message = message.split("Uncaught Error:")[1];
  }

  // Remove stack trace suffixes
  if (message.includes(" at handler")) {
    message = message.split(" at handler")[0];
  }
  if (message.includes(" Called by client")) {
    message = message.split(" Called by client")[0];
  }

  // Clean leading/trailing whitespace & quotes
  message = message.trim().replace(/^["']|["']$/g, "");

  return message || fallbackMessage;
}
