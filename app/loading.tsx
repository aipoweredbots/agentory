import { AgentCardSkeleton } from "@/components/ui/skeleton";

export default function GlobalLoading() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl space-y-6 px-4 py-10 md:px-6">
      <div className="h-10 w-72 animate-pulse rounded-xl bg-muted/60" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AgentCardSkeleton />
        <AgentCardSkeleton />
        <AgentCardSkeleton />
      </div>
    </div>
  );
}
