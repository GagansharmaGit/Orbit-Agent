import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Orbit — Superhuman for Gmail & Calendar",
  description: "A blazing-fast, AI-powered email and calendar workflow app built with Corsair.",
  keywords: ["email", "calendar", "gmail", "google calendar", "corsair", "AI", "productivity"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        <SessionProvider>
        <TRPCProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            richColors
            toastOptions={{
              style: {
                zIndex: 99999,
                background: "oklch(0.15 0.012 260)",
                border: "1px solid oklch(0.25 0.015 260)",
                color: "oklch(0.97 0.005 260)",
              },
            }}
          />
        </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
