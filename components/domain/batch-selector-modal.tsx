"use client";

import { useState } from "react";
import { GraduationCap, Check, Sparkles, ChevronRight } from "lucide-react";
import { selectUserBatchAction } from "@/app/actions/university-routine";

interface BatchSelectorProps {
  availableBatches: string[];
  currentBatch?: string | null;
  returnTo?: string;
  isChangeMode?: boolean;
}

export function BatchSelectorModal({
  availableBatches,
  currentBatch,
  returnTo = "/home",
  isChangeMode = false
}: BatchSelectorProps) {
  const [selected, setSelected] = useState<string | null>(currentBatch || null);
  const [isOpen, setIsOpen] = useState(!currentBatch || isChangeMode);

  if (availableBatches.length === 0) {
    return null;
  }

  // If already selected and not in change mode, display compact indicator with Change button
  if (currentBatch && !isChangeMode && !isOpen) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-[#EEECFE] bg-white p-3.5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEECFE] text-[#5B4DFB]">
            <GraduationCap size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Academic Batch
              </span>
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700">
                ACTIVE
              </span>
            </div>
            <p className="text-sm font-extrabold text-ink">{currentBatch}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="focus-ring rounded-xl border border-slate-200 bg-stone-50 px-3 py-1.5 text-xs font-bold text-ink hover:border-[#5B4DFB] hover:text-[#5B4DFB] active:scale-95 transition"
        >
          Change Batch
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#EEECFE] bg-gradient-to-b from-white to-[#F7F8FD] p-5 sm:p-6 shadow-[0_8px_30px_rgba(91,77,251,0.08)]">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5B4DFB] text-white shadow-glow">
          <GraduationCap size={22} strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B4DFB]">
            University Timetable
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-ink">
            What&apos;s your CSE Batch?
          </h2>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-muted mb-5 leading-relaxed">
        Select your batch section below to automatically sync your weekly classes, labs, and room schedules directly into your routine.
      </p>

      <form action={selectUserBatchAction} className="space-y-4">
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="batchCode" value={selected ?? ""} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {availableBatches.map((batch) => {
            const isChosen = selected === batch;
            return (
              <button
                key={batch}
                type="button"
                onClick={() => setSelected(batch)}
                className={`focus-ring relative flex h-14 items-center justify-center rounded-2xl font-extrabold text-sm transition-all duration-200 active:scale-95 select-none ${
                  isChosen
                    ? "bg-[#5B4DFB] text-white shadow-glow scale-[1.02]"
                    : "border border-slate-100 bg-white text-ink shadow-card hover:border-[#5B4DFB]/40 hover:bg-[#FAF9FE]"
                }`}
              >
                <span>{batch}</span>
                {isChosen ? (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-white/20">
                    <Check size={11} strokeWidth={3} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pt-2">
          {isChangeMode ? (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="focus-ring flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-muted hover:text-ink transition"
            >
              Cancel
            </button>
          ) : null}

          <button
            type="submit"
            disabled={!selected}
            className="focus-ring flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#5B4DFB] py-3 text-xs font-bold text-white shadow-glow hover:bg-[#483AE3] active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:shadow-none transition-all"
          >
            <span>Save & Load Routine</span>
            <ChevronRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
