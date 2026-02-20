import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth";
import { getFeaturedAgents, getPublishedAgents } from "@/lib/repositories/agents";
import { FeaturedCarousel } from "@/components/marketplace/featured-carousel";
import { AgentCard } from "@/components/marketplace/agent-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function HomePage() {
  const [featuredAgents, popularAgents, session] = await Promise.all([
    getFeaturedAgents(3),
    getPublishedAgents({ limit: 6 }),
    getServerAuthSession()
  ]);

  return (
    <div>
      <section className="pattern-grid border-b">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-20 md:px-6">
          <p className="w-fit rounded-full border bg-card px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
            Launch and monetize AI agents
          </p>
          <h1 className="max-w-3xl font-[var(--font-heading)] text-4xl font-bold leading-tight md:text-6xl">
            Build your AI agent ecosystem with subscriptions, usage limits, and team governance built in.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Agentory gives you a production-ready marketplace with Auth.js, Prisma, Stripe billing, org roles, and usage ledgers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/marketplace">Browse marketplace</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={session?.user ? "/dashboard" : "/auth/sign-up"}>Start for free</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <FeaturedCarousel agents={featuredAgents} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Popular agents</h2>
          <Button asChild variant="ghost">
            <Link href="/marketplace">Explore all</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {popularAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} canTry={Boolean(session?.user)} />
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="space-y-2 pt-6">
              <h3 className="text-xl font-semibold">Free</h3>
              <p className="text-sm text-muted-foreground">200 credits / 50 actions</p>
              <p className="text-3xl font-bold">$0</p>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardContent className="space-y-2 pt-6">
              <h3 className="text-xl font-semibold">Premium</h3>
              <p className="text-sm text-muted-foreground">2,000 credits / 500 actions</p>
              <p className="text-3xl font-bold">$39/mo</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 pt-6">
              <h3 className="text-xl font-semibold">Premium Plus</h3>
              <p className="text-sm text-muted-foreground">10,000 credits / 2,500 actions</p>
              <p className="text-3xl font-bold">$129/mo</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
