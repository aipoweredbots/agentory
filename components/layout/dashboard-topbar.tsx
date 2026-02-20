"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Role } from "@/lib/db-types";
import { clientSignOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { OrgSwitcher } from "@/components/layout/org-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type DashboardTopbarProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: Role;
  };
  orgName: string;
  usage: {
    creditsUsed: number;
    creditsTotal: number;
  };
};

export function DashboardTopbar({ user, orgName, usage }: DashboardTopbarProps) {
  const initials =
    user.name
      ?.split(" ")
      .map((chunk) => chunk[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AB";

  const percent = usage.creditsTotal ? (usage.creditsUsed / usage.creditsTotal) * 100 : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center gap-3 px-4 md:px-6">
        <div className="min-w-[210px] flex-1">
          <OrgSwitcher orgName={orgName} />
        </div>
        <div className="hidden w-full max-w-xs rounded-xl border border-border/70 bg-card/80 px-3 py-2 md:block">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Monthly credits</span>
            <span className="font-medium">
              {usage.creditsUsed}/{usage.creditsTotal}
            </span>
          </div>
          <Progress value={percent} />
        </div>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-8 w-8 overflow-hidden rounded-xl border border-border/70">
                <AvatarImage src={user.image || undefined} alt={user.name || "Profile"} />
                <AvatarFallback className="flex h-full w-full items-center justify-center bg-secondary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{user.name || user.email || "Account"}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/account">Account</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/billing">Billing</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 h-px bg-border" />
            <DropdownMenuItem onClick={() => clientSignOut("/")}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
