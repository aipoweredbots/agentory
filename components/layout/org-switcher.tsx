"use client";

import { Building2 } from "lucide-react";
import { Select } from "@/components/ui/select";

export function OrgSwitcher({ orgName }: { orgName: string }) {
  return (
    <div className="w-[230px]">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Organization</p>
      <div className="relative">
        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Select value={orgName} disabled aria-label="Organization switcher" className="pl-9">
          <option value={orgName}>{orgName}</option>
        </Select>
      </div>
    </div>
  );
}
