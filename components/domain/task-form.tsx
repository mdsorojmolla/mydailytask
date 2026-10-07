"use client";

import { createTaskAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { todayISO, weekStartISO } from "@/lib/utils/dates";

export function TaskForm({
  returnTo = "/tasks",
  compact = false
}: {
  returnTo?: string;
  compact?: boolean;
}) {
  const today = todayISO();
  const weekStart = weekStartISO(new Date());

  return (
    <form action={createTaskAction} className="space-y-4">
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className={compact ? "space-y-3" : "grid gap-4 md:grid-cols-2"}>
        <Field label="Task">
          <TextInput name="title" placeholder="Complete C assignment" required />
        </Field>
        <Field label="Priority">
          <SelectInput name="priority" defaultValue="MEDIUM">
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </SelectInput>
        </Field>
        <Field label="Scope">
          <SelectInput name="scope" defaultValue="DAILY">
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
          </SelectInput>
        </Field>
        <Field label="Date">
          <TextInput name="date" type="date" defaultValue={today} />
        </Field>
        <input type="hidden" name="weekStart" value={weekStart} />
        <Field label="Start">
          <TextInput name="startTime" type="time" />
        </Field>
        <Field label="End">
          <TextInput name="endTime" type="time" />
        </Field>
        <Field label="Category">
          <TextInput name="category" placeholder="Study" />
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
      {!compact ? (
        <Field label="Notes">
          <TextArea name="description" placeholder="Optional details" />
        </Field>
      ) : null}
      <Button type="submit" tone="primary">
        Add Task
      </Button>
    </form>
  );
}
