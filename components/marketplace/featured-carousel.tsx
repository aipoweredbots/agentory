"use client";

import Link from "next/link";
import type { AgentRecord } from "@/lib/repositories/agents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function FeaturedCarousel({ agents }: { agents: AgentRecord[] }) {
  if (!agents.length) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Featured agents</h2>
        <Button asChild variant="ghost">
          <Link href="/marketplace">See all</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {agents.map((agent, index) => (
          <article
            key={agent.id}
            className="rounded-lg border bg-background p-4"
            style={{
              animation: `fade-in-up 420ms ease ${index * 80}ms both`
            }}
          >
            <Badge variant="secondary">{agent.category}</Badge>
            <h3 className="mt-3 text-lg font-semibold">{agent.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{agent.shortDescription}</p>
            <Button asChild className="mt-4" size="sm">
              <Link href={`/agent/${agent.slug}`}>Try now</Link>
            </Button>
          </article>
        ))}
      </div>
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
}
