import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GradientBackground({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[2rem] border border-border/70 bg-brand-radial p-8 md:p-12", className)}>
      <div className="pointer-events-none absolute -left-12 -top-12 h-52 w-52 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 h-60 w-60 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
}
