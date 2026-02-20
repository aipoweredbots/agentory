"use client";

import { useTransition } from "react";
import { RoleEnum, type Role } from "@/lib/db-types";
import { toast } from "sonner";
import { updateMemberRoleAction, removeMemberAction } from "@/lib/actions/org-actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type MemberWithUser = {
  id: string;
  role: Role;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

export function MembersTable({
  members,
  canManageRoles,
  currentUserId
}: {
  members: MemberWithUser[];
  canManageRoles: boolean;
  currentUserId: string;
}) {
  const [pending, startTransition] = useTransition();

  const updateRole = (membershipId: string, role: Role) => {
    startTransition(async () => {
      try {
        await updateMemberRoleAction({ membershipId, role });
        toast.success("Role updated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update role");
      }
    });
  };

  const removeMember = (membershipId: string) => {
    startTransition(async () => {
      try {
        await removeMemberAction({ membershipId });
        toast.success("Member removed");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to remove member");
      }
    });
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/40 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-t">
              <td className="px-4 py-3">{member.user.name || "-"}</td>
              <td className="px-4 py-3">{member.user.email}</td>
              <td className="px-4 py-3">
                {canManageRoles ? (
                  <Select
                    defaultValue={member.role}
                    onChange={(event) => updateRole(member.id, event.target.value as Role)}
                    disabled={pending || member.user.id === currentUserId}
                  >
                    <option value={RoleEnum.MEMBER}>Member</option>
                    <option value={RoleEnum.ADMIN}>Admin</option>
                    <option value={RoleEnum.OWNER}>Owner</option>
                  </Select>
                ) : (
                  member.role
                )}
              </td>
              <td className="px-4 py-3">
                {canManageRoles && member.user.id !== currentUserId ? (
                  <Button variant="destructive" size="sm" onClick={() => removeMember(member.id)} disabled={pending}>
                    Remove
                  </Button>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
