import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentMembership, getServerAuthSession } from "@/lib/auth";
import { getAgentBySlug, isAgentSubscribed } from "@/lib/repositories/agents";
import { PublicNav } from "@/components/layout/public-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RunAgentForm } from "@/components/marketplace/run-agent-form";
import { SubscribeAgentButton } from "@/components/marketplace/subscribe-agent-button";

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
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[1fr_360px] md:px-6">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{agent.category}</Badge>
            {agent.premiumOnly ? <Badge>Premium</Badge> : <Badge variant="muted">Free Try</Badge>}
            <Badge variant="outline">Rating: 4.8 (placeholder)</Badge>
          </div>
          <h1 className="text-4xl font-bold">{agent.name}</h1>
          <p className="text-lg text-muted-foreground">{agent.shortDescription}</p>
          <article className="prose max-w-none text-foreground">
            <p>{agent.longDescription}</p>
          </article>
          <div className="flex flex-wrap gap-2">
            {agent.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Example prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {prompts.map((prompt) => (
                <div key={prompt} className="rounded-md border bg-background px-3 py-2 text-sm">
                  {prompt}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
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
      </main>
      <PublicFooter />
    </div>
  );
}
