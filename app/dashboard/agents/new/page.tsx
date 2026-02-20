import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { RoleEnum } from "@/lib/db-types";
import { hasRequiredRole } from "@/lib/rbac";
import { AgentForm } from "@/components/agents/agent-form";
import { PageHeader } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewAgentPage() {
  await requirePageAuth("/dashboard/agents/new");
  const membership = await getCurrentMembership();

  if (!membership || !hasRequiredRole(membership.role, [RoleEnum.ADMIN])) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm">Only Owner/Admin can create agents.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Create Agent" subtitle="Use the 3-step workflow to define basics, pricing access, and publish settings." />
      <AgentForm />
    </div>
  );
}
