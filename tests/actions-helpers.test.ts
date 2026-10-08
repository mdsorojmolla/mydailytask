import { describe, expect, it } from "vitest";
import {
  buildMessageUrl,
  errorMessage,
  isRedirectError,
  rethrowIfRedirect,
  returnTo
} from "@/app/actions/helpers";

describe("Server Action Helpers", () => {
  it("detects Next.js redirect errors correctly via digest or message", () => {
    const digestRedirect = { digest: "NEXT_REDIRECT;replace;/home;307;" };
    const messageRedirect = new Error("NEXT_REDIRECT");
    const normalError = new Error("Database connection failed");
    const nonObject = "NEXT_REDIRECT";

    expect(isRedirectError(digestRedirect)).toBe(true);
    expect(isRedirectError(messageRedirect)).toBe(true);
    expect(isRedirectError(normalError)).toBe(false);
    expect(isRedirectError(nonObject)).toBe(false);
    expect(isRedirectError(null)).toBe(false);
  });

  it("rethrowIfRedirect rethrows redirect errors and ignores standard errors", () => {
    const digestRedirect = { digest: "NEXT_REDIRECT;push;/login;307;" };
    const normalError = new Error("Validation failed");

    expect(() => rethrowIfRedirect(digestRedirect)).toThrow();
    expect(() => rethrowIfRedirect(normalError)).not.toThrow();
  });

  it("errorMessage extracts error message and rethrows redirect errors", () => {
    const digestRedirect = { digest: "NEXT_REDIRECT;push;/login;307;" };
    const normalError = new Error("Title is required");

    expect(() => errorMessage(digestRedirect)).toThrow();
    expect(errorMessage(normalError)).toBe("Title is required");
    expect(errorMessage("Unknown string error")).toBe("Something went wrong.");
  });

  it("buildMessageUrl formats success and error URLs cleanly", () => {
    expect(buildMessageUrl("/tasks", "success", "Task added.")).toBe(
      "/tasks?success=Task%20added."
    );
    expect(buildMessageUrl("/tasks?date=2026-10-09", "error", "Failed to save")).toBe(
      "/tasks?date=2026-10-09&error=Failed%20to%20save"
    );
  });

  it("returnTo extracts return path or uses fallback", () => {
    const fdWithReturn = new FormData();
    fdWithReturn.append("returnTo", "/calendar?date=2026-10-09");
    expect(returnTo(fdWithReturn, "/home")).toBe("/calendar?date=2026-10-09");

    const fdEmpty = new FormData();
    expect(returnTo(fdEmpty, "/home")).toBe("/home");
  });
});
