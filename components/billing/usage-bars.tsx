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
    <div className="surface space-y-5 p-5">
      <h3 className="font-[var(--font-heading)] text-lg font-bold">Usage</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Credits</span>
          <span className="font-medium">
            {formatNumber(creditsUsed)} / {formatNumber(creditsTotal)}
          </span>
        </div>
        <Progress value={creditsPercent} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Actions</span>
          <span className="font-medium">
            {formatNumber(actionsUsed)} / {formatNumber(actionsTotal)}
          </span>
        </div>
        <Progress value={actionsPercent} />
      </div>
      <p className="text-xs text-muted-foreground">Resets on {new Date(resetAt).toLocaleDateString()}</p>
    </div>
  );
}
