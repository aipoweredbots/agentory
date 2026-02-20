import Link from "next/link";
import { getPublishedAgents } from "@/lib/repositories/agents";
import { AgentCard } from "@/components/marketplace/agent-card";
import { Button } from "@/components/ui/button";

export default async function DashboardMarketplacePage() {
  const agents = await getPublishedAgents({ limit: 9 });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">Explore and try popular agents from the catalog.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/marketplace">Open public view</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} canTry />
        ))}
      </div>
    </div>
  );
}
