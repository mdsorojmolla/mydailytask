"use client";

import { createClassAction } from "@/app/actions/routine";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextInput } from "@/components/ui/field";
import { DAY_NAMES } from "@/lib/utils/dates";

export function ClassForm({
  returnTo = "/routine",
  compact = false
}: {
  returnTo?: string;
  compact?: boolean;
}) {
  return (
    <form action={createClassAction} className="space-y-4">
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className={compact ? "space-y-3" : "grid gap-4 md:grid-cols-2"}>
        <Field label="Course">
          <TextInput name="courseName" placeholder="Database Systems" required />
        </Field>
        <Field label="Day">
          <SelectInput name="dayOfWeek" defaultValue="0">
            {DAY_NAMES.map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Start">
          <TextInput name="startTime" type="time" required />
        </Field>
        <Field label="End">
          <TextInput name="endTime" type="time" required />
        </Field>
        <Field label="Room">
          <TextInput name="room" placeholder="Room 402" />
        </Field>
        <Field label="Teacher">
          <TextInput name="teacher" placeholder="Teacher name" />
        </Field>
        <label className="flex min-h-10 items-center gap-2 text-sm font-medium">
          <input
            name="reminderEnabled"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 accent-accent"
          />
          Reminder
        </label>
      </div>
      <Button type="submit" tone="primary">
        Add Class
      </Button>
    </form>
  );
}
