"use server";

import { revalidatePath } from "next/cache";
import type { TaskStatus } from "@/lib/domain";
import { requireUser } from "@/lib/data";
import { weekStartISO } from "@/lib/utils/dates";
import {
  createTaskSchema,
  formBoolean,
  formString,
  rescheduleTaskSchema,
  taskStatusSchema
} from "@/lib/validation";
import { parseId, redirectWithMessage, returnTo } from "@/app/actions/helpers";

export async function createTaskAction(formData: FormData) {
  const path = returnTo(formData, "/tasks");
  try {
    const { supabase, user } = await requireUser();
    const date = formString(formData, "date");
    const scope = (formString(formData, "scope") ?? "DAILY") as "DAILY" | "WEEKLY";
    const parsed = createTaskSchema.parse({
      title: formString(formData, "title"),
      description: formString(formData, "description"),
      scope,
      date: scope === "DAILY" ? date : formString(formData, "scheduledDate"),
      weekStart:
        scope === "WEEKLY"
          ? formString(formData, "weekStart") ??
            weekStartISO(date ? new Date(`${date}T00:00:00`) : new Date())
          : null,
      startTime: formString(formData, "startTime"),
      endTime: formString(formData, "endTime"),
      priority: formString(formData, "priority") ?? "MEDIUM",
      category: formString(formData, "category"),
      reminderEnabled: formBoolean(formData, "reminderEnabled")
    });

    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: parsed.title,
      description: parsed.description,
      scope: parsed.scope,
      date: parsed.date,
      week_start: parsed.weekStart,
      start_time: parsed.startTime,
      end_time: parsed.endTime,
      priority: parsed.priority,
      category: parsed.category,
      reminder_enabled: parsed.reminderEnabled
    });

    if (error) throw new Error(error.message);
    revalidateEverywhere();
    redirectWithMessage(path, "success", "Task added.");
  } catch (error) {
    redirectWithMessage(path, "error", errorMessage(error));
  }
}

export async function setTaskStatusAction(formData: FormData) {
  const path = returnTo(formData, "/tasks");
  try {
    const { supabase, user } = await requireUser();
    const id = parseId(formData);
    const status = taskStatusSchema.parse(formString(formData, "status"));

    const { data: current, error: currentError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (currentError) throw new Error(currentError.message);

    const timestamps = statusTimestamps(status);
    const { error } = await supabase
      .from("tasks")
      .update({
        status,
        ...timestamps,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    await supabase.from("task_history").insert({
      user_id: user.id,
      task_id: id,
      action: `STATUS_${status}`,
      from_status: current.status,
      to_status: status,
      from_date: current.date,
      to_date: current.date
    });

    revalidateEverywhere();
    redirectWithMessage(path, "success", taskStatusMessage(status));
  } catch (error) {
    redirectWithMessage(path, "error", errorMessage(error));
  }
}

export async function rescheduleTaskAction(formData: FormData) {
  const path = returnTo(formData, "/tasks");
  try {
    const { supabase, user } = await requireUser();
    const parsed = rescheduleTaskSchema.parse({
      id: parseId(formData),
      date: formString(formData, "date"),
      startTime: formString(formData, "startTime"),
      endTime: formString(formData, "endTime")
    });

    const { data: current, error: currentError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", parsed.id)
      .eq("user_id", user.id)
      .single();

    if (currentError) throw new Error(currentError.message);

    const { error } = await supabase
      .from("tasks")
      .update({
        scope: "DAILY",
        date: parsed.date,
        start_time: parsed.startTime,
        end_time: parsed.endTime,
        status:
          current.status === "SKIPPED" || current.status === "CANCELLED"
            ? "NOT_STARTED"
            : current.status,
        updated_at: new Date().toISOString()
      })
      .eq("id", parsed.id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    await supabase.from("task_history").insert({
      user_id: user.id,
      task_id: parsed.id,
      action: "RESCHEDULED",
      from_status: current.status,
      to_status: current.status,
      from_date: current.date,
      to_date: parsed.date
    });

    revalidateEverywhere();
    redirectWithMessage(path, "success", "Task rescheduled.");
  } catch (error) {
    redirectWithMessage(path, "error", errorMessage(error));
  }
}

export async function deleteTaskAction(formData: FormData) {
  const path = returnTo(formData, "/tasks");
  try {
    const { supabase, user } = await requireUser();
    const id = parseId(formData);
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidateEverywhere();
    redirectWithMessage(path, "success", "Task deleted.");
  } catch (error) {
    redirectWithMessage(path, "error", errorMessage(error));
  }
}

function statusTimestamps(status: TaskStatus) {
  const now = new Date().toISOString();
  if (status === "IN_PROGRESS") return { started_at: now };
  if (status === "COMPLETED") return { completed_at: now };
  if (status === "NOT_STARTED") {
    return { started_at: null, completed_at: null };
  }
  return {};
}

function taskStatusMessage(status: TaskStatus) {
  if (status === "IN_PROGRESS") return "Task started.";
  if (status === "COMPLETED") return "Task completed.";
  if (status === "SKIPPED") return "Task skipped.";
  if (status === "CANCELLED") return "Task cancelled.";
  return "Task updated.";
}

function revalidateEverywhere() {
  revalidatePath("/home");
  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/insights");
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}
