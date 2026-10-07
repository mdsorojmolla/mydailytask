import { redirect } from "next/navigation";
import { formString } from "@/lib/validation";

export function returnTo(formData: FormData, fallback = "/home") {
  return formString(formData, "returnTo") ?? fallback;
}

export function redirectWithMessage(
  path: string,
  type: "error" | "success",
  message: string
): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}${type}=${encodeURIComponent(message)}`);
}

export function parseId(formData: FormData, key = "id") {
  const id = formString(formData, key);
  if (!id) throw new Error("Missing record id.");
  return id;
}
