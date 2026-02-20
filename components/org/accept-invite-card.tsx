"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { acceptInviteAction } from "@/lib/actions/org-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AcceptInviteCard({ token, orgName }: { token: string; orgName: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Organization invite</CardTitle>
        <CardDescription>You were invited to join {orgName}. Accept to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              try {
                await acceptInviteAction(token);
                toast.success("Invite accepted");
                router.push("/dashboard/org");
                router.refresh();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to accept invite");
              }
            });
          }}
        >
          Accept invite
        </Button>
      </CardContent>
    </Card>
  );
}
