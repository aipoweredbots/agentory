"use client";

import Link from "next/link";
import { useTransition } from "react";
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
    <div className="overflow-x-auto rounded-md border bg-card">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/40 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Visibility</th>
            <th className="px-4 py-3">Tier</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr key={agent.id} className="border-t">
              <td className="px-4 py-3">
                <p className="font-medium">{agent.name}</p>
                <p className="text-xs text-muted-foreground">{agent.slug}</p>
              </td>
              <td className="px-4 py-3">{agent.category}</td>
              <td className="px-4 py-3">{agent.isPublished ? <Badge>Published</Badge> : <Badge variant="outline">Draft</Badge>}</td>
              <td className="px-4 py-3">{agent.premiumOnly ? "Premium" : "Free"}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {canManage ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/agents/${agent.id}/edit`}>Edit</Link>
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/agent/${agent.slug}`}>View</Link>
                    </Button>
                  )}
                  {canManage ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pending}
                      onClick={() => toggle(agent.id, !agent.isPublished)}
                    >
                      {agent.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                  ) : null}
                  {canManage ? (
                    <Button size="sm" variant="destructive" disabled={pending} onClick={() => deleteAgent(agent.id)}>
                      Delete
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
