import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  containerClassName
}: {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <section className={cn("px-4 py-8 md:px-6 md:py-10", className)}>
      <div className={cn("mx-auto w-full max-w-7xl", containerClassName)}>{children}</div>
    </section>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-[var(--font-heading)] text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
        {subtitle ? <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
