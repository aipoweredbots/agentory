"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { subscribeToAgentAction } from "@/lib/actions/agent-actions";
import { Button } from "@/components/ui/button";

type SubscribeAgentButtonProps = {
  agentId: string;
  isSubscribed: boolean;
};

export function SubscribeAgentButton({ agentId, isSubscribed }: SubscribeAgentButtonProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onSubscribe = () => {
    startTransition(async () => {
      try {
        await subscribeToAgentAction(agentId);
        toast.success("Agent subscribed");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to subscribe agent");
      }
    });
  };

  if (isSubscribed) {
    return (
      <Button className="flex-1" disabled variant="secondary">
        Subscribed
      </Button>
    );
  }

  return (
    <Button className="flex-1" disabled={pending} onClick={onSubscribe} variant="premium">
      {pending ? "Subscribing..." : "Subscribe"}
    </Button>
  );
}
