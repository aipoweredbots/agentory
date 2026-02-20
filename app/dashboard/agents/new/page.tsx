import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { RoleEnum } from "@/lib/db-types";
import { hasRequiredRole } from "@/lib/rbac";
import { AgentForm } from "@/components/agents/agent-form";

export default async function NewAgentPage() {
  await requirePageAuth("/dashboard/agents/new");
  const membership = await getCurrentMembership();

  if (!membership || !hasRequiredRole(membership.role, [RoleEnum.ADMIN])) {
    return <div className="rounded-md border bg-card p-4 text-sm">Only Owner/Admin can create agents.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Create Agent</h1>
      <AgentForm />
    </div>
  );
}
