import type { ReactNode } from "react";
import type { Metadata } from "next";
import "@/app/globals.css";
import { AppProviders } from "@/components/providers";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";

export const metadata: Metadata = {
  title: "Agentory",
  description: "Modern AI marketplace starter with auth, RBAC, usage tracking and billing"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-[var(--font-body)]">
        <AppProviders>
          {children}
          <UpgradeDialog />
        </AppProviders>
      </body>
    </html>
  );
}
