"use client";

import Link from "next/link";
import { useUpgradeStore } from "@/lib/client-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function UpgradeDialog() {
  const { isOpen, close } = useUpgradeStore();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : close())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade required</DialogTitle>
          <DialogDescription>
            You hit your monthly usage limits or attempted a premium-only agent. Upgrade your plan to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex gap-2">
          <Button asChild>
            <Link href="/dashboard/billing" onClick={close}>
              View plans
            </Link>
          </Button>
          <Button variant="outline" onClick={close}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
