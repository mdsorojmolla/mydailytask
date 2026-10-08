import { redirect } from "next/navigation";
import { formString } from "@/lib/validation";

export function returnTo(formData: FormData, fallback = "/home") {
  return formString(formData, "returnTo") ?? fallback;
}

export function buildMessageUrl(
  path: string,
  type: "error" | "success",
  message: string
): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${type}=${encodeURIComponent(message)}`;
}

export function isRedirectError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  return (
    ("digest" in error &&
      typeof (error as any).digest === "string" &&
      (error as any).digest.startsWith("NEXT_REDIRECT")) ||
    ("message" in error &&
      typeof (error as any).message === "string" &&
      (error as any).message.includes("NEXT_REDIRECT"))
  );
}

export function rethrowIfRedirect(error: unknown): void {
  if (isRedirectError(error)) {
    throw error;
  }
}

export function errorMessage(error: unknown): string {
  rethrowIfRedirect(error);
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function redirectWithMessage(
  path: string,
  type: "error" | "success",
  message: string
): never {
  redirect(buildMessageUrl(path, type, message));
}

export function parseId(formData: FormData, key = "id") {
  const id = formString(formData, key);
  if (!id) throw new Error("Missing record id.");
  return id;
}
