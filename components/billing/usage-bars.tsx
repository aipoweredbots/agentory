import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/lib/utils";

export function UsageBars({
  creditsUsed,
  creditsTotal,
  actionsUsed,
  actionsTotal,
  resetAt
}: {
  creditsUsed: number;
  creditsTotal: number;
  actionsUsed: number;
  actionsTotal: number;
  resetAt: Date;
}) {
  const creditsPercent = creditsTotal ? (creditsUsed / creditsTotal) * 100 : 0;
  const actionsPercent = actionsTotal ? (actionsUsed / actionsTotal) * 100 : 0;

  return (
    <div className="space-y-5 rounded-lg border bg-card p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Credits</span>
          <span>
            {formatNumber(creditsUsed)} / {formatNumber(creditsTotal)}
          </span>
        </div>
        <Progress value={creditsPercent} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Actions</span>
          <span>
            {formatNumber(actionsUsed)} / {formatNumber(actionsTotal)}
          </span>
        </div>
        <Progress value={actionsPercent} />
      </div>
      <p className="text-xs text-muted-foreground">Resets on {new Date(resetAt).toLocaleDateString()}</p>
    </div>
  );
}
