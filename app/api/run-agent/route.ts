import { NextResponse } from "next/server";
import { getCurrentMembership, requireAuth } from "@/lib/auth";
import { executeAgentRun, AgentAccessError, UpgradeRequiredError } from "@/lib/run-engine";
import { UsageLimitError } from "@/lib/usage";
import { runAgentSchema } from "@/lib/zodSchemas";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const membership = await getCurrentMembership();
    const body = await request.json();
    const payload = runAgentSchema.parse(body);

    const result = await executeAgentRun({
      orgId: membership.orgId,
      userId: session.user.id,
      agentId: payload.agentId,
      input: payload.input
    });

    return NextResponse.json({
      output: result.output,
      runId: result.run.id
    });
  } catch (error) {
    if (error instanceof UsageLimitError || error instanceof UpgradeRequiredError) {
      return NextResponse.json({ error: error.message }, { status: 402 });
    }

    if (error instanceof AgentAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to run agent" }, { status: 500 });
  }
}
