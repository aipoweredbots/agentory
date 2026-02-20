"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Lock, Sparkles, Star } from "lucide-react";
import type { AgentRecord } from "@/lib/repositories/agents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type AgentCardProps = {
  agent: AgentRecord;
  canTry: boolean;
  subscribed?: boolean;
  showSubscribeHint?: boolean;
  locked?: boolean;
};

export function AgentCard({ agent, canTry, subscribed = false, showSubscribeHint = false, locked = false }: AgentCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.article
      whileHover={reduced ? undefined : { y: -5, scale: 1.01 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="group h-full overflow-hidden">
        <div className="relative h-32 border-b border-border/60 bg-brand-gradient">
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <Badge variant="secondary">{agent.category}</Badge>
            {agent.premiumOnly ? <Badge variant="premium">Premium</Badge> : <Badge variant="free">Free Try</Badge>}
          </div>
          <div className="absolute bottom-3 left-4 flex items-center gap-1 text-xs text-white/90">
            <Star className="h-3.5 w-3.5 fill-current" />
            4.8
          </div>
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{agent.name}</CardTitle>
          <CardDescription className="line-clamp-2">{agent.shortDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {agent.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          {showSubscribeHint ? (
            <Badge variant={subscribed ? "trial" : "muted"}>{subscribed ? "Subscribed" : "Not subscribed"}</Badge>
          ) : null}
          {locked ? (
            <div className="flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              <Lock className="h-3.5 w-3.5" />
              Premium plan required
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="mt-auto gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/agent/${agent.slug}`}>View details</Link>
          </Button>
          <Button asChild className="flex-1" disabled={locked || (!canTry && !agent.freeTryEnabled)}>
            <Link href={canTry ? `/agent/${agent.slug}` : `/auth/sign-in?callbackUrl=/agent/${agent.slug}`}>
              <Sparkles className="mr-1.5 h-4 w-4" />
              Try
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.article>
  );
}
