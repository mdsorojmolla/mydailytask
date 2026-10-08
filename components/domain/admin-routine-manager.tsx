"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowUpRight, Sparkles, Layers, ShieldCheck } from "lucide-react";
import type { RoutineVersion } from "@/lib/domain";
import { uploadAndParseRoutineAction, publishRoutineAction, applySection71BRoutineAction } from "@/app/actions/university-routine";

interface AdminRoutineManagerProps {
  publishedVersion: RoutineVersion | null;
  publishedBatches: string[];
  allVersions: RoutineVersion[];
  reviewVersionId?: string;
}

export function AdminRoutineManager({
  publishedVersion,
  publishedBatches,
  allVersions,
  reviewVersionId
}: AdminRoutineManagerProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find draft version if under review
  const activeReviewVersion = reviewVersionId
    ? allVersions.find((v) => v.id === reviewVersionId)
    : allVersions.find((v) => v.status === "DRAFT");

  return (
    <section className="rounded-3xl border border-violet-100 bg-white p-5 sm:p-6 shadow-card space-y-5">
      {/* Admin Badge Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#5B4DFB] text-white shadow-glow">
            <ShieldCheck size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-ink">University Routine Management</h2>
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-extrabold text-[#5B4DFB]">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-muted">Central control for academic timetable versions and batch parsing</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <form action={applySection71BRoutineAction} className="inline-flex">
            <button
              type="submit"
              className="focus-ring inline-flex items-center gap-1.5 rounded-2xl bg-[#EEECFE] px-3.5 py-2 text-xs font-bold text-[#5B4DFB] hover:bg-[#E3E0FE] active:scale-95 transition"
            >
              <Sparkles size={14} strokeWidth={2.5} />
              <span>Apply Section 71_B</span>
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowUpload(!showUpload)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-2xl bg-[#5B4DFB] px-3.5 py-2 text-xs font-bold text-white shadow-glow hover:bg-[#483AE3] active:scale-95 transition"
          >
            <Upload size={14} strokeWidth={2.5} />
            <span>Upload PDF</span>
          </button>
        </div>
      </div>

      {/* Active Published Routine Summary */}
      {publishedVersion ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Currently Published
                </span>
              </div>
              <h3 className="mt-1 text-base font-extrabold text-ink">
                {publishedVersion.versionName}
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Active for all university students · Published on{" "}
                {publishedVersion.publishedAt
                  ? new Date(publishedVersion.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })
                  : "Recently"}
              </p>
            </div>
            <span className="rounded-xl border border-emerald-200 bg-white px-2.5 py-1 text-xs font-extrabold text-emerald-700">
              {publishedBatches.length} Batches
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-emerald-100/60">
            {publishedBatches.map((b) => (
              <span
                key={b}
                className="rounded-lg bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 border border-emerald-100 shadow-xs"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-[#FAF9FE] p-5 text-center">
          <FileText size={28} className="mx-auto text-muted mb-2" />
          <p className="text-sm font-bold text-ink">No university routine published yet</p>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            Upload the university routine PDF to discover all student batches and publish the active schedule.
          </p>
        </div>
      )}

      {/* Draft Review Drawer (Workflow Step 3 & 4: Review & Publish) */}
      {activeReviewVersion ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-white text-xs font-black">
                !
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-ink">
                  Review Parsed Routine: {activeReviewVersion.versionName}
                </h3>
                <p className="text-xs text-muted">
                  Status: Draft · Ready for verification before public release
                </p>
              </div>
            </div>
            <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
              Ready to Publish
            </span>
          </div>

          <form action={publishRoutineAction} className="pt-2 flex items-center justify-end gap-2">
            <input type="hidden" name="versionId" value={activeReviewVersion.id} />
            <button
              type="submit"
              className="focus-ring flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-emerald-700 active:scale-95 transition"
            >
              <CheckCircle2 size={16} strokeWidth={2.5} />
              <span>Publish This Routine to Students</span>
            </button>
          </form>
        </div>
      ) : null}

      {/* Upload Form Modal / Drawer */}
      {showUpload ? (
        <form
          action={uploadAndParseRoutineAction}
          onSubmit={() => setIsSubmitting(true)}
          className="rounded-2xl border border-[#EEECFE] bg-[#FAF9FE] p-5 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">Upload Routine PDF</h3>
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="text-xs font-semibold text-muted hover:text-ink"
            >
              Close
            </button>
          </div>

          <div>
            <label htmlFor="versionName" className="block text-xs font-bold text-ink mb-1.5">
              Routine Version Name (e.g. &ldquo;Routine V4.1&rdquo; or &ldquo;Spring 2025&rdquo;)
            </label>
            <input
              id="versionName"
              name="versionName"
              type="text"
              defaultValue="Routine V4.1"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-ink placeholder:text-muted focus:border-[#5B4DFB] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="file" className="block text-xs font-bold text-ink mb-1.5">
              Routine PDF File
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="application/pdf"
              required
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-[#EEECFE] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-[#5B4DFB] hover:file:bg-[#E3E0FE]"
            />
            <p className="text-[11px] text-muted mt-1">
              Select the university timetable PDF. The system will automatically detect batches (71_B, 71_A, etc.) and lab groups (B1, B2).
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="focus-ring flex items-center gap-2 rounded-2xl bg-[#5B4DFB] px-5 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-[#483AE3] active:scale-95 disabled:opacity-50 transition"
            >
              <Upload size={14} strokeWidth={2.5} />
              <span>{isSubmitting ? "Uploading & Parsing..." : "Upload & Parse PDF"}</span>
            </button>
          </div>
        </form>
      ) : null}

      {/* Routine History Table */}
      {allVersions.length > 0 ? (
        <div className="space-y-2 pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Routine Version History ({allVersions.length})
          </p>
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-[#FAF9FE] overflow-hidden">
            {allVersions.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 text-xs">
                <div>
                  <span className="font-extrabold text-ink">{v.versionName}</span>
                  <span className="text-[11px] text-muted ml-2">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                    v.status === "PUBLISHED"
                      ? "bg-emerald-100 text-emerald-800"
                      : v.status === "DRAFT"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
