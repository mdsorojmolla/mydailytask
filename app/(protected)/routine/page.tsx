import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, Clock, GraduationCap, MapPin, Plus, Upload, User } from "lucide-react";
import { deleteClassAction, toggleClassAction } from "@/app/actions/routine";
import { PageMessage } from "@/components/domain/message";
import { RoutineUploadForm } from "@/components/domain/routine-upload-form";
import { ClassForm } from "@/components/domain/class-form";
import { Button } from "@/components/ui/button";
import { CategoryIconBadge, StatusPill } from "@/components/ui/status";
import { getRoutinePageData } from "@/lib/data";
import type { UniversityClass } from "@/lib/domain";
import { DAY_NAMES, formatTime, holidayRepeatLabel } from "@/lib/utils/dates";

import { BatchSelectorModal } from "@/components/domain/batch-selector-modal";
import { AdminRoutineManager } from "@/components/domain/admin-routine-manager";

export default async function RoutinePage({
  searchParams
}: {
  searchParams: Promise<{
    error?: string;
    success?: string;
    day?: string;
    action?: string;
    changeBatch?: string;
    reviewVersionId?: string;
  }>;
}) {
  const params = await searchParams;
  const { user, settings, isAdmin, routine, classes, holidays, publishedRoutine, allVersions } =
    await getRoutinePageData();

  // Determine active day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const currentDayOfWeek = new Date().getDay();
  // Default to today if it's a weekday (1..5), else Monday (1)
  const defaultDayIndex = currentDayOfWeek >= 1 && currentDayOfWeek <= 5 ? currentDayOfWeek : 1;
  const selectedDay = params.day !== undefined ? (params.day === "all" ? "all" : parseInt(params.day, 10)) : defaultDayIndex;
  const showAddClass = params.action === "add";
  const isChangeBatch = params.changeBatch === "true";

  // Filter classes for selected day
  const displayedClasses =
    selectedDay === "all"
      ? classes
      : classes.filter((c) => c.dayOfWeek === selectedDay);

  // Group classes by day for "all" view
  const daysToDisplay =
    selectedDay === "all"
      ? [1, 2, 3, 4, 5, 6, 0]
      : [selectedDay as number];

  return (
    <div className="space-y-6">
      <PageMessage error={params.error} success={params.success} />

      {/* Routine Header matching reference screenshot */}
      <header className="flex items-center justify-between gap-3">
        <Link
          href="/home"
          aria-label="Back to Home"
          className="focus-ring flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-card text-ink hover:text-[#5B4DFB] active:scale-95 transition-all"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </Link>

        <h1 className="text-xl font-extrabold tracking-tight text-ink">
          Class Routine
        </h1>

        <div className="flex items-center gap-2">
          <Link
            href={showAddClass ? "/routine" : "/routine?action=add"}
            aria-label="Add class"
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5B4DFB] text-white shadow-glow active:scale-95 transition-all"
          >
            <Plus size={20} strokeWidth={2.5} />
          </Link>
        </div>
      </header>

      {/* Admin Central Routine Management: Only visible to mdsorojmolla20@gmail.com */}
      {isAdmin ? (
        <AdminRoutineManager
          publishedVersion={publishedRoutine.version}
          publishedBatches={publishedRoutine.batches}
          allVersions={allVersions}
          reviewVersionId={params.reviewVersionId}
        />
      ) : null}

      {/* Academic Batch Selection & Switcher for Students */}
      {publishedRoutine.batches.length > 0 ? (
        <BatchSelectorModal
          availableBatches={publishedRoutine.batches}
          currentBatch={settings.selectedBatch}
          returnTo="/routine"
          isChangeMode={isChangeBatch}
        />
      ) : null}

      {/* Drawer: Add Custom Class Form */}
      {showAddClass ? (
        <section className="rounded-2xl border border-[#EEECFE] bg-white p-5 shadow-card animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-sm font-bold tracking-tight text-ink">Add University Class</h2>
            <Link href="/routine" className="text-xs text-muted hover:text-ink font-semibold">
              Cancel
            </Link>
          </div>
          <ClassForm returnTo="/routine" />
        </section>
      ) : null}

      {/* Day Selector Tabs (Mon, Tue, Wed, Thu, Fri, Sat, Sun, All) */}
      <nav
        aria-label="Timetable Days"
        className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
      >
        {[
          { index: 1, label: "Mon", full: "Monday" },
          { index: 2, label: "Tue", full: "Tuesday" },
          { index: 3, label: "Wed", full: "Wednesday" },
          { index: 4, label: "Thu", full: "Thursday" },
          { index: 5, label: "Fri", full: "Friday" },
          { index: 6, label: "Sat", full: "Saturday" },
          { index: 0, label: "Sun", full: "Sunday" }
        ].map((day) => {
          const isToday = currentDayOfWeek === day.index;
          const isSelected = selectedDay === day.index;
          const dayCount = classes.filter((c) => c.dayOfWeek === day.index).length;

          return (
            <Link
              key={day.index}
              href={`/routine?day=${day.index}`}
              className={`focus-ring flex min-w-[58px] flex-1 flex-col items-center justify-center rounded-2xl py-2 px-1 text-center transition-all duration-200 active:scale-95 touch-manipulation select-none ${
                isSelected
                  ? "bg-[#5B4DFB] text-white shadow-glow"
                  : "bg-white text-ink border border-slate-100/90 shadow-card hover:border-accent/40"
              }`}
            >
              <div className="flex items-center gap-1">
                <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-ink"}`}>{day.label}</span>
                {isToday ? (
                  <span
                    title="Today"
                    className={`h-1.5 w-1.5 rounded-full ${
                      isSelected ? "bg-white" : "bg-[#5B4DFB]"
                    }`}
                  />
                ) : null}
              </div>
              <span className={`text-[10px] font-semibold mt-0.5 ${isSelected ? "text-white/80" : "text-muted"}`}>
                {dayCount > 0 ? `${dayCount}` : "—"}
              </span>
            </Link>
          );
        })}

        <Link
          href="/routine?day=all"
          className={`focus-ring flex min-w-14 items-center justify-center rounded-2xl py-3 px-3 text-xs font-bold transition-all duration-200 active:scale-95 touch-manipulation ${
            selectedDay === "all"
              ? "bg-[#5B4DFB] text-white shadow-glow"
              : "bg-white text-muted border border-slate-100 shadow-card hover:text-ink"
          }`}
        >
          All
        </Link>
      </nav>

      {/* Timetable Cards */}
      <section className="space-y-4">
        {daysToDisplay.map((dayIdx) => {
          const dayClasses = classes.filter((c) => c.dayOfWeek === dayIdx);
          const dayName = DAY_NAMES[dayIdx];
          const isToday = currentDayOfWeek === dayIdx;

          if (selectedDay === "all" && dayClasses.length === 0) return null;

          return (
            <div key={dayIdx} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
                    {dayName}
                  </h2>
                  {isToday ? (
                    <span className="rounded-full bg-[#EEECFE] px-2.5 py-0.5 text-[10px] font-bold text-[#5B4DFB]">
                      TODAY
                    </span>
                  ) : null}
                </div>
                <span className="text-xs font-semibold text-muted">
                  {dayClasses.length} {dayClasses.length === 1 ? "class" : "classes"}
                </span>
              </div>

              {dayClasses.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-card">
                  <p className="text-sm font-semibold text-ink">No classes scheduled on {dayName}</p>
                  <p className="mt-1 text-xs text-muted">Free day or schedule your classes.</p>
                  <Link
                    href="/routine?action=add"
                    className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#5B4DFB] px-3.5 py-1.5 text-xs font-bold text-white shadow-glow active:scale-95 transition"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Add class</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayClasses.map((item) => (
                    <div
                      key={item.id}
                      className={`group relative rounded-2xl border border-slate-100/90 bg-white p-4 shadow-card transition-all duration-200 hover:shadow-soft active:scale-[0.99] ${
                        !item.enabled ? "opacity-60 bg-slate-50/80" : ""
                      }`}
                    >
                      {/* Top Row: Room / Teacher on left, Class Badge on right */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-slate-400 truncate max-w-[220px]">
                          {item.room ? `Room ${item.room}` : "Classroom"} {item.teacher ? `· ${item.teacher}` : ""}
                        </span>
                        <CategoryIconBadge type="CLASS" />
                      </div>

                      {/* Middle Row: Course Name */}
                      <div className="my-1">
                        <h3 className="text-[15px] sm:text-base font-bold leading-snug text-ink">
                          {item.courseName}
                        </h3>
                      </div>

                      {/* Bottom Row: Time on left, controls on right */}
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-50 pt-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5B4DFB]">
                          <Clock size={13} strokeWidth={2.2} />
                          <span>
                            {formatTime(item.startTime)} – {formatTime(item.endTime)}
                          </span>
                        </div>

                        {/* Controls (Enable/Disable, Delete) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <form action={toggleClassAction}>
                            <input type="hidden" name="returnTo" value={`/routine?day=${selectedDay}`} />
                            <input type="hidden" name="id" value={item.id} />
                            <input
                              type="hidden"
                              name="enabled"
                              value={item.enabled ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className={`rounded-full px-3 py-0.5 text-[11px] font-bold transition-all active:scale-95 ${
                                item.enabled
                                  ? "bg-[#EEECFE] text-[#5B4DFB] hover:bg-[#E3E0FE]"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                            >
                              {item.enabled ? "Active" : "Disabled"}
                            </button>
                          </form>
                          <form action={deleteClassAction}>
                            <input type="hidden" name="returnTo" value={`/routine?day=${selectedDay}`} />
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-rose-500 hover:bg-rose-50 active:scale-95 transition-all"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Academic Holidays Summary */}
      {holidays.length > 0 ? (
        <section className="rounded-xl border border-line bg-white/70 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
              Academic Holidays ({holidays.length})
            </h2>
            <Link href="/calendar" className="text-xs text-muted hover:text-ink font-semibold">
              View Calendar
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {holidays.slice(0, 4).map((holiday) => (
              <div
                key={holiday.id}
                className="rounded-lg border border-lineLight bg-white p-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink">{holiday.name}</p>
                  <span className="text-[11px] text-muted font-mono">{holiday.date}</span>
                </div>
                <p className="text-[11px] text-muted mt-0.5">
                  {holidayRepeatLabel(holiday.repeatRule)} · Classes cancelled
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
