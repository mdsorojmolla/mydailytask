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
    primary: "border-ink bg-ink text-white hover:bg-[#29342e]",
    secondary: "border-line bg-white text-ink hover:border-accent/50",
    danger: "border-danger/30 bg-white text-danger hover:bg-danger/5",
    ghost: "border-transparent bg-transparent text-muted hover:bg-white hover:text-ink"
  };

  return (
    <button
      {...props}
      className={`focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    />
  );
}
