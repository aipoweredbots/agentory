import type { Plan } from "@/lib/db-types";

export type PlanLimits = {
  credits: number;
  actions: number;
  label: string;
  description: string;
};

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    credits: 200,
    actions: 50,
    label: "Free",
    description: "For experimenting with public agents"
  },
  PREMIUM: {
    credits: 2000,
    actions: 500,
    label: "Premium",
    description: "Best for growing teams and active workflows"
  },
  PREMIUM_PLUS: {
    credits: 10000,
    actions: 2500,
    label: "Premium Plus",
    description: "High-throughput usage with larger credit caps"
  }
};

export const PAID_PLANS: Plan[] = ["PREMIUM", "PREMIUM_PLUS"];
