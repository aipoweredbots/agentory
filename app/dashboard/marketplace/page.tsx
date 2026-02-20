import Link from "next/link";
import { Compass } from "lucide-react";
import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { getCurrentPlan } from "@/lib/usage";
import { getAgentCategories, getOrgAgents, getPublishedAgents } from "@/lib/repositories/agents";
import { AgentCard } from "@/components/marketplace/agent-card";
import { FilterBar } from "@/components/marketplace/filter-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/section";

type DashboardMarketplaceParams = {
  q?: string;
  category?: string;
  sort?: "popular" | "newest" | "name";
  view?: "grid" | "table";
  featured?: "true";
};

export default async function DashboardMarketplacePage({
  searchParams
}: {
  searchParams: DashboardMarketplaceParams;
}) {
  await requirePageAuth("/dashboard/marketplace");
  const membership = await getCurrentMembership();
  if (!membership) {
    return <p>No organization membership found.</p>;
  }

  const query = searchParams.q;
  const category = searchParams.category;
  const sort = searchParams.sort || "popular";
  const view = searchParams.view || "grid";
  const featuredOnly = searchParams.featured === "true";

  const [publishedRaw, categories, subscribedAgents, plan] = await Promise.all([
    getPublishedAgents({ query, category }),
    getAgentCategories(),
    getOrgAgents(membership.orgId),
    getCurrentPlan(membership.orgId)
  ]);

  const subscribedIds = new Set(subscribedAgents.map((agent) => agent.id));
  let agents = featuredOnly ? publishedRaw.filter((agent) => agent.isFeatured) : publishedRaw;
  if (sort === "newest") {
    agents = [...agents].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  if (sort === "name") {
    agents = [...agents].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Marketplace"
        subtitle="Discover more agents for your organization. Subscribe from the agents page and monitor access by plan."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/agents">Manage subscriptions</Link>
          </Button>
        }
      />

      <FilterBar
        action="/dashboard/marketplace"
        categories={categories}
        defaultQuery={query}
        defaultCategory={category}
        defaultSort={sort}
        defaultView={view}
        featuredOnly={featuredOnly}
      />

      {agents.length ? (
        view === "table" ? (
          <div className="surface overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-card/95">
                <tr className="border-b border-border/70 text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Agent</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium">Subscription</th>
                  <th className="px-4 py-3 font-medium text-right">Open</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent, index) => (
                  <tr
                    key={agent.id}
                    className={index % 2 === 0 ? "border-b border-border/60 bg-background/35" : "border-b border-border/60"}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold">{agent.name}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{agent.shortDescription}</p>
                    </td>
                    <td className="px-4 py-3">{agent.category}</td>
                    <td className="px-4 py-3">
                      {agent.premiumOnly ? <Badge variant="premium">Premium</Badge> : <Badge variant="free">Free</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      {subscribedIds.has(agent.id) ? <Badge variant="trial">Subscribed</Badge> : <Badge variant="muted">Not subscribed</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a className="text-primary hover:underline" href={`/agent/${agent.slug}`}>
                        Open
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                canTry
                subscribed={subscribedIds.has(agent.id)}
                showSubscribeHint
                locked={agent.premiumOnly && plan === "FREE"}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon={Compass}
          title="No marketplace agents found"
          description="Try broadening filters or disabling featured-only mode."
        />
      )}
    </div>
  );
}
