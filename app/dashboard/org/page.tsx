import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { RoleEnum } from "@/lib/db-types";
import { hasRequiredRole, isOwner } from "@/lib/rbac";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrgProfileForm } from "@/components/org/org-profile-form";
import { InviteForm } from "@/components/org/invite-form";
import { MembersTable } from "@/components/org/members-table";
import { PageHeader } from "@/components/ui/section";

export default async function OrganizationPage() {
  const session = await requirePageAuth("/dashboard/org");
  const membership = await getCurrentMembership();

  if (!membership) {
    return <p>No organization found.</p>;
  }

  const supabase = getSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("memberships")
    .select("id,role,user_id,users!memberships_user_id_fkey ( id,email,name )")
    .eq("org_id", membership.orgId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`ORG_MEMBERS_QUERY_FAILED: ${error.message}`);
  }

  const members = (rows || []).map((row) => {
    const user = Array.isArray(row.users) ? row.users[0] : row.users;
    return {
      id: row.id,
      role: row.role,
      user: {
        id: user?.id || row.user_id,
        email: user?.email || "",
        name: user?.name || null
      }
    };
  });

  const canInvite = hasRequiredRole(membership.role, [RoleEnum.ADMIN]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Settings"
        subtitle="Manage profile details, invite teammates, and maintain role-based access for your workspace."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-border/70 bg-background/60 p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white">
                {membership.org?.name?.slice(0, 2).toUpperCase() || "OR"}
              </div>
              <div>
                <p className="font-semibold">{membership.org?.name}</p>
                <p className="text-xs text-muted-foreground">{membership.org?.website || "No website added"}</p>
              </div>
            </div>
            <OrgProfileForm org={membership.org!} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invite members</CardTitle>
          </CardHeader>
          <CardContent>
            {canInvite ? <InviteForm /> : <p className="text-sm text-muted-foreground">Only Owner/Admin can invite members.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <MembersTable members={members} canManageRoles={isOwner(membership)} currentUserId={session.user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
