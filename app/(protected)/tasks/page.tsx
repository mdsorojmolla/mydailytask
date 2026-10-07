import { MoreHorizontal } from "lucide-react";
import { deleteTaskAction, rescheduleTaskAction, setTaskStatusAction } from "@/app/actions/tasks";
import { PageMessage } from "@/components/domain/message";
import { TaskForm } from "@/components/domain/task-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, TextInput } from "@/components/ui/field";
import { PriorityPill, StatusPill } from "@/components/ui/status";
import { getTasksPageData } from "@/lib/data";
import type { Task } from "@/lib/domain";
import { formatTime } from "@/lib/utils/dates";

export default async function TasksPage({
  searchParams
}: {
  searchParams: { error?: string; success?: string };
}) {
  const { daily, weekly } = await getTasksPageData();

  return (
    <>
      <PageMessage error={searchParams.error} success={searchParams.success} />
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Tasks</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Plan daily tasks, keep weekly commitments visible, and reschedule
          unfinished work without recreating it.
        </p>
      </header>

      <section className="border-y border-line py-6">
        <h2 className="mb-4 text-lg font-semibold">Add Task</h2>
        <TaskForm returnTo="/tasks" />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Daily Tasks</h2>
        <div className="mt-4">
          {daily.length === 0 ? (
            <EmptyState title="No daily tasks planned." actionLabel="Add Task" href="#top" />
          ) : (
            <TaskList tasks={daily} />
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">This Week</h2>
        <div className="mt-4">
          {weekly.length === 0 ? (
            <EmptyState title="No weekly tasks yet." />
          ) : (
            <TaskList tasks={weekly} />
          )}
        </div>
      </section>
    </>
  );
}

function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ol className="divide-y divide-line border-y border-line">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="grid gap-3 py-4 md:grid-cols-[120px_1fr_auto] md:items-center"
        >
          <div className="text-sm font-medium text-muted">
            {task.date ?? "This week"}
            <br />
            {formatTime(task.startTime)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{task.title}</h3>
              <PriorityPill priority={task.priority} />
              <StatusPill status={task.status} />
            </div>
            {task.description ? (
              <p className="mt-1 text-sm text-muted">{task.description}</p>
            ) : null}
          </div>
          <TaskControls task={task} />
        </li>
      ))}
    </ol>
  );
}

function TaskControls({ task }: { task: Task }) {
  const inactive = ["COMPLETED", "CANCELLED", "SKIPPED"].includes(task.status);
  const nextStatus = task.status === "IN_PROGRESS" ? "COMPLETED" : "IN_PROGRESS";
  const label = task.status === "IN_PROGRESS" ? "Complete" : "Start";

  return (
    <div className="flex flex-wrap gap-2 md:justify-end">
      {!inactive ? (
        <form action={setTaskStatusAction}>
          <input type="hidden" name="returnTo" value="/tasks" />
          <input type="hidden" name="id" value={task.id} />
          <input type="hidden" name="status" value={nextStatus} />
          <Button type="submit" tone="primary">
            {label}
          </Button>
        </form>
      ) : null}
      <details className="relative">
        <summary className="focus-ring inline-flex min-h-10 cursor-pointer list-none items-center rounded-md border border-line bg-white px-3 text-sm font-semibold text-muted hover:text-ink">
          <MoreHorizontal aria-hidden="true" size={18} />
          <span className="sr-only">Task menu</span>
        </summary>
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-md border border-line bg-white p-3 shadow-soft">
          <form action={rescheduleTaskAction} className="space-y-3">
            <input type="hidden" name="returnTo" value="/tasks" />
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
            <Button type="submit" tone="secondary" className="w-full">
              Reschedule
            </Button>
          </form>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <StatusButton task={task} status="SKIPPED" label="Skip" />
            <StatusButton task={task} status="CANCELLED" label="Cancel" />
            <form action={deleteTaskAction}>
              <input type="hidden" name="returnTo" value="/tasks" />
              <input type="hidden" name="id" value={task.id} />
              <Button type="submit" tone="danger" className="w-full">
                Delete
              </Button>
            </form>
          </div>
        </div>
      </details>
    </div>
  );
}

function StatusButton({
  task,
  status,
  label
}: {
  task: Task;
  status: string;
  label: string;
}) {
  return (
    <form action={setTaskStatusAction}>
      <input type="hidden" name="returnTo" value="/tasks" />
      <input type="hidden" name="id" value={task.id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" tone="ghost" className="w-full">
        {label}
      </Button>
    </form>
  );
}
