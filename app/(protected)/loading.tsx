export default function ProtectedLoading() {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Loading page">
      {/* Top Header Skeleton */}
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="h-6 w-36 rounded-xl bg-slate-200/80" />
          <div className="h-4 w-28 rounded-lg bg-slate-100" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-10 w-10 rounded-2xl bg-slate-200/70" />
          <div className="h-10 w-10 rounded-2xl bg-[#5B4DFB]/20" />
        </div>
      </header>

      {/* Date Strip Skeleton */}
      <section className="flex items-center justify-between gap-2 overflow-hidden py-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex-1 min-w-[58px] max-w-[72px] h-[82px] rounded-2xl flex flex-col items-center justify-center ${
              i === 3 ? "bg-[#5B4DFB]/30" : "bg-white border border-slate-100 shadow-card"
            }`}
          >
            <div className="h-2.5 w-6 rounded bg-slate-200 mb-2" />
            <div className="h-5 w-5 rounded bg-slate-200 mb-2" />
            <div className="h-2.5 w-6 rounded bg-slate-200" />
          </div>
        ))}
      </section>

      {/* Main Feature / Now Panel Skeleton */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded-lg bg-slate-200" />
          <div className="h-5 w-16 rounded-full bg-slate-100" />
        </div>
        <div className="h-7 w-3/4 rounded-xl bg-slate-200" />
        <div className="h-4 w-1/2 rounded-lg bg-slate-100" />
      </div>

      {/* Timeline List Skeleton */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 rounded-lg bg-slate-200" />
          <div className="h-3 w-16 rounded bg-slate-100" />
        </div>
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
