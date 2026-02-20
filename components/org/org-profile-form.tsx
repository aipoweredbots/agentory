"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Organization } from "@/lib/db-types";
import { toast } from "sonner";
import { updateOrgProfileAction } from "@/lib/actions/org-actions";
import { orgProfileSchema, type OrgProfileValues } from "@/lib/zodSchemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function OrgProfileForm({ org }: { org: Organization }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<OrgProfileValues>({
    resolver: zodResolver(orgProfileSchema),
    defaultValues: {
      name: org.name,
      website: org.website || "",
      logoUrl: org.logoUrl || ""
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        await updateOrgProfileAction(values);
        toast.success("Organization updated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update organization");
      }
    });
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="orgName">Organization name</Label>
        <Input id="orgName" {...form.register("name")} />
        <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="orgWebsite">Website</Label>
        <Input id="orgWebsite" placeholder="https://company.com" {...form.register("website")} />
        <p className="text-xs text-destructive">{form.formState.errors.website?.message}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="orgLogo">Logo URL</Label>
        <Input id="orgLogo" placeholder="https://..." {...form.register("logoUrl")} />
        <p className="text-xs text-destructive">{form.formState.errors.logoUrl?.message}</p>
      </div>
      <Button disabled={pending} type="submit" variant="premium">
        Save changes
      </Button>
    </form>
  );
}
