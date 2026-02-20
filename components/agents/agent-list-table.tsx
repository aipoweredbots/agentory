"use client";

import Link from "next/link";
import { useTransition } from "react";
import { CalendarDays, Eye, PencilLine, Plus, Rocket, Sparkles, Tag } from "lucide-react";
import type { AgentRecord } from "@/lib/repositories/agents";
import { toast } from "sonner";
import { deleteAgentAction, togglePublishAgentAction } from "@/lib/actions/agent-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AgentListTable({
  agents,
  canManage
}: {
  agents: AgentRecord[];
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const buildAgentImage = (agent: AgentRecord) => {
    const initials = agent.name
      .split(" ")
      .map((chunk) => chunk[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const hash = [...agent.slug].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hueA = hash % 360;
    const hueB = (hash * 1.7) % 360;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="hsl(${hueA} 72% 44%)" />
            <stop offset="100%" stop-color="hsl(${hueB} 72% 34%)" />
          </linearGradient>
        </defs>
        <rect width="640" height="360" fill="url(#g)" />
        <circle cx="560" cy="70" r="84" fill="rgba(255,255,255,.16)" />
        <circle cx="76" cy="320" r="140" fill="rgba(255,255,255,.09)" />
        <text x="34" y="300" font-family="Arial, sans-serif" font-size="150" font-weight="700" fill="rgba(255,255,255,.92)">
          ${initials}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const toggle = (agentId: string, next: boolean) => {
    startTransition(async () => {
      try {
        await togglePublishAgentAction(agentId, next);
        toast.success(next ? "Agent published" : "Agent unpublished");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update agent");
      }
    });
  };

  const deleteAgent = (agentId: string) => {
    startTransition(async () => {
      try {
        await deleteAgentAction(agentId);
        toast.success("Agent deleted");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete agent");
      }
    });
  };

  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <article
          key={agent.id}
          className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
        >
          <div className="grid md:grid-cols-[280px_1fr]">
            <div className="relative h-44 w-full md:h-full">
              <img
                src={buildAgentImage(agent)}
                alt={`${agent.name} cover`}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-3 top-3 flex gap-2">
                <Badge variant="secondary">{agent.category}</Badge>
                {agent.isPublished ? <Badge>Published</Badge> : <Badge variant="outline">Draft</Badge>}
              </div>
            </div>

            <div className="space-y-4 p-4 md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{agent.shortDescription}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={agent.premiumOnly ? "default" : "muted"}>
                    {agent.premiumOnly ? "Premium tier" : "Free tier"}
                  </Badge>
                  <Badge variant="outline">
                    {agent.freeTryEnabled ? "Free try enabled" : "No free try"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  <span>{agent.slug}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Updated {agent.updatedAt.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{agent.tags.length} tags</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {agent.tags.slice(0, 5).map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {canManage ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/agents/${agent.id}/edit`}>
                      <PencilLine className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/agent/${agent.slug}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Subscribe
                    </Link>
                  </Button>
                )}
                {canManage ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => toggle(agent.id, !agent.isPublished)}
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                    {agent.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                ) : null}
                {canManage ? (
                  <Button size="sm" variant="destructive" disabled={pending} onClick={() => deleteAgent(agent.id)}>
                    Delete
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
