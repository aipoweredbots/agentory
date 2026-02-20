import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { getUsageSummary } from "@/lib/usage";
import { AppShell } from "@/components/layout/app-shell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requirePageAuth("/dashboard");
  const membership = await getCurrentMembership();

  if (!membership) {
    redirect("/auth/sign-in");
  }

  const usage = await getUsageSummary(membership.orgId);

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: membership.role
      }}
      orgName={membership.org?.name || "Organization"}
      usage={{
        creditsUsed: usage.usageMonth.creditsUsed,
        creditsTotal: usage.limits.credits
      }}
    >
      {children}
    </AppShell>
  );
}
