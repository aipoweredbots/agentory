import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted/70", className)} aria-hidden />;
}

export function AgentCardSkeleton() {
  return (
    <div className="surface space-y-4 p-4">
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3 rounded-xl border border-border/70 bg-card p-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}
