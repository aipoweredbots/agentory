import { getServerAuthSession } from "@/lib/auth";
import { getAgentCategories, getPublishedAgents } from "@/lib/repositories/agents";
import { PublicNav } from "@/components/layout/public-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { SearchFilters } from "@/components/marketplace/search-filters";
import { AgentCard } from "@/components/marketplace/agent-card";

export default async function MarketplacePage({
  searchParams
}: {
  searchParams: { q?: string; category?: string };
}) {
  const { q, category } = searchParams;
  const session = await getServerAuthSession();

  const [agents, categories] = await Promise.all([
    getPublishedAgents({ query: q, category }),
    getAgentCategories()
  ]);

  return (
    <div className="min-h-screen">
      <PublicNav />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">Browse published agents by category and use case.</p>
        </div>
        <SearchFilters categories={categories} defaultQuery={q} defaultCategory={category} />
        {agents.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} canTry={Boolean(session?.user)} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">No agents match your filters.</div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
