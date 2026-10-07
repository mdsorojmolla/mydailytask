import { deleteClassAction, toggleClassAction } from "@/app/actions/routine";
import { PageMessage } from "@/components/domain/message";
import { RoutineUploadForm } from "@/components/domain/routine-upload-form";
import { ClassForm } from "@/components/domain/class-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status";
import { getRoutinePageData } from "@/lib/data";
import type { UniversityClass } from "@/lib/domain";
import { DAY_NAMES, formatTime, holidayRepeatLabel } from "@/lib/utils/dates";

export default async function RoutinePage({
  searchParams
}: {
  searchParams: { error?: string; success?: string };
}) {
  const { routine, classes, holidays } = await getRoutinePageData();

  return (
    <>
      <PageMessage error={searchParams.error} success={searchParams.success} />
      <header className="mb-8">
        <p className="text-sm font-medium text-muted">Current Routine</p>
        <h1 className="mt-1 text-3xl font-semibold">
          {routine.name}
          {routine.term ? ` · ${routine.term}` : ""}
        </h1>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {classes.length === 0 ? (
            <EmptyState
              title="Set up your university routine to build your daily schedule."
              actionLabel="Add Class"
              href="#add-class"
            />
          ) : (
            <RoutineList classes={classes} />
          )}
        </div>
        <aside className="space-y-6">
          <section id="add-class" className="border-y border-line py-5">
            <h2 className="mb-4 text-lg font-semibold">Add Class</h2>
            <ClassForm returnTo="/routine" />
          </section>
          <section className="border-b border-line pb-5">
            <h2 className="mb-4 text-lg font-semibold">Routine Upload</h2>
            <RoutineUploadForm />
          </section>
          <section>
            <h2 className="text-lg font-semibold">Holidays</h2>
            <div className="mt-3 space-y-2">
              {holidays.length === 0 ? (
                <p className="text-sm text-muted">No holidays added.</p>
              ) : (
                holidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="rounded-md border border-line bg-white px-3 py-2 text-sm"
                  >
                    <p className="font-semibold">{holiday.name}</p>
                    <p className="text-muted">
                      {holiday.date} · {holidayRepeatLabel(holiday.repeatRule)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </section>
    </>
  );
}

function RoutineList({ classes }: { classes: UniversityClass[] }) {
  return (
    <div className="space-y-7">
      {DAY_NAMES.map((day, dayIndex) => {
        const dayClasses = classes.filter((item) => item.dayOfWeek === dayIndex);
        if (dayClasses.length === 0) return null;
        return (
          <section key={day} className="border-t border-line pt-4">
            <h2 className="text-lg font-semibold">{day}</h2>
            <ol className="mt-3 divide-y divide-line border-y border-line">
              {dayClasses.map((item) => (
                <li
                  key={item.id}
                  className="grid gap-3 py-4 md:grid-cols-[130px_1fr_auto] md:items-center"
                >
                  <p className="text-sm font-medium text-muted">
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </p>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{item.courseName}</h3>
                      <StatusPill status={item.enabled ? "SCHEDULED" : "DISABLED"} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {[item.room, item.teacher].filter(Boolean).join(" · ") ||
                        "No room or teacher set"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <form action={toggleClassAction}>
                      <input type="hidden" name="returnTo" value="/routine" />
                      <input type="hidden" name="id" value={item.id} />
                      <input
                        type="hidden"
                        name="enabled"
                        value={item.enabled ? "false" : "true"}
                      />
                      <Button type="submit" tone="secondary">
                        {item.enabled ? "Disable" : "Enable"}
                      </Button>
                    </form>
                    <form action={deleteClassAction}>
                      <input type="hidden" name="returnTo" value="/routine" />
                      <input type="hidden" name="id" value={item.id} />
                      <Button type="submit" tone="danger">
                        Delete
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
