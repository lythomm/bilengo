import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { components } from "./_generated/api";
import { registerRoutes } from "@convex-dev/stripe";

const http = httpRouter();

auth.addHttpRoutes(http);

registerRoutes(http, components.stripe, {
  webhookPath: "/stripe/webhook",
});

export default http;

