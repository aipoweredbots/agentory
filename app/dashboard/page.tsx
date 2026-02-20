import Link from "next/link";
import { startOfDay, subDays } from "date-fns";
import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getUsageSummary } from "@/lib/usage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      .select("id,input,created_at,agents!runs_agent_id_fkey ( name )")
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
    createdAt: new Date(run.created_at),
    agentName:
      (Array.isArray(run.agents)
        ? run.agents[0]?.name
        : (run.agents as { name?: string } | null)?.name) || "Unknown agent"
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

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Credits used</CardTitle>
          </CardHeader>
          <CardContent>{usage.usageMonth.creditsUsed}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Credits remaining</CardTitle>
          </CardHeader>
          <CardContent>{usage.remaining.credits}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actions used</CardTitle>
          </CardHeader>
          <CardContent>{usage.usageMonth.actionsUsed}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actions remaining</CardTitle>
          </CardHeader>
          <CardContent>{usage.remaining.actions}</CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent runs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRuns.length ? (
              recentRuns.map((run) => (
                <div key={run.id} className="rounded-md border bg-background p-3">
                  <p className="text-sm font-medium">{run.agentName}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{run.input}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{run.createdAt.toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No runs yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage breakdown (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {perDay.map((entry) => (
                <li key={entry.key} className="flex items-center justify-between rounded border bg-background px-3 py-2">
                  <span>{entry.key}</span>
                  <span className="text-muted-foreground">
                    {entry.actions} actions / {entry.credits} credits
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/dashboard/marketplace">Marketplace</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/agents">Manage agents</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/org">Organization</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/billing">Billing</Link>
        </Button>
      </section>
    </div>
  );
}
