"use client";

import React, { useState } from "react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const [convex] = useState(
    () =>
      new ConvexReactClient(
        process.env.NEXT_PUBLIC_CONVEX_URL || "https://grandiose-puma-725.eu-west-1.convex.cloud"
      )
  );

  return (
    <ConvexAuthProvider client={convex}>
      {children}
    </ConvexAuthProvider>
  );
}
