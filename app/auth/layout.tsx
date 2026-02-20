import type { ReactNode } from "react";
import { Bot, Sparkles } from "lucide-react";
import { PublicNav } from "@/components/layout/public-nav";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-6 px-4 py-8 md:grid-cols-[1fr_1fr] md:px-6">
        <aside className="surface relative hidden overflow-hidden p-8 md:block">
          <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative space-y-5">
            <p className="w-fit rounded-full border border-primary/25 bg-primary/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Welcome to Agentory
            </p>
            <h2 className="font-[var(--font-heading)] text-4xl font-black tracking-tight">
              Access your <span className="text-gradient">AI marketplace</span> workspace.
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Discover and run agents instantly
              </p>
              <p className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                Govern access with organization roles
              </p>
            </div>
          </div>
        </aside>
        <div>{children}</div>
      </main>
    </div>
  );
}
