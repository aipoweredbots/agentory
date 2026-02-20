import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentMembership, getServerAuthSession } from "@/lib/auth";
import { getAgentBySlug, isAgentSubscribed } from "@/lib/repositories/agents";
import { PublicNav } from "@/components/layout/public-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RunAgentForm } from "@/components/marketplace/run-agent-form";
import { SubscribeAgentButton } from "@/components/marketplace/subscribe-agent-button";
import { AgentHero } from "@/components/marketplace/agent-hero";
import { Section } from "@/components/ui/section";

const prompts = [
  "Summarize this project update for executive leadership.",
  "Create an action plan with priorities and owners.",
  "Rewrite this text for a more persuasive tone."
];

export default async function AgentDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [agent, session] = await Promise.all([
    getAgentBySlug(slug),
    getServerAuthSession()
  ]);

  if (!agent || !agent.isPublished) {
    notFound();
  }

  let subscribed = false;
  if (session?.user?.id) {
    const membership = await getCurrentMembership();
    subscribed = await isAgentSubscribed(membership.orgId, agent.id);
  }

  return (
    <div className="min-h-screen">
      <PublicNav />
      <Section className="pt-8">
        <AgentHero
          name={agent.name}
          category={agent.category}
          description={agent.shortDescription}
          premiumOnly={agent.premiumOnly}
          tags={agent.tags}
        />
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Tabs defaultValue="overview" className="min-w-0">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Card>
                <CardContent className="pt-6">
                  <article className="prose prose-slate max-w-none text-foreground dark:prose-invert">
                    <p>{agent.longDescription}</p>
                  </article>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="examples">
              <Card>
                <CardHeader>
                  <CardTitle>Example prompts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {prompts.map((prompt) => (
                    <div key={prompt} className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm">
                      {prompt}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="pricing">
              <Card>
                <CardHeader>
                  <CardTitle>Plan access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>{agent.premiumOnly ? "This agent is available on Premium plans." : "This agent is available on Free and paid plans."}</p>
                  <p>Free sandbox runs may consume credits and actions based on your current plan limits.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Reviews are coming soon. You can still run this agent in sandbox mode now.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <RunAgentForm agentId={agent.id} disabled={!agent.freeTryEnabled && !agent.premiumOnly} />
            <Card>
              <CardContent className="space-y-3 pt-6">
                <p className="text-sm text-muted-foreground">
                  Author organization: {agent.org?.name || "Unknown organization"}
                </p>
                <div className="flex gap-2">
                  {session?.user ? (
                    <SubscribeAgentButton agentId={agent.id} isSubscribed={subscribed} />
                  ) : (
                    <Button asChild className="flex-1">
                      <Link href={`/auth/sign-in?callbackUrl=/agent/${agent.slug}`}>Subscribe</Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/marketplace">Back</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl gap-2">
          {session?.user ? (
            <SubscribeAgentButton agentId={agent.id} isSubscribed={subscribed} />
          ) : (
            <Button asChild className="flex-1">
              <Link href={`/auth/sign-in?callbackUrl=/agent/${agent.slug}`}>Subscribe</Link>
            </Button>
          )}
          <Button asChild variant="outline" className="flex-1">
            <Link href="/marketplace">Back</Link>
          </Button>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
