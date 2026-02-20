import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getServerAuthSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/#pricing", label: "Pricing" }
];

export async function PublicNav() {
  const session = await getServerAuthSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2 font-[var(--font-heading)] text-xl font-extrabold tracking-tight">
            <span className="rounded-lg bg-brand-gradient p-1 text-primary-foreground shadow-soft">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-gradient">Agentory</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="interactive-underline text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session?.user ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/sign-up">Start free</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
