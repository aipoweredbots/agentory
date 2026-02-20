export type SessionUser = {
  id?: string | null;
  email?: string | null;
};

export function assertAuthenticated(user: SessionUser | null | undefined) {
  if (!user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}
