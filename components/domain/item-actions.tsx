import { Check, Minus, MoreHorizontal } from "lucide-react";
import type { ScheduledItem } from "@/lib/domain";
import { markActivityCompletedAction } from "@/app/actions/activities";
import { cancelClassOccurrenceAction } from "@/app/actions/routine";
import { rescheduleTaskAction, setTaskStatusAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";

export function TaskCheckbox({
  item,
  returnTo
}: {
  item: ScheduledItem;
  returnTo: string;
}) {
  if (item.type !== "TASK") return null;
  const isCompleted = item.completed || item.status === "COMPLETED";
  const isInProgress = item.status === "IN_PROGRESS";
  const isCancelled = item.cancelled;

  if (isCompleted) {
    return (
      <div
        title="Completed"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5B4DFB] text-white shadow-xs"
      >
        <Check size={12} strokeWidth={2.8} />
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div
        title="Cancelled"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-400"
      >
        <Minus size={11} strokeWidth={2} />
      </div>
    );
  }

  const nextStatus = isInProgress ? "COMPLETED" : "IN_PROGRESS";
  const ariaLabel = isInProgress ? "Mark complete" : "Start task";

  return (
    <form action={setTaskStatusAction} className="shrink-0 inline-flex">
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="id" value={item.sourceId} />
      <input type="hidden" name="status" value={nextStatus} />
      <button
        type="submit"
        aria-label={ariaLabel}
        className={`focus-ring flex h-5 w-5 items-center justify-center rounded-full border transition-all active:scale-90 touch-manipulation ${
          isInProgress
            ? "border-[#5B4DFB] bg-[#EEECFE] text-[#5B4DFB] ring-2 ring-[#EEECFE]"
            : "border-slate-300 bg-white hover:border-[#5B4DFB]"
        }`}
      >
        {isInProgress ? <div className="h-2 w-2 rounded-full bg-[#5B4DFB]" /> : null}
      </button>
    </form>
  );
}

export function ScheduledItemActions({
  item,
  date,
  returnTo
}: {
  item: ScheduledItem;
  date: string;
  returnTo: string;
}) {
  if (item.type === "TASK") {
    return <TaskActions item={item} returnTo={returnTo} />;
  }

  if (item.type === "CLASS" && !item.cancelled) {
    return (
      <form action={cancelClassOccurrenceAction}>
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="classId" value={item.sourceId} />
        <input type="hidden" name="date" value={date} />
        <Button
          type="submit"
          tone="ghost"
          className="text-xs font-medium text-stone-500 hover:text-red-700 hover:bg-red-50 py-1 px-2.5 min-h-8 sm:min-h-8 border border-transparent hover:border-red-200"
        >
          Cancel class
        </Button>
      </form>
    );
  }

  if (item.type === "ACTIVITY" && item.trackable && !item.completed) {
    return (
      <form action={markActivityCompletedAction}>
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="activityId" value={item.sourceId} />
        <input type="hidden" name="date" value={date} />
        <Button
          type="submit"
          tone="secondary"
          className="text-xs font-semibold py-1 px-2.5 min-h-8 sm:min-h-8 border-line hover:border-accent text-accent"
        >
          Mark Done
        </Button>
      </form>
    );
  }

  return null;
}

function TaskActions({
  item,
  returnTo
}: {
  item: ScheduledItem;
  returnTo: string;
}) {
  const status = item.status;

  if (status === "COMPLETED" || status === "CANCELLED" || status === "SKIPPED") {
    return null;
  }

  const primaryStatus = status === "IN_PROGRESS" ? "COMPLETED" : "IN_PROGRESS";
  const primaryLabel = status === "IN_PROGRESS" ? "Mark Complete" : "Start Task";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={setTaskStatusAction}>
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="id" value={item.sourceId} />
        <input type="hidden" name="status" value={primaryStatus} />
        <Button type="submit" tone="primary">
          {primaryLabel}
        </Button>
      </form>
      <details className="relative">
        <summary className="focus-ring inline-flex min-h-11 sm:min-h-10 cursor-pointer list-none items-center rounded-lg border border-line bg-white px-3 text-sm font-semibold text-muted hover:text-ink active:scale-95 transition-all touch-manipulation select-none">
          <MoreHorizontal aria-hidden="true" size={20} />
          <span className="sr-only">More task actions</span>
        </summary>
        <div className="absolute right-0 z-20 mt-2 w-72 max-w-[calc(100vw-2.5rem)] rounded-xl border border-line bg-white p-3.5 shadow-xl">
          <div className="flex gap-2">
            <StatusForm
              id={item.sourceId}
              status="SKIPPED"
              label="Skip"
              returnTo={returnTo}
            />
            <StatusForm
              id={item.sourceId}
              status="CANCELLED"
              label="Cancel"
              returnTo={returnTo}
            />
          </div>
          <form action={rescheduleTaskAction} className="mt-3 space-y-3">
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="id" value={item.sourceId} />
            <Field label="Move to date">
              <TextInput name="date" type="date" required />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Start">
                <TextInput name="startTime" type="time" />
              </Field>
              <Field label="End">
                <TextInput name="endTime" type="time" />
              </Field>
            </div>
            <Button type="submit" tone="secondary" className="w-full">
              Reschedule
            </Button>
          </form>
        </div>
      </details>
    </div>
  );
}

function StatusForm({
  id,
  status,
  label,
  returnTo
}: {
  id: string;
  status: string;
  label: string;
  returnTo: string;
}) {
  return (
    <form action={setTaskStatusAction} className="flex-1">
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" tone={status === "CANCELLED" ? "danger" : "ghost"} className="w-full">
        {label}
      </Button>
    </form>
  );
}
