"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Bot, Building2, CreditCard, User, LogOut } from "lucide-react";
import { clientSignOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: Store },
  { href: "/dashboard/agents", label: "Agents", icon: Bot },
  { href: "/dashboard/org", label: "Organization", icon: Building2 },
  { href: "/dashboard/billing", label: "Billing & Plan", icon: CreditCard },
  { href: "/dashboard/account", label: "Account", icon: User }
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="surface h-fit w-full p-3 md:sticky md:top-20 md:w-72">
      <div className="mb-3 px-2 pt-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
      </div>
      <div className="space-y-1">
        {links.map((link) => {
          const ActiveIcon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-brand-gradient text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <ActiveIcon className={cn("h-4 w-4", !isActive ? "group-hover:text-primary" : "")} />
              {link.label}
            </Link>
          );
        })}
      </div>
      <Button
        variant="ghost"
        className="mt-4 w-full justify-start rounded-xl text-muted-foreground hover:text-foreground"
        onClick={() => clientSignOut("/")}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </aside>
  );
}
