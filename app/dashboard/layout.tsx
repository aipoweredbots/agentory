import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { getUsageSummary } from "@/lib/usage";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requirePageAuth("/dashboard");
  const membership = await getCurrentMembership();

  if (!membership) {
    redirect("/auth/sign-in");
  }

  const usage = await getUsageSummary(membership.orgId);

  return (
    <div className="min-h-screen">
      <DashboardTopbar
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
      />
      <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row">
        <DashboardSidebar />
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
