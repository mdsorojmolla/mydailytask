"use client";

import { usePathname } from "next/navigation";
import { BookOpen, CalendarPlus, ListPlus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ActivityForm } from "@/components/domain/activity-form";
import { ClassForm } from "@/components/domain/class-form";
import { HolidayForm } from "@/components/domain/holiday-form";
import { TaskForm } from "@/components/domain/task-form";

export function openQuickAdd() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-quick-add"));
  }
}

type Mode = "task" | "class" | "activity" | "holiday";

const modes: Array<{ id: Mode; label: string; icon: typeof Plus }> = [
  { id: "task", label: "Task", icon: ListPlus },
  { id: "class", label: "Class", icon: BookOpen },
  { id: "activity", label: "Habit", icon: Plus },
  { id: "holiday", label: "Holiday", icon: CalendarPlus }
];

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("task");
  const pathname = usePathname();

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-quick-add", handleOpen);
    return () => window.removeEventListener("open-quick-add", handleOpen);
  }, []);

  return (
    <>
      {/* Desktop floating button (on mobile, handled by center nav button) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Quick add item"
        className="focus-ring fixed bottom-8 right-8 z-30 hidden lg:inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#5B4DFB] text-white shadow-floating hover:bg-[#483AE3] transition-all active:scale-95 touch-manipulation select-none"
      >
        <Plus aria-hidden="true" size={26} strokeWidth={2.5} />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quick add"
          className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-ink/40 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="flex max-h-[88dvh] sm:max-h-[85vh] w-full max-w-xl flex-col rounded-t-[28px] sm:rounded-2xl border-t sm:border border-slate-100 bg-white shadow-2xl overflow-hidden">
            {/* Grab handle indicator on mobile */}
            <div className="pt-3 pb-1 sm:hidden">
              <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-300" />
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold tracking-tight text-ink">Quick Add</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring rounded-full p-2 text-muted hover:bg-slate-100 hover:text-ink transition active:scale-95"
                aria-label="Close quick add"
              >
                <X aria-hidden="true" size={20} />
              </button>
            </div>

            <div className="border-b border-slate-100 bg-[#FAF9FE] px-4 py-3">
              <div className="grid grid-cols-4 gap-2">
                {modes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`focus-ring flex min-h-12 flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-2xl p-2 text-xs font-bold transition-all active:scale-95 touch-manipulation ${
                      mode === item.id
                        ? "bg-[#5B4DFB] text-white shadow-glow"
                        : "bg-[#EEECFE] text-[#5B4DFB] hover:bg-[#E3E0FE]"
                    }`}
                  >
                    <item.icon aria-hidden="true" size={16} strokeWidth={2.2} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto p-6 pb-[max(2rem,calc(1.5rem+env(safe-area-inset-bottom,0px)))] sm:pb-6">
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
