import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Bilengo — Covoiturage Événementiel",
  description: "Plateforme de covoiturage fluide pour vos événements, mariages et festivals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900 font-sans antialiased selection:bg-neutral-900 selection:text-white">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
