import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({
  tone = "secondary",
  className = "",
  ...props
}: ButtonProps) {
  const tones = {
    primary: "border-[#5B4DFB] bg-[#5B4DFB] text-white hover:bg-[#483AE3] shadow-glow",
    secondary: "border-slate-200/80 bg-white text-ink hover:border-[#5B4DFB]/40 hover:bg-[#FAF9FE]",
    danger: "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
    ghost: "border-transparent bg-transparent text-muted hover:bg-slate-100 hover:text-ink"
  };

  return (
    <button
      {...props}
      className={`focus-ring inline-flex min-h-11 sm:min-h-10 select-none items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all active:scale-[0.98] touch-manipulation disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${tones[tone]} ${className}`}
    />
  );
}
