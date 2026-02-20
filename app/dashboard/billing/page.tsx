import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { PLAN_LIMITS } from "@/lib/plans";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getUsageSummary } from "@/lib/usage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PricingTable } from "@/components/billing/pricing-table";
import { UsageBars } from "@/components/billing/usage-bars";

export default async function BillingPage() {
  await requirePageAuth("/dashboard/billing");
  const membership = await getCurrentMembership();

  if (!membership) {
    return <p>No organization found.</p>;
  }

  const supabase = getSupabaseServerClient();
  const [subscriptionResult, usageSummary] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan,status,current_period_end")
      .eq("org_id", membership.orgId)
      .maybeSingle(),
    getUsageSummary(membership.orgId)
  ]);

  if (subscriptionResult.error) {
    throw new Error(`SUBSCRIPTION_QUERY_FAILED: ${subscriptionResult.error.message}`);
  }

  const subscription = subscriptionResult.data;
  const currentPlan = (subscription?.plan || "FREE") as keyof typeof PLAN_LIMITS;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Plan</h1>
        <p className="text-muted-foreground">Manage subscriptions and monitor consumption.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current plan: {PLAN_LIMITS[currentPlan].label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Status: {subscription?.status || "ACTIVE"}. Period end:{" "}
            {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "N/A"}
          </p>
          <Button asChild variant="outline">
            <a href="/api/stripe/portal">Manage plan</a>
          </Button>
        </CardContent>
      </Card>

      <UsageBars
        creditsUsed={usageSummary.usageMonth.creditsUsed}
        creditsTotal={usageSummary.limits.credits}
        actionsUsed={usageSummary.usageMonth.actionsUsed}
        actionsTotal={usageSummary.limits.actions}
        resetAt={usageSummary.usageMonth.resetAt}
      />

      <PricingTable currentPlan={currentPlan} />
    </div>
  );
}
