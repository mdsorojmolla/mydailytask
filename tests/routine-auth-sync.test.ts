import { describe, expect, it } from "vitest";
import { ADMIN_EMAIL, assertAdmin, isAdminUser } from "@/lib/auth/admin";

describe("Admin Authorization Security", () => {
  it("only authorizes mdsorojmolla20@gmail.com as admin", () => {
    expect(isAdminUser({ email: "mdsorojmolla20@gmail.com" })).toBe(true);
    expect(isAdminUser({ email: "MDSOROJMOLLA20@GMAIL.COM" })).toBe(true);
    expect(isAdminUser({ email: " mdsorojmolla20@gmail.com " })).toBe(true);
  });

  it("rejects non-admin emails and malicious payloads", () => {
    expect(isAdminUser({ email: "attacker@gmail.com" })).toBe(false);
    expect(isAdminUser({ email: "student@diu.edu.bd" })).toBe(false);
    expect(isAdminUser({ email: null })).toBe(false);
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser(undefined)).toBe(false);
  });

  it("assertAdmin throws an Unauthorized exception for non-admin users", () => {
    expect(() => assertAdmin({ email: "mdsorojmolla20@gmail.com" })).not.toThrow();
    expect(() => assertAdmin({ email: "user@example.com" })).toThrow(/Unauthorized/);
    expect(() => assertAdmin(null)).toThrow(/Unauthorized/);
  });
});
