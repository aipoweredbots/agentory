import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePathMock = vi.fn();
const requireAuthMock = vi.fn();
const getCurrentMembershipMock = vi.fn();
const executeAgentRunMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  getCurrentMembership: getCurrentMembershipMock
}));

vi.mock("@/lib/run-engine", () => ({
  executeAgentRun: executeAgentRunMock
}));

describe("runAgentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs agent and revalidates paths", async () => {
    requireAuthMock.mockResolvedValue({ user: { id: "user_1" } });
    getCurrentMembershipMock.mockResolvedValue({ orgId: "org_1" });
    executeAgentRunMock.mockResolvedValue({
      run: { id: "run_1" },
      output: "result",
      agentSlug: "sales-discovery-assistant"
    });

    const { runAgentAction } = await import("@/lib/actions/run-actions");

    const result = await runAgentAction({
      agentId: "11111111-1111-1111-1111-111111111111",
      input: "Generate meeting notes"
    });

    expect(result.success).toBe(true);
    expect(executeAgentRunMock).toHaveBeenCalledWith({
      orgId: "org_1",
      userId: "user_1",
      agentId: "11111111-1111-1111-1111-111111111111",
      input: "Generate meeting notes"
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/billing");
    expect(revalidatePathMock).toHaveBeenCalledWith("/agent/sales-discovery-assistant");
  });

  it("rejects invalid payload", async () => {
    const { runAgentAction } = await import("@/lib/actions/run-actions");

    await expect(
      runAgentAction({
        agentId: "invalid",
        input: "x"
      } as never)
    ).rejects.toBeTruthy();
  });
});
