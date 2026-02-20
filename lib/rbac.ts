import type { Membership, Role } from "@/lib/db-types";

const roleOrder: Record<Role, number> = {
  MEMBER: 0,
  ADMIN: 1,
  OWNER: 2
};

export function hasRequiredRole(role: Role, allowed: Role[]) {
  return allowed.some((candidate) => roleOrder[role] >= roleOrder[candidate]);
}

export function requireRole(membership: Pick<Membership, "role"> | null, allowed: Role[]) {
  if (!membership || !hasRequiredRole(membership.role, allowed)) {
    throw new Error("FORBIDDEN");
  }

  return membership;
}

export function isOwner(membership: Pick<Membership, "role"> | null) {
  return Boolean(membership && membership.role === "OWNER");
}
