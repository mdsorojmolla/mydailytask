import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data";

export default async function IndexPage() {
  const { settings } = await requireUser();
  if (!settings.setupCompleted) redirect("/setup");
  redirect("/home");
}
