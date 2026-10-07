"use server";

import { revalidatePath } from "next/cache";
import { requireUser, getOrCreateActiveRoutine } from "@/lib/data";
import { createClassSchema, formBoolean, formString } from "@/lib/validation";
import { parseId, redirectWithMessage, returnTo } from "@/app/actions/helpers";

export async function createClassAction(formData: FormData) {
  const path = returnTo(formData, "/routine");
  try {
    const { supabase, user } = await requireUser();
    const routine = await getOrCreateActiveRoutine(supabase, user.id);
    const parsed = createClassSchema.parse({
      courseName: formString(formData, "courseName"),
      teacher: formString(formData, "teacher"),
      room: formString(formData, "room"),
      dayOfWeek: formString(formData, "dayOfWeek"),
      startTime: formString(formData, "startTime"),
      endTime: formString(formData, "endTime"),
      reminderEnabled: formBoolean(formData, "reminderEnabled")
    });

    const { error } = await supabase.from("classes").insert({
      user_id: user.id,
      routine_id: routine.id,
      course_name: parsed.courseName,
      teacher: parsed.teacher,
      room: parsed.room,
      day_of_week: parsed.dayOfWeek,
      start_time: parsed.startTime,
      end_time: parsed.endTime,
      reminder_enabled: parsed.reminderEnabled
    });

    if (error) throw new Error(error.message);
    revalidateRoutine();
    redirectWithMessage(path, "success", "Class added.");
  } catch (error) {
    redirectWithMessage(path, "error", errorMessage(error));
  }
}

export async function toggleClassAction(formData: FormData) {
  const path = returnTo(formData, "/routine");
  try {
    const { supabase, user } = await requireUser();
    const id = parseId(formData);
    const enabled = formBoolean(formData, "enabled");
    const { error } = await supabase
      .from("classes")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidateRoutine();
    redirectWithMessage(path, "success", enabled ? "Class enabled." : "Class disabled.");
  } catch (error) {
    redirectWithMessage(path, "error", errorMessage(error));
  }
}

export async function cancelClassOccurrenceAction(formData: FormData) {
  const path = returnTo(formData, "/home");
  try {
    const { supabase, user } = await requireUser();
    const classId = parseId(formData, "classId");
    const date = formString(formData, "date");
    if (!date) throw new Error("Missing date.");

    const { data: klass, error: classError } = await supabase
      .from("classes")
      .select("id")
      .eq("id", classId)
      .eq("user_id", user.id)
      .single();

    if (classError || !klass) throw new Error("Class not found.");

    const { error } = await supabase.from("class_exceptions").upsert(
      {
        user_id: user.id,
        class_id: classId,
        date,
        status: "CANCELLED",
        note: formString(formData, "note")
      },
      { onConflict: "user_id,class_id,date" }
    );

    if (error) throw new Error(error.message);
    revalidateRoutine();
    redirectWithMessage(path, "success", "Class cancelled for this date.");
  } catch (error) {
    redirectWithMessage(path, "error", errorMessage(error));
  }
}

export async function deleteClassAction(formData: FormData) {
  const path = returnTo(formData, "/routine");
  try {
    const { supabase, user } = await requireUser();
    const id = parseId(formData);
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidateRoutine();
    redirectWithMessage(path, "success", "Class deleted.");
  } catch (error) {
    redirectWithMessage(path, "error", errorMessage(error));
  }
}

function revalidateRoutine() {
  revalidatePath("/home");
  revalidatePath("/routine");
  revalidatePath("/calendar");
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}
