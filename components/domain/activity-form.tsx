"use client";

import { createActivityAction } from "@/app/actions/activities";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextInput } from "@/components/ui/field";

export function ActivityForm({
  returnTo = "/settings",
  compact = false
}: {
  returnTo?: string;
  compact?: boolean;
}) {
  return (
    <form action={createActivityAction} className="space-y-4">
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className={compact ? "space-y-3" : "grid gap-4 md:grid-cols-2"}>
        <Field label="Activity">
          <TextInput name="name" placeholder="Breakfast" required />
        </Field>
        <Field label="Category">
          <TextInput name="category" defaultValue="Personal" required />
        </Field>
        <Field label="Start">
          <TextInput name="startTime" type="time" required />
        </Field>
        <Field label="Duration">
          <TextInput
            name="durationMinutes"
            type="number"
            min="5"
            max="480"
            defaultValue="30"
            required
          />
        </Field>
        <Field label="Repeat">
          <SelectInput name="repeatRule" defaultValue="DAILY">
            <option value="DAILY">Every day</option>
            <option value="WEEKDAYS">Weekdays</option>
            <option value="WEEKENDS">Weekends</option>
          </SelectInput>
        </Field>
        <div className="grid gap-2 text-sm font-medium">
          <label className="flex items-center gap-2">
            <input
              name="enabled"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-accent"
            />
            Enabled
          </label>
          <label className="flex items-center gap-2">
            <input
              name="trackingEnabled"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-accent"
            />
            Tracking
          </label>
          <label className="flex items-center gap-2">
            <input
              name="reminderEnabled"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-accent"
            />
            Reminder
          </label>
        </div>
      </div>
      <Button type="submit" tone="primary">
        Add Activity
      </Button>
    </form>
  );
}
