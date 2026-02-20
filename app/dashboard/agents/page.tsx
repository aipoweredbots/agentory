import Link from "next/link";
import { Bot, Store } from "lucide-react";
import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { getAvailableAgents, getOrgAgents } from "@/lib/repositories/agents";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/section";
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
    <div className="space-y-6">
      <PageHeader
        title="My Agents"
        subtitle="Manage your subscribed agents and discover new ones from the marketplace."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/marketplace">Open marketplace</Link>
          </Button>
        }
      />

      <section className="space-y-4">
        <h2 className="font-[var(--font-heading)] text-xl font-bold">Subscribed</h2>
        {subscribedAgents.length ? (
          <AgentListTable agents={subscribedAgents} mode="subscribed" />
        ) : (
          <EmptyState
            icon={Bot}
            title="No subscribed agents"
            description="Subscribe to at least one agent to manage it here."
            action={
              <Button asChild size="sm">
                <Link href="/dashboard/marketplace">Browse agents</Link>
              </Button>
            }
          />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-[var(--font-heading)] text-xl font-bold">Discover</h2>
        {availableAgents.length ? (
          <AgentListTable agents={availableAgents} mode="available" />
        ) : (
          <EmptyState
            icon={Store}
            title="No available agents"
            description="You are already subscribed to all currently published agents."
          />
        )}
      </section>
    </div>
  );
}
