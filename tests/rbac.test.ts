import { describe, expect, it } from "vitest";
import { hasRequiredRole, requireRole } from "@/lib/rbac";

describe("rbac", () => {
  it("allows owner/admin to satisfy admin minimum role", () => {
    expect(hasRequiredRole("OWNER", ["ADMIN"])).toBe(true);
    expect(hasRequiredRole("ADMIN", ["ADMIN"])).toBe(true);
    expect(hasRequiredRole("MEMBER", ["ADMIN"])).toBe(false);
  });

  it("throws forbidden when role requirement is not met", () => {
    expect(() => requireRole({ role: "MEMBER" }, ["ADMIN"])).toThrowError("FORBIDDEN");
  });
});
