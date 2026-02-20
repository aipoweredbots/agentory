"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RoleEnum } from "@/lib/db-types";
import { toast } from "sonner";
import { createInviteAction } from "@/lib/actions/org-actions";
import { inviteMemberSchema, type InviteMemberValues } from "@/lib/zodSchemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function InviteForm() {
  const [pending, startTransition] = useTransition();
  const form = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: RoleEnum.MEMBER
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const result = await createInviteAction(values);
        toast.success(`Invite created: ${result.inviteUrl}`);
        form.reset({ email: "", role: RoleEnum.MEMBER });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create invite");
      }
    });
  });

  return (
    <form className="grid gap-3 md:grid-cols-[1fr_160px_auto]" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="inviteEmail">Email</Label>
        <Input id="inviteEmail" type="email" placeholder="teammate@company.com" {...form.register("email")} />
        <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="inviteRole">Role</Label>
        <Select id="inviteRole" {...form.register("role")}>
          <option value={RoleEnum.MEMBER}>Member</option>
          <option value={RoleEnum.ADMIN}>Admin</option>
          <option value={RoleEnum.OWNER}>Owner</option>
        </Select>
      </div>
      <div className="flex items-end">
        <Button disabled={pending} type="submit">
          Invite
        </Button>
      </div>
    </form>
  );
}
