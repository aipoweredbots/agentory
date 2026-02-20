import { getCurrentMembership, requirePageAuth } from "@/lib/auth";
import { RoleEnum } from "@/lib/db-types";
import { hasRequiredRole, isOwner } from "@/lib/rbac";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrgProfileForm } from "@/components/org/org-profile-form";
import { InviteForm } from "@/components/org/invite-form";
import { MembersTable } from "@/components/org/members-table";

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
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Organization</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company profile</CardTitle>
          </CardHeader>
          <CardContent>
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
