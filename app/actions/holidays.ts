"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/data";
import { createHolidaySchema, formBoolean, formString } from "@/lib/validation";
import {
  errorMessage,
  parseId,
  redirectWithMessage,
  returnTo,
  rethrowIfRedirect
} from "@/app/actions/helpers";

export async function createHolidayAction(formData: FormData) {
  const path = returnTo(formData, "/calendar");
  try {
    const { supabase, user } = await requireUser();
    const parsed = createHolidaySchema.parse({
      name: formString(formData, "name"),
      date: formString(formData, "date"),
      description: formString(formData, "description"),
      repeatRule: formString(formData, "repeatRule") ?? "NONE",
      affectsClasses: formBoolean(formData, "affectsClasses")
    });

    const { error } = await supabase.from("holidays").insert({
      user_id: user.id,
      name: parsed.name,
      date: parsed.date,
      description: parsed.description,
      repeat_rule: parsed.repeatRule,
      affects_classes: parsed.affectsClasses
    });

    if (error) throw new Error(error.message);
    revalidateHolidays();
  } catch (error) {
    rethrowIfRedirect(error);
    redirectWithMessage(path, "error", errorMessage(error));
  }
  redirectWithMessage(path, "success", "Holiday added.");
}

export async function deleteHolidayAction(formData: FormData) {
  const path = returnTo(formData, "/calendar");
  try {
    const { supabase, user } = await requireUser();
    const id = parseId(formData);
    const { error } = await supabase
      .from("holidays")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    revalidateHolidays();
  } catch (error) {
    rethrowIfRedirect(error);
    redirectWithMessage(path, "error", errorMessage(error));
  }
  redirectWithMessage(path, "success", "Holiday deleted.");
}

function revalidateHolidays() {
  revalidatePath("/home");
  revalidatePath("/routine");
  revalidatePath("/calendar");
}
