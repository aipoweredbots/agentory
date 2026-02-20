import { TableRowSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-3">
      <div className="h-8 w-56 animate-pulse rounded-xl bg-muted/60" />
      <TableRowSkeleton />
      <TableRowSkeleton />
      <TableRowSkeleton />
    </div>
  );
}
