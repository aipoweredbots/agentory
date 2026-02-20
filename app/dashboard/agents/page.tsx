import Link from "next/link";
import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { RoleEnum } from "@/lib/db-types";
import { getAvailableAgents, getOrgAgents } from "@/lib/repositories/agents";
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
  const available_agents = await getAvailableAgents(membership.orgId);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">My Agents</h1>
          <p className="text-muted-foreground">Browse and manage your organization's agents.</p>
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Popular Agents</h1>
          <p className="text-muted-foreground">Browse popular agents available to your organization.</p>
        </div>
      </div>

      {available_agents.length ? (
        <AgentListTable agents={available_agents} canManage={false} />
      ) : (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">No agents available yet.</div>
      )}
    </div>
  );
}
