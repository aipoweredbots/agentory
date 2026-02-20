import Link from "next/link";
import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { RoleEnum } from "@/lib/db-types";
import { getOrgAgents } from "@/lib/repositories/agents";
import { hasRequiredRole } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { AgentListTable } from "@/components/agents/agent-list-table";

export default async function DashboardAgentsPage() {
  await requirePageAuth("/dashboard/agents");
  const membership = await getCurrentMembership();

  if (!membership) {
    return <p>No organization membership found.</p>;
  }

  const canManage = hasRequiredRole(membership.role, [RoleEnum.ADMIN]);
  const agents = await getOrgAgents(membership.orgId);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Manage Agents</h1>
          <p className="text-muted-foreground">Create, edit, and publish marketplace listings.</p>
        </div>
        {canManage ? (
          <Button asChild>
            <Link href="/dashboard/agents/new">Create agent</Link>
          </Button>
        ) : null}
      </div>

      {agents.length ? (
        <AgentListTable agents={agents} canManage={canManage} />
      ) : (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">No agents created yet.</div>
      )}
    </div>
  );
}
