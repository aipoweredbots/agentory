import { RoleEnum } from "@/lib/db-types";
import { notFound } from "next/navigation";
import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { getOrgAgentById } from "@/lib/repositories/agents";
import { hasRequiredRole } from "@/lib/rbac";
import { AgentForm } from "@/components/agents/agent-form";

export default async function EditAgentPage({ params }: { params: { id: string } }) {
  const { id } = params;
  await requirePageAuth(`/dashboard/agents/${id}/edit`);
  const membership = await getCurrentMembership();

  if (!membership || !hasRequiredRole(membership.role, [RoleEnum.ADMIN])) {
    return <div className="rounded-md border bg-card p-4 text-sm">Only Owner/Admin can edit agents.</div>;
  }

  const agent = await getOrgAgentById(membership.orgId, id);

  if (!agent) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Edit Agent</h1>
      <AgentForm agent={agent} />
    </div>
  );
}
