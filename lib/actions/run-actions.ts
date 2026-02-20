"use server";

import { revalidatePath } from "next/cache";
import { getCurrentMembership, requireAuth } from "@/lib/auth";
import { executeAgentRun } from "@/lib/run-engine";
import { runAgentSchema, type RunAgentValues } from "@/lib/zodSchemas";

export async function runAgentAction(values: RunAgentValues) {
  const payload = runAgentSchema.parse(values);
  const session = await requireAuth();
  const membership = await getCurrentMembership();

  const result = await executeAgentRun({
    orgId: membership.orgId,
    userId: session.user.id,
    agentId: payload.agentId,
    input: payload.input
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/billing");
  revalidatePath(`/agent/${result.agentSlug}`);

  return {
    success: true,
    run: result.run,
    output: result.output
  };
}
