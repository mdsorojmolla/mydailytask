import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { QuickAdd } from "@/components/domain/quick-add";
import { requireUser } from "@/lib/data";

export default async function ProtectedLayout({
  children
}: {
  children: ReactNode;
}) {
  const { user } = await requireUser();
  return (
    <AppShell userEmail={user.email ?? "Signed in"}>
      {children}
      <QuickAdd />
    </AppShell>
  );
}
