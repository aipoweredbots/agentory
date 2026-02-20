import { RoleEnum } from "@/lib/db-types";
import { notFound } from "next/navigation";
import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { getOrgAgentById } from "@/lib/repositories/agents";
import { hasRequiredRole } from "@/lib/rbac";
import { AgentForm } from "@/components/agents/agent-form";
import { PageHeader } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";

export default async function EditAgentPage({ params }: { params: { id: string } }) {
  const { id } = params;
  await requirePageAuth(`/dashboard/agents/${id}/edit`);
  const membership = await getCurrentMembership();

  if (!membership || !hasRequiredRole(membership.role, [RoleEnum.ADMIN])) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm">Only Owner/Admin can edit agents.</CardContent>
      </Card>
    );
  }

  const agent = await getOrgAgentById(membership.orgId, id);

  if (!agent) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Edit Agent" subtitle="Update positioning, access rules, and publication settings." />
      <AgentForm agent={agent} />
    </div>
  );
}
