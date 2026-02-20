"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { AgentRecord } from "@/lib/repositories/agents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MotionStagger, MotionItem } from "@/components/ui/motion";

export function FeaturedCarousel({ agents }: { agents: AgentRecord[] }) {
  const reduced = useReducedMotion();

  if (!agents.length) {
    return null;
  }

  return (
    <div className="surface overflow-hidden p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-[var(--font-heading)] text-2xl font-bold tracking-tight">Featured Agents</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href="/marketplace">See all</Link>
        </Button>
      </div>
      <MotionStagger className="grid gap-4 md:grid-cols-3">
        {agents.map((agent) => (
          <MotionItem key={agent.id}>
            <motion.article
              whileHover={reduced ? undefined : { y: -5 }}
              transition={{ duration: 0.2 }}
              className="glass flex h-full flex-col gap-3 p-4"
            >
              <div className="flex items-center gap-2">
                <Badge variant="featured">{agent.category}</Badge>
                {agent.premiumOnly ? <Badge variant="premium">Premium</Badge> : null}
              </div>
              <h3 className="text-lg font-semibold">{agent.name}</h3>
              <p className="line-clamp-3 text-sm text-muted-foreground">{agent.shortDescription}</p>
              <Button asChild size="sm" className="mt-auto w-fit">
                <Link href={`/agent/${agent.slug}`}>
                  Try now
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </motion.article>
          </MotionItem>
        ))}
      </MotionStagger>
    </div>
  );
}
