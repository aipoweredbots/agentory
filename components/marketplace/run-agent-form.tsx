"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { runAgentSchema, type RunAgentValues } from "@/lib/zodSchemas";
import { useUpgradeStore } from "@/lib/client-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function RunAgentForm({ agentId, disabled }: { agentId: string; disabled?: boolean }) {
  const router = useRouter();
  const { open } = useUpgradeStore();
  const [output, setOutput] = useState<string | null>(null);

  const form = useForm<RunAgentValues>({
    resolver: zodResolver(runAgentSchema),
    defaultValues: {
      agentId,
      input: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await fetch("/api/run-agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        const callbackUrl = encodeURIComponent(window.location.pathname);
        router.push(`/auth/sign-in?callbackUrl=${callbackUrl}`);
        return;
      }

      if ([402, 403].includes(response.status)) {
        open();
      }
      toast.error(data.error || "Unable to run agent");
      return;
    }

    setOutput(data.output);
    toast.success("Agent run completed");
    form.reset({ agentId, input: "" });
  });

  return (
    <div className="surface space-y-4 p-4">
      <form className="space-y-3" onSubmit={onSubmit}>
        <input type="hidden" {...form.register("agentId")} value={agentId} />
        <div className="space-y-2">
          <Label htmlFor="input">Prompt</Label>
          <Textarea
            id="input"
            disabled={disabled || form.formState.isSubmitting}
            placeholder="Describe what you want this agent to do..."
            className="min-h-[130px]"
            {...form.register("input")}
          />
          {form.formState.errors.input?.message ? (
            <p className="text-xs text-destructive">{form.formState.errors.input.message}</p>
          ) : null}
        </div>
        <Button type="submit" disabled={disabled || form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Try agent
        </Button>
      </form>
      {output ? (
        <div className="rounded-xl border border-border/70 bg-background/70 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Output</p>
          <pre className="whitespace-pre-wrap text-sm">{output}</pre>
        </div>
      ) : null}
    </div>
  );
}
