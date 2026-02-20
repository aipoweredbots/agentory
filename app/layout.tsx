import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Sora, IBM_Plex_Sans } from "next/font/google";
import "@/app/globals.css";
import { AppProviders } from "@/components/providers";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";

const heading = Sora({
  subsets: ["latin"],
  variable: "--font-heading"
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Agentory",
  description: "Modern AI marketplace starter with auth, RBAC, usage tracking and billing"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${heading.variable} ${body.variable} font-[var(--font-body)]`}>
        <AppProviders>
          {children}
          <UpgradeDialog />
        </AppProviders>
      </body>
    </html>
  );
}
