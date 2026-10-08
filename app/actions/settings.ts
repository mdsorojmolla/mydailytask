"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data";
import { formBoolean, formString, updateSettingsSchema } from "@/lib/validation";
import {
  errorMessage,
  redirectWithMessage,
  returnTo,
  rethrowIfRedirect
} from "@/app/actions/helpers";

export async function updateSettingsAction(formData: FormData) {
  const path = returnTo(formData, "/settings");
  try {
    const { supabase, user } = await requireUser();
    const parsed = updateSettingsSchema.parse({
      browserNotificationsEnabled: formBoolean(
        formData,
        "browserNotificationsEnabled"
      ),
      reminderBeforeMinutes: formString(formData, "reminderBeforeMinutes") ?? "15",
      quietHoursStart: formString(formData, "quietHoursStart"),
      quietHoursEnd: formString(formData, "quietHoursEnd")
    });

    const { error } = await supabase
      .from("settings")
      .update({
        browser_notifications_enabled: parsed.browserNotificationsEnabled,
        reminder_before_minutes: parsed.reminderBeforeMinutes,
        quiet_hours_start: parsed.quietHoursStart,
        quiet_hours_end: parsed.quietHoursEnd,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidatePath("/settings");
    revalidatePath("/home");
  } catch (error) {
    rethrowIfRedirect(error);
    redirectWithMessage(path, "error", errorMessage(error));
  }
  redirectWithMessage(path, "success", "Settings saved.");
}

export async function finishSetupAction() {
  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from("settings")
      .update({ setup_completed: true, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidatePath("/home");
    revalidatePath("/settings");
  } catch (error) {
    rethrowIfRedirect(error);
    redirectWithMessage("/setup", "error", errorMessage(error));
  }
  redirect("/home");
}
