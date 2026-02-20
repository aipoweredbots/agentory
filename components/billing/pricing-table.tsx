"use client";

import type { Plan } from "@/lib/db-types";
import { useState } from "react";
import { toast } from "sonner";
import { PLAN_LIMITS } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const prices: Record<Plan, string> = {
  FREE: "$0",
  PREMIUM: "$39",
  PREMIUM_PLUS: "$129"
};

export function PricingTable({ currentPlan }: { currentPlan: Plan }) {
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);

  const startCheckout = async (plan: Plan) => {
    if (plan === "FREE") {
      return;
    }

    try {
      setPendingPlan(plan);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }
      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
      setPendingPlan(null);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {(Object.keys(PLAN_LIMITS) as Plan[]).map((plan) => {
        const limits = PLAN_LIMITS[plan];
        const isCurrent = currentPlan === plan;

        return (
          <Card key={plan} className={isCurrent ? "border-primary shadow-lg" : ""}>
            <CardHeader>
              <CardTitle>{limits.label}</CardTitle>
              <CardDescription>{limits.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold">
                {prices[plan]}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>{limits.credits.toLocaleString()} credits / month</li>
                <li>{limits.actions.toLocaleString()} actions / month</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={isCurrent ? "secondary" : "default"}
                onClick={() => startCheckout(plan)}
                disabled={isCurrent || plan === "FREE" || pendingPlan === plan}
              >
                {isCurrent ? "Current plan" : pendingPlan === plan ? "Redirecting..." : "Choose plan"}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
