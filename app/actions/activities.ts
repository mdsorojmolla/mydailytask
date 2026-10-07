"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/data";
import { createActivitySchema, formBoolean, formString } from "@/lib/validation";
import { parseId, redirectWithMessage, returnTo } from "@/app/actions/helpers";

export async function createActivityAction(formData: FormData) {
  const path = returnTo(formData, "/settings");
  try {
    const { supabase, user } = await requireUser();
    const parsed = createActivitySchema.parse({
      name: formString(formData, "name"),
      category: formString(formData, "category") ?? "Personal",
      startTime: formString(formData, "startTime"),
      durationMinutes: formString(formData, "durationMinutes"),
      repeatRule: formString(formData, "repeatRule") ?? "DAILY",
      enabled: formBoolean(formData, "enabled"),
      trackingEnabled: formBoolean(formData, "trackingEnabled"),
      reminderEnabled: formBoolean(formData, "reminderEnabled")
    });

    const { error } = await supabase.from("activities").insert({
      user_id: user.id,
      name: parsed.name,
      category: parsed.category,
      start_time: parsed.startTime,
      duration_minutes: parsed.durationMinutes,
      repeat_rule: parsed.repeatRule,
      enabled: parsed.enabled,
      tracking_enabled: parsed.trackingEnabled,
      reminder_enabled: parsed.reminderEnabled
    });

    if (error) throw new Error(error.message);
    revalidateActivities();
    redirectWithMessage(path, "success", "Activity added.");
  } catch (error) {
    redirectWithMessage(path, "error", errorMessage(error));
  }
}

export async function toggleActivityAction(formData: FormData) {
  const path = returnTo(formData, "/settings");
  try {
    const { supabase, user } = await requireUser();
    const id = parseId(formData);
    const enabled = formBoolean(formData, "enabled");
    const { error } = await supabase
      .from("activities")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidateActivities();
    redirectWithMessage(
      path,
      "success",
      enabled ? "Activity enabled." : "Activity disabled."
    );
  } catch (error) {
    redirectWithMessage(path, "error", errorMessage(error));
  }
}

export async function markActivityCompletedAction(formData: FormData) {
  const path = returnTo(formData, "/home");
  try {
    const { supabase, user } = await requireUser();
    const activityId = parseId(formData, "activityId");
    const date = formString(formData, "date");
    if (!date) throw new Error("Missing date.");

    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .select("id")
      .eq("id", activityId)
      .eq("user_id", user.id)
      .single();

    if (activityError || !activity) throw new Error("Activity not found.");

    const { error } = await supabase.from("activity_history").upsert(
      {
        user_id: user.id,
        activity_id: activityId,
        date,
        status: "COMPLETED",
        completed_at: new Date().toISOString()
      },
      { onConflict: "user_id,activity_id,date" }
    );

    if (error) throw new Error(error.message);
    revalidateActivities();
    redirectWithMessage(path, "success", "Activity completed.");
  } catch (error) {
    redirectWithMessage(path, "error", errorMessage(error));
  }
}

export async function deleteActivityAction(formData: FormData) {
  const path = returnTo(formData, "/settings");
  try {
    const { supabase, user } = await requireUser();
    const id = parseId(formData);
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidateActivities();
    redirectWithMessage(path, "success", "Activity deleted.");
  } catch (error) {
    redirectWithMessage(path, "error", errorMessage(error));
  }
}

function revalidateActivities() {
  revalidatePath("/home");
  revalidatePath("/settings");
  revalidatePath("/calendar");
  revalidatePath("/insights");
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}
