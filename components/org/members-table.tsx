"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RoleEnum, type Role } from "@/lib/db-types";
import { toast } from "sonner";
import { updateMemberRoleAction, removeMemberAction } from "@/lib/actions/org-actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
  const router = useRouter();

  const updateRole = (membershipId: string, role: Role) => {
    startTransition(async () => {
      try {
        await updateMemberRoleAction({ membershipId, role });
        toast.success("Role updated");
        router.refresh();
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
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to remove member");
      }
    });
  };

  return (
    <div className="surface overflow-x-auto p-0">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-10 bg-card/95 text-left text-muted-foreground">
          <tr className="border-b border-border/70">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={member.id} className={index % 2 === 0 ? "border-b border-border/60 bg-background/35" : "border-b border-border/60"}>
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
                  <Badge variant="outline">{member.role}</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-right">
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
