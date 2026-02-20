"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { AgentRecord } from "@/lib/repositories/agents";
import { agentFormSchema, type AgentFormValues } from "@/lib/zodSchemas";
import { createAgentAction, updateAgentAction } from "@/lib/actions/agent-actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function boolFromUnknown(value: unknown) {
  return value === true;
}

export function AgentForm({ agent }: { agent?: AgentRecord }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: agent?.name ?? "",
      category: agent?.category ?? "",
      tags: agent?.tags?.join(", ") ?? "",
      shortDescription: agent?.shortDescription ?? "",
      longDescription: agent?.longDescription ?? "",
      freeTryEnabled: boolFromUnknown(agent?.freeTryEnabled ?? true),
      premiumOnly: boolFromUnknown(agent?.premiumOnly ?? false),
      isFeatured: boolFromUnknown(agent?.isFeatured ?? false)
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        if (agent) {
          await updateAgentAction(agent.id, values);
          toast.success("Agent updated");
        } else {
          await createAgentAction(values);
          toast.success("Agent created");
        }

        router.push("/dashboard/agents");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Request failed");
      }
    });
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} />
          <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" placeholder="Dev, Marketing, Sales..." {...form.register("category")} />
          <p className="text-xs text-destructive">{form.formState.errors.category?.message}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input id="tags" placeholder="comma,separated,tags" {...form.register("tags")} />
        <p className="text-xs text-destructive">{form.formState.errors.tags?.message}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDescription">Short description</Label>
        <Input id="shortDescription" {...form.register("shortDescription")} />
        <p className="text-xs text-destructive">{form.formState.errors.shortDescription?.message}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="longDescription">Long description</Label>
        <Textarea id="longDescription" className="min-h-[180px]" {...form.register("longDescription")} />
        <p className="text-xs text-destructive">{form.formState.errors.longDescription?.message}</p>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("freeTryEnabled")} />
          Free try enabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("premiumOnly")} />
          Premium only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("isFeatured")} />
          Featured
        </label>
      </div>

      <Button disabled={pending} type="submit">
        {agent ? "Update agent" : "Create agent"}
      </Button>
    </form>
  );
}
