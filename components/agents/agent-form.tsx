"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { AgentRecord } from "@/lib/repositories/agents";
import { agentFormSchema, type AgentFormValues } from "@/lib/zodSchemas";
import { createAgentAction, updateAgentAction } from "@/lib/actions/agent-actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function boolFromUnknown(value: unknown) {
  return value === true;
}

const steps = [
  { key: "basics", title: "Basics" },
  { key: "pricing", title: "Pricing" },
  { key: "publish", title: "Publish" }
] as const;

export function AgentForm({ agent }: { agent?: AgentRecord }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeStep, setActiveStep] = useState(0);

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
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="surface p-3">
        <div className="grid gap-2 md:grid-cols-3">
          {steps.map((step, index) => (
            <button
              key={step.key}
              type="button"
              onClick={() => setActiveStep(index)}
              className={`rounded-xl px-3 py-2 text-left text-sm transition ${
                activeStep === index ? "bg-brand-gradient text-primary-foreground shadow-soft" : "bg-background/65 text-muted-foreground hover:bg-accent/60"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em]">{`Step ${index + 1}`}</p>
              <p className="font-semibold">{step.title}</p>
            </button>
          ))}
        </div>
      </div>

      {activeStep === 0 ? (
        <Card>
          <CardContent className="space-y-4 pt-6">
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
          </CardContent>
        </Card>
      ) : null}

      {activeStep === 1 ? (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="longDescription">Long description</Label>
              <Textarea id="longDescription" className="min-h-[200px]" {...form.register("longDescription")} />
              <p className="text-xs text-destructive">{form.formState.errors.longDescription?.message}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm">
                <input type="checkbox" {...form.register("freeTryEnabled")} />
                Free try enabled
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm">
                <input type="checkbox" {...form.register("premiumOnly")} />
                Premium only
              </label>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeStep === 2 ? (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <label className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm">
              <input type="checkbox" {...form.register("isFeatured")} />
              Feature this agent on homepage and discovery pages
            </label>
            <div className="rounded-xl border border-primary/25 bg-primary/10 p-4 text-sm">
              <p className="font-semibold">Ready to publish?</p>
              <p className="mt-1 text-muted-foreground">
                Save now and then publish/unpublish from the agents list after review.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="outline" disabled={activeStep === 0} onClick={() => setActiveStep((step) => Math.max(0, step - 1))}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Previous
        </Button>
        <div className="flex gap-2">
          {activeStep < steps.length - 1 ? (
            <Button type="button" onClick={() => setActiveStep((step) => Math.min(steps.length - 1, step + 1))}>
              Next
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button disabled={pending} type="submit" variant="premium">
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              {agent ? "Update agent" : "Create agent"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
