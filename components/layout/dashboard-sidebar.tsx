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
    <aside className="w-full border-r bg-card/70 p-4 md:h-[calc(100vh-4rem)] md:w-64 md:sticky md:top-16">
      <div className="space-y-1">
        {links.map((link) => {
          const ActiveIcon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <ActiveIcon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>
      <Button
        variant="ghost"
        className="mt-6 w-full justify-start text-muted-foreground hover:text-foreground"
        onClick={() => clientSignOut("/")}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </aside>
  );
}
