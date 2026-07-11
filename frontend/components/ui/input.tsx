import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function FieldShell({ label, error, hint, children }: FieldShellProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {error ? (
        <span className="block text-sm font-medium text-red-600">{error}</span>
      ) : hint ? (
        <span className="block text-sm text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextInput({
  label,
  error,
  hint,
  className,
  ...props
}: TextInputProps) {
  return (
    <FieldShell label={label} error={error} hint={hint}>
      <input
        className={cn(
          "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100",
          error && "border-red-300 focus:border-red-400 focus:ring-red-100",
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextArea({
  label,
  error,
  hint,
  className,
  ...props
}: TextAreaProps) {
  return (
    <FieldShell label={label} error={error} hint={hint}>
      <textarea
        className={cn(
          "min-h-28 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100",
          error && "border-red-300 focus:border-red-400 focus:ring-red-100",
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}
