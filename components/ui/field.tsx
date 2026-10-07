import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`focus-ring min-h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink placeholder:text-muted/70 ${props.className ?? ""}`}
    />
  );
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`focus-ring min-h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`focus-ring min-h-24 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70 ${props.className ?? ""}`}
    />
  );
}
