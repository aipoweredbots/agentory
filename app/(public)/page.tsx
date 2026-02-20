import Link from "next/link";
import { Bot, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { getServerAuthSession } from "@/lib/auth";
import { getFeaturedAgents, getPublishedAgents } from "@/lib/repositories/agents";
import { FeaturedCarousel } from "@/components/marketplace/featured-carousel";
import { AgentCard } from "@/components/marketplace/agent-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Section } from "@/components/ui/section";

const steps = [
  {
    icon: Bot,
    title: "Discover agents",
    description: "Browse a rich marketplace of vetted AI agents across dev, growth, HR, and finance workflows."
  },
  {
    icon: Sparkles,
    title: "Try in sandbox",
    description: "Run agents instantly with clear credit/action usage so your team can validate value quickly."
  },
  {
    icon: CreditCard,
    title: "Scale with plans",
    description: "Upgrade to unlock premium agents, higher limits, and consistent team governance by organization."
  }
];

const testimonials = [
  { quote: "Agentory helped us launch AI workflows in days, not quarters.", author: "Product Lead, Nebula Labs" },
  { quote: "Usage controls and subscriptions gave us instant monetization rails.", author: "Founder, PromptOps" },
  { quote: "The org + role model is exactly what enterprise pilots needed.", author: "Head of Data, Brightline" }
];

export default async function HomePage() {
  const [featuredAgents, popularAgents, session] = await Promise.all([
    getFeaturedAgents(3),
    getPublishedAgents({ limit: 6 }),
    getServerAuthSession()
  ]);

  return (
    <div>
      <Section className="pt-10 md:pt-14">
        <GradientBackground>
          <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
            <div className="space-y-5">
              <p className="w-fit rounded-full border border-primary/25 bg-primary/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Modern AI Marketplace
              </p>
              <h1 className="font-[var(--font-heading)] text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Build, monetize, and govern <span className="text-gradient">AI agents</span> in one premium workspace.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Agentory combines marketplace discovery, sandbox runs, subscriptions, and usage intelligence for every team.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/marketplace">Explore marketplace</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href={session?.user ? "/dashboard" : "/auth/sign-up"}>Start free</Link>
                </Button>
              </div>
            </div>
            <Card className="glass">
              <CardHeader>
                <CardTitle>Live marketplace snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 py-2">
                  <span className="text-muted-foreground">Published agents</span>
                  <strong>{popularAgents.length}+ </strong>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 py-2">
                  <span className="text-muted-foreground">Featured picks</span>
                  <strong>{featuredAgents.length}</strong>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 py-2">
                  <span className="text-muted-foreground">Org-ready roles</span>
                  <strong>Owner / Admin / Member</strong>
                </div>
              </CardContent>
            </Card>
          </div>
        </GradientBackground>
      </Section>

      <Section>
        <FeaturedCarousel agents={featuredAgents} />
      </Section>

      <Section>
        <div className="mb-6">
          <h2 className="font-[var(--font-heading)] text-3xl font-extrabold tracking-tight">How It Works</h2>
          <p className="mt-2 text-muted-foreground">A clean path from discovery to adoption.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.title}>
              <CardContent className="pt-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-[var(--font-heading)] text-3xl font-extrabold tracking-tight">Popular Agents</h2>
          <Button asChild variant="ghost">
            <Link href="/marketplace">View all</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {popularAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} canTry={Boolean(session?.user)} />
          ))}
        </div>
      </Section>

      <Section>
        <div className="surface grid gap-4 p-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <blockquote key={item.author} className="rounded-xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm leading-6">“{item.quote}”</p>
              <footer className="mt-3 text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                {item.author}
              </footer>
            </blockquote>
          ))}
        </div>
      </Section>

      <Section className="pb-16" containerClassName="max-w-5xl">
        <div id="pricing" className="surface p-6 md:p-8">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Pricing teaser</p>
            <h2 className="mt-2 font-[var(--font-heading)] text-3xl font-extrabold tracking-tight">Plans that scale with usage</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="space-y-2 pt-6">
                <h3 className="text-xl font-semibold">Free</h3>
                <p className="text-sm text-muted-foreground">200 credits / 50 actions</p>
                <p className="text-3xl font-extrabold">$0</p>
              </CardContent>
            </Card>
            <Card className="brand-aura">
              <CardContent className="space-y-2 pt-6">
                <h3 className="text-xl font-semibold">Premium</h3>
                <p className="text-sm text-muted-foreground">2,000 credits / 500 actions</p>
                <p className="text-3xl font-extrabold">$39/mo</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 pt-6">
                <h3 className="text-xl font-semibold">Premium Plus</h3>
                <p className="text-sm text-muted-foreground">10,000 credits / 2,500 actions</p>
                <p className="text-3xl font-extrabold">$129/mo</p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 flex justify-center">
            <Button asChild size="lg">
              <Link href={session?.user ? "/dashboard/billing" : "/auth/sign-up"}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Compare plans
              </Link>
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
