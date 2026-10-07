"use client";

import { usePathname } from "next/navigation";
import { BookOpen, CalendarPlus, ListPlus, Plus, X } from "lucide-react";
import { useState } from "react";
import { ActivityForm } from "@/components/domain/activity-form";
import { ClassForm } from "@/components/domain/class-form";
import { HolidayForm } from "@/components/domain/holiday-form";
import { TaskForm } from "@/components/domain/task-form";

type Mode = "task" | "class" | "activity" | "holiday";

const modes: Array<{ id: Mode; label: string; icon: typeof Plus }> = [
  { id: "task", label: "Task", icon: ListPlus },
  { id: "class", label: "Class", icon: BookOpen },
  { id: "activity", label: "Activity", icon: Plus },
  { id: "holiday", label: "Holiday", icon: CalendarPlus }
];

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("task");
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Quick add"
        className="focus-ring fixed bottom-24 right-5 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-ink bg-ink text-white shadow-soft transition hover:bg-[#29342e] lg:bottom-8 lg:right-8"
      >
        <Plus aria-hidden="true" size={22} />
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quick add"
          className="fixed inset-0 z-40 bg-ink/20 px-4 py-5 backdrop-blur-sm"
        >
          <div className="ml-auto flex h-full w-full max-w-xl flex-col rounded-md border border-line bg-paper shadow-soft">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-lg font-semibold">Quick Add</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring rounded-md p-2 text-muted hover:bg-white hover:text-ink"
                aria-label="Close quick add"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <div className="border-b border-line px-5 py-3">
              <div className="grid grid-cols-4 gap-2">
                {modes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`focus-ring flex min-h-10 items-center justify-center gap-2 rounded-md border px-2 text-sm font-semibold ${
                      mode === item.id
                        ? "border-accent bg-accentSoft text-accent"
                        : "border-line bg-white text-muted"
                    }`}
                  >
                    <item.icon aria-hidden="true" size={16} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto p-5">
              {mode === "task" ? <TaskForm compact returnTo={pathname} /> : null}
              {mode === "class" ? <ClassForm compact returnTo={pathname} /> : null}
              {mode === "activity" ? (
                <ActivityForm compact returnTo={pathname} />
              ) : null}
              {mode === "holiday" ? (
                <HolidayForm compact returnTo={pathname} />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
