import Link from "next/link";
import { startOfDay, subDays } from "date-fns";
import { Activity, ArrowRight, Coins, Gauge, PlayCircle } from "lucide-react";
import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getUsageSummary } from "@/lib/usage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/section";
import { StatCard } from "@/components/ui/stat-card";

export default async function DashboardHomePage() {
  await requirePageAuth("/dashboard");
  const membership = await getCurrentMembership();

  if (!membership) {
    return <p>No organization found.</p>;
  }

  const supabase = getSupabaseServerClient();
  const [usage, recentRunsResult, last7DaysUsageResult] = await Promise.all([
    getUsageSummary(membership.orgId),
    supabase
      .from("runs")
      .select("id,input,created_at")
      .eq("org_id", membership.orgId)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("usage_ledger")
      .select("id,action_count,credit_count,created_at")
      .eq("org_id", membership.orgId)
      .gte("created_at", subDays(startOfDay(new Date()), 6).toISOString())
      .order("created_at", { ascending: true })
  ]);

  if (recentRunsResult.error) {
    throw new Error(`RUNS_QUERY_FAILED: ${recentRunsResult.error.message}`);
  }

  if (last7DaysUsageResult.error) {
    throw new Error(`USAGE_QUERY_FAILED: ${last7DaysUsageResult.error.message}`);
  }

  const recentRuns = (recentRunsResult.data || []).map((run) => ({
    id: run.id,
    input: run.input,
    createdAt: new Date(run.created_at)
  }));

  const last7DaysUsage = (last7DaysUsageResult.data || []).map((row) => ({
    actionCount: row.action_count,
    creditCount: row.credit_count,
    createdAt: new Date(row.created_at)
  }));

  const perDay = Array.from({ length: 7 }, (_, idx) => {
    const day = startOfDay(subDays(new Date(), 6 - idx));
    const key = day.toISOString().slice(0, 10);
    const matched = last7DaysUsage.filter((item) => item.createdAt.toISOString().slice(0, 10) === key);

    return {
      key,
      credits: matched.reduce((sum, item) => sum + item.creditCount, 0),
      actions: matched.reduce((sum, item) => sum + item.actionCount, 0)
    };
  });

  const creditsPercent = usage.limits.credits ? (usage.usageMonth.creditsUsed / usage.limits.credits) * 100 : 0;
  const actionsPercent = usage.limits.actions ? (usage.usageMonth.actionsUsed / usage.limits.actions) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        subtitle="Monitor usage, review recent runs, and jump to core workflows quickly."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Credits used"
          value={usage.usageMonth.creditsUsed}
          subtitle={`${usage.remaining.credits} remaining`}
          percent={creditsPercent}
          icon={<Coins className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Actions used"
          value={usage.usageMonth.actionsUsed}
          subtitle={`${usage.remaining.actions} remaining`}
          percent={actionsPercent}
          icon={<Activity className="h-4 w-4 text-primary" />}
        />
        <StatCard title="Current plan" value={usage.plan} subtitle={`Renews ${usage.usageMonth.resetAt.toLocaleDateString()}`} icon={<Gauge className="h-4 w-4 text-primary" />} />
        <StatCard title="Runs this month" value={usage.recentUsage.length} subtitle="Last 7 log entries" icon={<PlayCircle className="h-4 w-4 text-primary" />} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent runs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRuns.length ? (
              recentRuns.map((run, index) => (
                <div key={run.id} className="flex gap-3 rounded-xl border border-border/70 bg-background/60 p-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm">{run.input}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{run.createdAt.toLocaleString()}</p>
                  </div>
                  {index === 0 ? <span className="ml-auto text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Latest</span> : null}
                </div>
              ))
            ) : (
              <EmptyState icon={PlayCircle} title="No runs yet" description="Run an agent from marketplace to populate activity." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage breakdown (7 days)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {perDay.map((entry) => (
              <div key={entry.key} className="flex items-center justify-between rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm">
                <span>{entry.key}</span>
                <span className="text-muted-foreground">
                  {entry.actions} actions / {entry.credits} credits
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="surface p-4">
        <h2 className="mb-3 font-[var(--font-heading)] text-lg font-bold">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/marketplace">Open marketplace</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/agents">My agents</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/org">Organization</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/billing">
              Billing
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
