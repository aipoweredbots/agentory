import { addMonths, endOfMonth, startOfMonth } from "date-fns";
import type { Plan, UsageLedger, UsageMonth } from "@/lib/db-types";
import { PLAN_LIMITS } from "@/lib/plans";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export class UsageLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsageLimitError";
  }
}

export function getYearMonthKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getResetAt(date = new Date()) {
  const firstDayCurrentMonth = startOfMonth(date);
  return addMonths(firstDayCurrentMonth, 1);
}

function mapUsageMonth(row: {
  id: string;
  org_id: string;
  year_month: string;
  actions_used: number;
  credits_used: number;
  reset_at: string;
  created_at: string;
  updated_at: string;
}): UsageMonth {
  return {
    id: row.id,
    orgId: row.org_id,
    yearMonth: row.year_month,
    actionsUsed: row.actions_used,
    creditsUsed: row.credits_used,
    resetAt: new Date(row.reset_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

function mapUsageLedger(row: {
  id: string;
  org_id: string;
  user_id: string;
  agent_id: string | null;
  action_count: number;
  credit_count: number;
  created_at: string;
}): UsageLedger {
  return {
    id: row.id,
    orgId: row.org_id,
    userId: row.user_id,
    agentId: row.agent_id,
    actionCount: row.action_count,
    creditCount: row.credit_count,
    createdAt: new Date(row.created_at)
  };
}

export async function getOrCreateUsageMonth(orgId: string) {
  const supabase = getSupabaseServerClient();
  const now = new Date();
  const yearMonth = getYearMonthKey(now);

  const { data: existing, error: findError } = await supabase
    .from("usage_month")
    .select("id,org_id,year_month,actions_used,credits_used,reset_at,created_at,updated_at")
    .eq("org_id", orgId)
    .eq("year_month", yearMonth)
    .maybeSingle();

  if (findError) {
    throw new Error(`USAGE_MONTH_QUERY_FAILED: ${findError.message}`);
  }

  if (existing) {
    return mapUsageMonth(existing);
  }

  const resetAt = getResetAt(now).toISOString();

  const { data: created, error: createError } = await supabase
    .from("usage_month")
    .insert({
      org_id: orgId,
      year_month: yearMonth,
      reset_at: resetAt
    })
    .select("id,org_id,year_month,actions_used,credits_used,reset_at,created_at,updated_at")
    .single();

  if (createError || !created) {
    throw new Error(`USAGE_MONTH_CREATE_FAILED: ${createError?.message || "unknown"}`);
  }

  return mapUsageMonth(created);
}

export async function getCurrentPlan(orgId: string): Promise<Plan> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase.from("subscriptions").select("plan").eq("org_id", orgId).maybeSingle();

  if (error) {
    throw new Error(`PLAN_QUERY_FAILED: ${error.message}`);
  }

  return (data?.plan as Plan | null) ?? "FREE";
}

export async function consumeUsage(params: {
  orgId: string;
  userId: string;
  credits: number;
  actions: number;
  agentId?: string;
}) {
  const { orgId, userId, credits, actions, agentId } = params;
  const supabase = getSupabaseServerClient();

  const plan = await getCurrentPlan(orgId);
  const limits = PLAN_LIMITS[plan];
  const usageMonth = await getOrCreateUsageMonth(orgId);

  const nextCredits = usageMonth.creditsUsed + credits;
  const nextActions = usageMonth.actionsUsed + actions;

  if (nextCredits > limits.credits || nextActions > limits.actions) {
    throw new UsageLimitError("Monthly usage limit reached for your current plan.");
  }

  const { data: updatedMonth, error: updateError } = await supabase
    .from("usage_month")
    .update({
      credits_used: nextCredits,
      actions_used: nextActions,
      updated_at: new Date().toISOString()
    })
    .eq("id", usageMonth.id)
    .select("id,org_id,year_month,actions_used,credits_used,reset_at,created_at,updated_at")
    .single();

  if (updateError || !updatedMonth) {
    throw new Error(`USAGE_MONTH_UPDATE_FAILED: ${updateError?.message || "unknown"}`);
  }

  const { error: ledgerError } = await supabase.from("usage_ledger").insert({
    org_id: orgId,
    user_id: userId,
    agent_id: agentId || null,
    action_count: actions,
    credit_count: credits
  });

  if (ledgerError) {
    throw new Error(`USAGE_LEDGER_INSERT_FAILED: ${ledgerError.message}`);
  }

  const mappedUpdated = mapUsageMonth(updatedMonth);

  return {
    plan,
    limits,
    usage: mappedUpdated,
    remaining: {
      credits: Math.max(0, limits.credits - mappedUpdated.creditsUsed),
      actions: Math.max(0, limits.actions - mappedUpdated.actionsUsed)
    }
  };
}

export async function getUsageSummary(orgId: string) {
  const supabase = getSupabaseServerClient();
  const monthStart = startOfMonth(new Date()).toISOString();
  const monthEnd = endOfMonth(new Date()).toISOString();

  const [plan, usageMonth, recentUsageResult] = await Promise.all([
    getCurrentPlan(orgId),
    getOrCreateUsageMonth(orgId),
    supabase
      .from("usage_ledger")
      .select("id,org_id,user_id,agent_id,action_count,credit_count,created_at")
      .eq("org_id", orgId)
      .gte("created_at", monthStart)
      .lte("created_at", monthEnd)
      .order("created_at", { ascending: false })
      .limit(7)
  ]);

  if (recentUsageResult.error) {
    throw new Error(`USAGE_LEDGER_QUERY_FAILED: ${recentUsageResult.error.message}`);
  }

  const limits = PLAN_LIMITS[plan];

  return {
    plan,
    limits,
    usageMonth,
    remaining: {
      credits: Math.max(0, limits.credits - usageMonth.creditsUsed),
      actions: Math.max(0, limits.actions - usageMonth.actionsUsed)
    },
    recentUsage: (recentUsageResult.data || []).map((row) =>
      mapUsageLedger(
        row as {
          id: string;
          org_id: string;
          user_id: string;
          agent_id: string | null;
          action_count: number;
          credit_count: number;
          created_at: string;
        }
      )
    )
  };
}
