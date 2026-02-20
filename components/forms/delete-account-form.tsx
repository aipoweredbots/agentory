"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientSignOut } from "@/lib/auth-client";
import { deleteAccountAction } from "@/lib/actions/account-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function DeleteAccountForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();

  const canDelete = value === "DELETE";

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteAccountAction({ confirmation: "DELETE" });
        await clientSignOut("/");
        toast.success("Account deleted");
        router.push("/");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to delete account");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            This action is permanent. Type DELETE to confirm account deletion.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="deleteConfirm">Confirmation</Label>
          <Input id="deleteConfirm" value={value} onChange={(event) => setValue(event.target.value)} />
          <p className="text-xs text-muted-foreground">Type exactly DELETE to enable the confirmation button.</p>
          <Button variant="destructive" disabled={!canDelete || pending} onClick={handleDelete}>
            Confirm deletion
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
