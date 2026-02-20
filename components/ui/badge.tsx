import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide", {
  variants: {
    variant: {
      default: "border-primary/30 bg-primary/15 text-primary dark:border-primary/40 dark:bg-primary/25 dark:text-primary-foreground",
      secondary: "border-secondary/70 bg-secondary text-secondary-foreground",
      outline: "border-border/80 bg-background/80 text-foreground",
      muted: "border-muted bg-muted/70 text-muted-foreground",
      featured: "border-cyan-400/35 bg-cyan-400/15 text-cyan-700 dark:text-cyan-300",
      premium: "border-fuchsia-400/35 bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
      free: "border-emerald-400/35 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      trial: "border-amber-400/35 bg-amber-500/15 text-amber-700 dark:text-amber-300"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
