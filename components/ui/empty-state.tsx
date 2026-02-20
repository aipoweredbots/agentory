import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-card/80 p-8 text-center">
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-brand-gradient opacity-15 blur-3xl" />
      <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-[var(--font-heading)] text-lg font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
