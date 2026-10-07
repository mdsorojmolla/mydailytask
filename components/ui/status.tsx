import { BookOpen, Briefcase, Calendar, Check, GraduationCap, Sparkles } from "lucide-react";
import type { Priority, ScheduledItemType, TaskStatus } from "@/lib/domain";

export function PriorityPill({ priority }: { priority: Priority }) {
  const styles = {
    HIGH: "bg-rose-50 text-rose-600 border border-rose-100",
    MEDIUM: "bg-amber-50 text-amber-600 border border-amber-100",
    LOW: "bg-slate-100/80 text-slate-600 border border-slate-200/60"
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[priority]}`}>
      {priority}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const complete = status === "COMPLETED";
  const inProgress = status === "IN_PROGRESS";
  const cancelled = status === "CANCELLED" || status === "SKIPPED";
  
  if (complete) {
    return (
      <span className="inline-flex items-center rounded-full bg-[#EEECFE] px-3 py-0.5 text-[11px] font-bold text-[#5B4DFB]">
        Done
      </span>
    );
  }

  if (inProgress) {
    return (
      <span className="inline-flex items-center rounded-full bg-[#FFF3E8] px-3 py-0.5 text-[11px] font-bold text-[#FF8A34]">
        In Progress
      </span>
    );
  }

  if (cancelled) {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-0.5 text-[11px] font-bold text-rose-500 line-through">
        Canceled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-[#EEF7FE] px-3 py-0.5 text-[11px] font-bold text-[#3B82F6]">
      To-do
    </span>
  );
}

export function CategoryIconBadge({ type }: { type: ScheduledItemType }) {
  switch (type) {
    case "TASK":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-50 text-pink-500 shadow-xs">
          <Briefcase className="h-4 w-4" />
        </span>
      );
    case "CLASS":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEECFE] text-[#5B4DFB] shadow-xs">
          <GraduationCap className="h-4 w-4" />
        </span>
      );
    case "ACTIVITY":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500 shadow-xs">
          <Sparkles className="h-4 w-4" />
        </span>
      );
    case "HOLIDAY":
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-500 shadow-xs">
          <Calendar className="h-4 w-4" />
        </span>
      );
  }
}

export function TypePill({ type }: { type: ScheduledItemType }) {
  const styles = {
    CLASS: "bg-[#EEECFE] text-[#5B4DFB]",
    TASK: "bg-pink-50 text-pink-600",
    ACTIVITY: "bg-amber-50 text-amber-600",
    HOLIDAY: "bg-rose-50 text-rose-600"
  };
  const labels = {
    CLASS: "Class",
    TASK: "Task",
    ACTIVITY: "Routine",
    HOLIDAY: "Holiday"
  };

  return (
    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

export function taskActionLabel(status: TaskStatus) {
  if (status === "NOT_STARTED") return "Start";
  if (status === "IN_PROGRESS") return "Complete";
  return "Done";
}
