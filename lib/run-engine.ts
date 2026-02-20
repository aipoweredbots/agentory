import type { Plan, Run } from "@/lib/db-types";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { consumeUsage, getCurrentPlan } from "@/lib/usage";

export class UpgradeRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpgradeRequiredError";
  }
}

export class AgentAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentAccessError";
  }
}

function buildMockOutput(agentName: string, category: string, input: string) {
  const trimmed = input.trim();
  const tone = category === "Dev" ? "technical" : category === "Sales" ? "commercial" : "strategic";

  return `Agent: ${agentName}\nMode: ${tone}\n\nSummary:\n${trimmed.slice(0, 240)}\n\nSuggestions:\n1) Prioritize the highest impact task first.\n2) Validate assumptions with a small experiment.\n3) Convert output into a weekly execution plan.`;
}

export async function executeAgentRun(params: {
  orgId: string;
  userId: string;
  agentId: string;
  input: string;
}) {
  const { orgId, userId, agentId, input } = params;
  const supabase = getSupabaseServerClient();

  const { data: agent, error: agentError } = await supabase
    .from("subscribed_agents")
    .select("id,name,slug,category,is_published,premium_only,free_try_enabled")
    .eq("id", agentId)
    .maybeSingle();

  if (agentError) {
    throw new Error(`AGENT_QUERY_FAILED: ${agentError.message}`);
  }

  if (!agent || !agent.is_published) {
    throw new AgentAccessError("AGENT_NOT_AVAILABLE");
  }

  const plan: Plan = await getCurrentPlan(orgId);

  if (agent.premium_only && plan === "FREE") {
    throw new UpgradeRequiredError("UPGRADE_REQUIRED");
  }

  if (!agent.free_try_enabled && plan === "FREE") {
    throw new UpgradeRequiredError("FREE_TRY_DISABLED");
  }

  await consumeUsage({
    orgId,
    userId,
    agentId,
    actions: 1,
    credits: 5
  });

  const output = buildMockOutput(agent.name, agent.category, input);

  const { data: run, error: runError } = await supabase
    .from("runs")
    .insert({
      org_id: orgId,
      user_id: userId,
      agent_id: agentId,
      input,
      output,
      credits_consumed: 5,
      actions_consumed: 1
    })
    .select("id,org_id,user_id,agent_id,input,output,credits_consumed,actions_consumed,created_at")
    .single();

  if (runError || !run) {
    throw new Error(`RUN_CREATE_FAILED: ${runError?.message || "unknown"}`);
  }

  const mappedRun: Run = {
    id: run.id,
    orgId: run.org_id,
    userId: run.user_id,
    agentId: run.agent_id,
    input: run.input,
    output: run.output,
    creditsConsumed: run.credits_consumed,
    actionsConsumed: run.actions_consumed,
    createdAt: new Date(run.created_at)
  };

  return { run: mappedRun, output, agentSlug: agent.slug };
}
