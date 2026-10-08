"use client";

import { createHolidayAction } from "@/app/actions/holidays";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { todayISO } from "@/lib/utils/dates";

export function HolidayForm({
  returnTo = "/calendar",
  compact = false,
  defaultDate
}: {
  returnTo?: string;
  compact?: boolean;
  defaultDate?: string;
}) {
  return (
    <form action={createHolidayAction} className="space-y-4">
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className={compact ? "space-y-3" : "grid gap-4 md:grid-cols-2"}>
        <Field label="Holiday">
          <TextInput name="name" placeholder="University Holiday" required />
        </Field>
        <Field label="Date">
          <TextInput name="date" type="date" defaultValue={defaultDate ?? todayISO()} required />
        </Field>
        <Field label="Repeat">
          <SelectInput name="repeatRule" defaultValue="NONE">
            <option value="NONE">One time</option>
            <option value="YEARLY">Every year</option>
          </SelectInput>
        </Field>
        <label className="flex min-h-10 items-center gap-2 text-sm font-medium">
          <input
            name="affectsClasses"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 accent-accent"
          />
          Affects classes
        </label>
      </div>
      {!compact ? (
        <Field label="Description">
          <TextArea name="description" placeholder="Optional details" />
        </Field>
      ) : null}
      <Button type="submit" tone="primary">
        Add Holiday
      </Button>
    </form>
  );
}
