import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import type { Role } from "@/lib/db-types";

type AppShellProps = {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: Role;
  };
  orgName: string;
  usage: {
    creditsUsed: number;
    creditsTotal: number;
  };
};

export function AppShell({ children, user, orgName, usage }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <DashboardTopbar user={user} orgName={orgName} usage={usage} />
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 pb-8 pt-4 md:flex-row md:px-6">
        <DashboardSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
