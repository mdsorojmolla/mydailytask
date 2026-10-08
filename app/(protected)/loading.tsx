export default function ProtectedLoading() {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Loading page">
      {/* Top Header Skeleton */}
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-36 rounded-xl bg-slate-200/80" />
          <div className="h-3.5 w-24 rounded-lg bg-slate-100" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-10 w-10 rounded-2xl bg-slate-200/70" />
          <div className="h-10 w-10 rounded-2xl bg-[#5B4DFB]/20" />
        </div>
      </header>

      {/* Navigation / Segment Pill Skeleton */}
      <div className="flex items-center gap-2 py-1 overflow-hidden">
        <div className="h-9 w-20 rounded-2xl bg-[#5B4DFB]/20 shrink-0" />
        <div className="h-9 w-24 rounded-2xl bg-slate-100 shrink-0" />
        <div className="h-9 w-28 rounded-2xl bg-slate-100 shrink-0" />
        <div className="h-9 w-20 rounded-2xl bg-slate-100 shrink-0" />
      </div>

      {/* Main Feature Card Skeleton */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 rounded-lg bg-slate-200" />
          <div className="h-5 w-16 rounded-full bg-slate-100" />
        </div>
        <div className="h-6 w-2/3 rounded-xl bg-slate-200/70" />
        <div className="h-3.5 w-1/3 rounded-lg bg-slate-100" />
      </div>

      {/* Content List Skeleton */}
      <div className="space-y-3 pt-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-card"
          >
            <div className="h-10 w-10 rounded-2xl bg-[#EEECFE]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/5 rounded-lg bg-slate-200" />
              <div className="h-3 w-2/5 rounded bg-slate-100" />
            </div>
            <div className="h-6 w-14 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

