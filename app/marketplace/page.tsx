import { Sparkles, Store } from "lucide-react";
import { getServerAuthSession } from "@/lib/auth";
import { getAgentCategories, getPublishedAgents } from "@/lib/repositories/agents";
import { PublicNav } from "@/components/layout/public-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { FilterBar } from "@/components/marketplace/filter-bar";
import { AgentCard } from "@/components/marketplace/agent-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, Section } from "@/components/ui/section";

type MarketplaceSearchParams = {
  q?: string;
  category?: string;
  sort?: "popular" | "newest" | "name";
  view?: "grid" | "table";
  featured?: "true";
};

export default async function MarketplacePage({
  searchParams
}: {
  searchParams: MarketplaceSearchParams;
}) {
  const session = await getServerAuthSession();

  const query = searchParams.q;
  const category = searchParams.category;
  const sort = searchParams.sort || "popular";
  const view = searchParams.view || "grid";
  const featuredOnly = searchParams.featured === "true";

  const [agentsRaw, categories] = await Promise.all([
    getPublishedAgents({ query, category }),
    getAgentCategories()
  ]);

  let agents = featuredOnly ? agentsRaw.filter((agent) => agent.isFeatured) : agentsRaw;

  if (sort === "newest") {
    agents = [...agents].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  if (sort === "name") {
    agents = [...agents].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="min-h-screen">
      <PublicNav />
      <Section>
        <PageHeader
          eyebrow="Marketplace"
          title="Discover AI Agents"
          subtitle="Search, compare, and run agents with premium polish and transparent usage controls."
          actions={<Badge variant="featured">{agents.length} live agents</Badge>}
        />
        <FilterBar
          action="/marketplace"
          categories={categories}
          defaultQuery={query}
          defaultCategory={category}
          defaultSort={sort}
          defaultView={view}
          featuredOnly={featuredOnly}
        />
      </Section>

      <Section className="pt-0">
        {agents.length ? (
          view === "table" ? (
            <div className="surface overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-card/95">
                  <tr className="border-b border-border/70 text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Agent</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Tags</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
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
                        <div className="flex flex-wrap gap-1">
                          {agent.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
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
                <AgentCard key={agent.id} agent={agent} canTry={Boolean(session?.user)} />
              ))}
            </div>
          )
        ) : (
          <EmptyState
            icon={Store}
            title="No agents found"
            description="Try adjusting your filters, switch categories, or clear search terms to discover more agents."
            action={
              <a href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                <Sparkles className="h-4 w-4" />
                Reset filters
              </a>
            }
          />
        )}
      </Section>
      <PublicFooter />
    </div>
  );
}
