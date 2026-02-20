"use client";

import type { Plan } from "@/lib/db-types";
import { useState } from "react";
import { toast } from "sonner";
import { PLAN_LIMITS } from "@/lib/plans";
import { PricingCard } from "@/components/billing/pricing-card";
import { Button } from "@/components/ui/button";

const monthlyPrices: Record<Plan, string> = {
  FREE: "$0",
  PREMIUM: "$39",
  PREMIUM_PLUS: "$129"
};

const annualPrices: Record<Plan, string> = {
  FREE: "$0",
  PREMIUM: "$31",
  PREMIUM_PLUS: "$103"
};

export function PricingTable({ currentPlan }: { currentPlan: Plan }) {
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [annual, setAnnual] = useState(false);

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
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-heading)] text-xl font-bold">Plans</h2>
        <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card p-1">
          <Button type="button" size="sm" variant={!annual ? "secondary" : "ghost"} onClick={() => setAnnual(false)}>
            Monthly
          </Button>
          <Button type="button" size="sm" variant={annual ? "secondary" : "ghost"} onClick={() => setAnnual(true)}>
            Annual
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(PLAN_LIMITS) as Plan[]).map((plan) => {
          const limits = PLAN_LIMITS[plan];
          const isCurrent = currentPlan === plan;
          const price = annual ? annualPrices[plan] : monthlyPrices[plan];

          return (
            <PricingCard
              key={plan}
              plan={plan}
              label={limits.label}
              description={limits.description}
              price={price}
              credits={limits.credits}
              actions={limits.actions}
              isCurrent={isCurrent}
              pending={pendingPlan === plan}
              onChoose={startCheckout}
            />
          );
        })}
      </div>
    </section>
  );
}
