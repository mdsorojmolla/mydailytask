import type { Priority, ScheduledItemType, TaskStatus } from "@/lib/domain";

export function PriorityPill({ priority }: { priority: Priority }) {
  const styles = {
    HIGH: "border-warning/30 bg-[#fbf1df] text-warning",
    MEDIUM: "border-accent/25 bg-accentSoft text-accent",
    LOW: "border-line bg-white text-muted"
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${styles[priority]}`}>
      {priority}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const complete = status === "COMPLETED";
  const cancelled = status === "CANCELLED" || status === "SKIPPED";
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
        complete
          ? "border-accent/30 bg-accentSoft text-accent"
          : cancelled
            ? "border-danger/25 bg-danger/5 text-danger"
            : "border-line bg-white text-muted"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function TypePill({ type }: { type: ScheduledItemType }) {
  return (
    <span className="rounded-full border border-line bg-white px-2 py-0.5 text-xs font-semibold text-muted">
      {type}
    </span>
  );
}

export function taskActionLabel(status: TaskStatus) {
  if (status === "NOT_STARTED") return "Start Task";
  if (status === "IN_PROGRESS") return "Mark Complete";
  return "Update Task";
}
