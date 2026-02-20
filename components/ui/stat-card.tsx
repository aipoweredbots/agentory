import type { ReactNode } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  subtitle,
  percent,
  icon
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  percent?: number;
  icon?: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-[var(--font-heading)] text-3xl font-extrabold tracking-tight">{value}</p>
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        {typeof percent === "number" ? <Progress value={percent} /> : null}
      </CardContent>
    </Card>
  );
}
