"use client";

import { Select } from "@/components/ui/select";

export function OrgSwitcher({ orgName }: { orgName: string }) {
  return (
    <div className="w-[220px]">
      <p className="mb-1 text-xs uppercase text-muted-foreground">Organization</p>
      <Select value={orgName} disabled aria-label="Organization switcher">
        <option value={orgName}>{orgName}</option>
      </Select>
    </div>
  );
}
