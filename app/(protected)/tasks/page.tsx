import Link from "next/link";
import { ArrowLeft, Bell, Briefcase, Check, Clock, Filter, MoreHorizontal, Plus } from "lucide-react";
import { deleteTaskAction, rescheduleTaskAction, setTaskStatusAction } from "@/app/actions/tasks";
import { DateStrip } from "@/components/domain/date-strip";
import { PageMessage } from "@/components/domain/message";
import { TaskForm } from "@/components/domain/task-form";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { CategoryIconBadge, PriorityPill, StatusPill } from "@/components/ui/status";
import { getTasksPageData } from "@/lib/data";
import type { Task, Priority } from "@/lib/domain";
import { formatTime, todayISO } from "@/lib/utils/dates";

export default async function TasksPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; success?: string; tab?: string; add?: string; date?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = params.date || todayISO();
  const currentFilter = params.filter ?? "all"; // all | todo | in_progress | completed
  const showAddForm = params.add === "true";
  const { tasks } = await getTasksPageData();

  // Filter tasks for selected date or weekly scope
  const dateTasks = tasks.filter((t) => {
    if (t.date) return t.date === selectedDate;
    return true; // unscheduled/weekly tasks appear in view
  });

  // Filter by status tab
  let displayedTasks: Task[] = [];
  if (currentFilter === "all") {
    displayedTasks = dateTasks;
  } else if (currentFilter === "todo") {
    displayedTasks = dateTasks.filter((t) => t.status === "NOT_STARTED");
  } else if (currentFilter === "in_progress") {
    displayedTasks = dateTasks.filter((t) => t.status === "IN_PROGRESS");
  } else if (currentFilter === "completed") {
    displayedTasks = dateTasks.filter((t) =>
      ["COMPLETED", "CANCELLED", "SKIPPED"].includes(t.status)
    );
  }

  const todoCount = dateTasks.filter((t) => t.status === "NOT_STARTED").length;
  const inProgressCount = dateTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completedCount = dateTasks.filter((t) => ["COMPLETED", "CANCELLED", "SKIPPED"].includes(t.status)).length;

  return (
    <div className="space-y-4">
      <PageMessage error={params.error} success={params.success} />

      {/* Top Header matching reference screenshot */}
      <header className="flex items-center justify-between gap-3">
        <Link
          href="/home"
          aria-label="Back to Home"
          className="focus-ring flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-card text-ink hover:text-[#5B4DFB] active:scale-95 transition-all"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </Link>

        <h1 className="text-xl font-extrabold tracking-tight text-ink">
          Today&apos;s Tasks
        </h1>

        <Link
          href="/settings"
          aria-label="Notifications"
          className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-card text-ink hover:text-[#5B4DFB] active:scale-95 transition-all"
        >
          <Bell size={18} strokeWidth={2.2} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#5B4DFB] ring-2 ring-white" />
        </Link>
      </header>

      {/* Week Date Strip Carousel */}
      <section aria-label="Date strip">
        <DateStrip selectedDate={selectedDate} basePath="/tasks" />
      </section>

      {/* Filter Segment Pills matching reference screenshot */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <Link
          href={`/tasks?date=${selectedDate}&filter=all`}
          className={`rounded-2xl px-5 py-2 text-xs font-bold transition-all duration-200 active:scale-95 whitespace-nowrap ${
            currentFilter === "all"
              ? "bg-[#5B4DFB] text-white shadow-glow"
              : "bg-[#EEECFE] text-[#5B4DFB] hover:bg-[#E3E0FE]"
          }`}
        >
          All
        </Link>
        <Link
          href={`/tasks?date=${selectedDate}&filter=todo`}
          className={`rounded-2xl px-5 py-2 text-xs font-bold transition-all duration-200 active:scale-95 whitespace-nowrap ${
            currentFilter === "todo"
              ? "bg-[#5B4DFB] text-white shadow-glow"
              : "bg-[#EEECFE] text-[#5B4DFB] hover:bg-[#E3E0FE]"
          }`}
        >
          To do {todoCount > 0 ? `(${todoCount})` : ""}
        </Link>
        <Link
          href={`/tasks?date=${selectedDate}&filter=in_progress`}
          className={`rounded-2xl px-5 py-2 text-xs font-bold transition-all duration-200 active:scale-95 whitespace-nowrap ${
            currentFilter === "in_progress"
              ? "bg-[#5B4DFB] text-white shadow-glow"
              : "bg-[#EEECFE] text-[#5B4DFB] hover:bg-[#E3E0FE]"
          }`}
        >
          In Progress {inProgressCount > 0 ? `(${inProgressCount})` : ""}
        </Link>
        <Link
          href={`/tasks?date=${selectedDate}&filter=completed`}
          className={`rounded-2xl px-5 py-2 text-xs font-bold transition-all duration-200 active:scale-95 whitespace-nowrap ${
            currentFilter === "completed"
              ? "bg-[#5B4DFB] text-white shadow-glow"
              : "bg-[#EEECFE] text-[#5B4DFB] hover:bg-[#E3E0FE]"
          }`}
        >
          Completed {completedCount > 0 ? `(${completedCount})` : ""}
        </Link>
      </div>

      {/* Quick Add Form drawer */}
      {showAddForm ? (
        <section className="rounded-2xl border border-[#EEECFE] bg-white p-5 shadow-card animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-sm font-bold tracking-tight text-ink">New Task</h2>
            <Link href={`/tasks?date=${selectedDate}`} className="text-xs text-muted hover:text-ink font-semibold">
              Cancel
            </Link>
          </div>
          <TaskForm returnTo={`/tasks?date=${selectedDate}`} compact />
        </section>
      ) : null}

      {/* Task Cards List */}
      {displayedTasks.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEECFE] text-[#5B4DFB] mb-3">
            <Check size={24} strokeWidth={2.5} />
          </div>
          <p className="text-base font-bold text-ink">
            {currentFilter === "all"
              ? "No tasks for this day"
              : currentFilter === "todo"
                ? "No pending to-do tasks"
                : currentFilter === "in_progress"
                  ? "No tasks currently in progress"
                  : "No completed tasks"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {currentFilter === "completed"
              ? "Completed tasks will show here."
              : "Create a task to stay on top of your schedule."}
          </p>
          <Link
            href={`/tasks?date=${selectedDate}&add=true`}
            className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#5B4DFB] px-4 py-2 text-xs font-bold text-white shadow-glow hover:bg-[#483AE3] active:scale-95 transition-all"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Add task</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedTasks.map((task) => (
            <TaskCardItem
              key={task.id}
              task={task}
              selectedDate={selectedDate}
              currentFilter={currentFilter}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCardItem({
  task,
  selectedDate,
  currentFilter
}: {
  task: Task;
  selectedDate: string;
  currentFilter: string;
}) {
  const isCompleted = task.status === "COMPLETED";
  const isInProgress = task.status === "IN_PROGRESS";
  const isCancelled = task.status === "CANCELLED" || task.status === "SKIPPED";
  const nextStatus = isInProgress ? "COMPLETED" : "IN_PROGRESS";
  const returnTo = `/tasks?date=${selectedDate}&filter=${currentFilter}`;

  // Context label: category or project or general
  const categoryLabel = task.category || "Daily task";

  return (
    <div
      className={`group relative rounded-2xl border border-slate-100/90 bg-white p-4 shadow-card transition-all duration-200 hover:shadow-soft active:scale-[0.99] ${
        isCancelled ? "opacity-60 bg-slate-50/80" : ""
      }`}
    >
      {/* Top Row: Category label on left, Category icon badge on right */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-semibold text-slate-400 truncate max-w-[220px]">
          {categoryLabel}
        </span>
        <CategoryIconBadge type="TASK" />
      </div>

      {/* Middle Row: Checkbox + Bold Title */}
      <div className="flex items-start gap-2.5 my-1">
        {/* Interactive Checkbox */}
        <div className="pt-0.5 shrink-0">
          {!isCancelled && !isCompleted ? (
            <form action={setTaskStatusAction} className="inline-flex">
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="id" value={task.id} />
              <input type="hidden" name="status" value={nextStatus} />
              <button
                type="submit"
                aria-label={isInProgress ? "Mark complete" : "Start task"}
                className={`focus-ring flex h-5 w-5 items-center justify-center rounded-full border transition-all active:scale-90 touch-manipulation ${
                  isInProgress
                    ? "border-[#5B4DFB] bg-[#EEECFE] text-[#5B4DFB] ring-2 ring-[#EEECFE]"
                    : "border-slate-300 bg-white hover:border-[#5B4DFB]"
                }`}
              >
                {isInProgress ? <div className="h-2 w-2 rounded-full bg-[#5B4DFB]" /> : null}
              </button>
            </form>
          ) : isCompleted ? (
            <div
              title="Completed"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5B4DFB] text-white shadow-xs"
            >
              <Check size={12} strokeWidth={2.8} />
            </div>
          ) : (
            <div
              title="Cancelled"
              className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-400 text-xs"
            >
              —
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={`text-[15px] sm:text-base font-bold leading-snug text-ink ${
              isCompleted ? "line-through text-muted" : ""
            }`}
          >
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-0.5 text-xs text-muted line-clamp-1">{task.description}</p>
          ) : null}
        </div>
      </div>

      {/* Bottom Row: Clock with time on left, Status badge + Actions on right */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-50 pt-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5B4DFB]">
          <Clock size={13} strokeWidth={2.2} />
          <span>
            {task.startTime ? formatTime(task.startTime) : "Anytime"}
            {task.endTime ? ` – ${formatTime(task.endTime)}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {task.priority ? <PriorityPill priority={task.priority} /> : null}
          <StatusPill status={task.status} />

          {/* Action Menu (Reschedule, Skip, Cancel, Delete) */}
          <details className="relative">
            <summary className="focus-ring inline-flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-slate-100 active:scale-95 transition-all select-none touch-manipulation">
              <MoreHorizontal size={15} />
              <span className="sr-only">Task options</span>
            </summary>
            <div className="absolute right-0 z-30 mt-2 w-72 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                Reschedule Task
              </p>
              <form action={rescheduleTaskAction} className="space-y-3">
                <input type="hidden" name="returnTo" value={returnTo} />
                <input type="hidden" name="id" value={task.id} />
                <Field label="Date">
                  <TextInput name="date" type="date" defaultValue={task.date ?? ""} required />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Start">
                    <TextInput name="startTime" type="time" defaultValue={task.startTime ?? ""} />
                  </Field>
                  <Field label="End">
                    <TextInput name="endTime" type="time" defaultValue={task.endTime ?? ""} />
                  </Field>
                </div>
                <Button type="submit" tone="primary" className="w-full text-xs font-bold min-h-9">
                  Save Schedule
                </Button>
              </form>

              <div className="mt-3 border-t border-slate-100 pt-2.5 grid grid-cols-3 gap-1.5">
                <form action={setTaskStatusAction}>
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <input type="hidden" name="id" value={task.id} />
                  <input type="hidden" name="status" value="SKIPPED" />
                  <Button type="submit" tone="ghost" className="w-full text-xs py-1 px-1.5 min-h-8">
                    Skip
                  </Button>
                </form>
                <form action={setTaskStatusAction}>
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <input type="hidden" name="id" value={task.id} />
                  <input type="hidden" name="status" value="CANCELLED" />
                  <Button type="submit" tone="ghost" className="w-full text-xs text-rose-600 hover:bg-rose-50 py-1 px-1.5 min-h-8">
                    Cancel
                  </Button>
                </form>
                <form action={deleteTaskAction}>
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <input type="hidden" name="id" value={task.id} />
                  <Button type="submit" tone="danger" className="w-full text-xs py-1 px-1.5 min-h-8">
                    Delete
                  </Button>
                </form>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
