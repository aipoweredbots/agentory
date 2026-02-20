import Link from "next/link";
import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { getAvailableAgents, getOrgAgents } from "@/lib/repositories/agents";
import { Button } from "@/components/ui/button";
import { AgentListTable } from "@/components/agents/agent-list-table";

export default async function DashboardAgentsPage() {
  await requirePageAuth("/dashboard/agents");
  const membership = await getCurrentMembership();

  if (!membership) {
    return <p>No organization membership found.</p>;
  }

  const subscribedAgents = await getOrgAgents(membership.orgId);
  const availableAgents = await getAvailableAgents(membership.orgId);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">My Agents</h1>
          <p className="text-muted-foreground">Agents your organization has subscribed to.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/marketplace">Browse marketplace</Link>
        </Button>
      </div>

      {subscribedAgents.length ? (
        <AgentListTable agents={subscribedAgents} mode="subscribed" />
      ) : (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">No subscribed agents yet.</div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Discover Agents</h1>
          <p className="text-muted-foreground">Subscribe to marketplace agents for your organization.</p>
        </div>
      </div>

      {availableAgents.length ? (
        <AgentListTable agents={availableAgents} mode="available" />
      ) : (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">No agents available yet.</div>
      )}
    </div>
  );
}
