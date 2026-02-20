import Link from "next/link";
import type { AgentRecord } from "@/lib/repositories/agents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type AgentCardProps = {
  agent: AgentRecord;
  canTry: boolean;
};

export function AgentCard({ agent, canTry }: AgentCardProps) {
  return (
    <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardHeader>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{agent.category}</Badge>
          {agent.premiumOnly ? <Badge>Premium</Badge> : <Badge variant="muted">Free Try</Badge>}
        </div>
        <CardTitle className="text-lg">{agent.name}</CardTitle>
        <CardDescription>{agent.shortDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {agent.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="mt-auto gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/agent/${agent.slug}`}>View details</Link>
        </Button>
        <Button asChild className="flex-1" disabled={!canTry && !agent.freeTryEnabled}>
          <Link href={canTry ? `/agent/${agent.slug}` : `/auth/sign-in?callbackUrl=/agent/${agent.slug}`}>
            Try
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
