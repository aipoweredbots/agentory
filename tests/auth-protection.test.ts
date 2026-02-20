import { describe, expect, it } from "vitest";
import { assertAuthenticated } from "@/lib/auth-guards";

describe("auth protection", () => {
  it("throws when session user is missing", () => {
    expect(() => assertAuthenticated(null)).toThrowError("UNAUTHORIZED");
  });

  it("returns user when authenticated", () => {
    const user = assertAuthenticated({ id: "user_123", email: "u@example.com" });
    expect(user.id).toBe("user_123");
  });
});
