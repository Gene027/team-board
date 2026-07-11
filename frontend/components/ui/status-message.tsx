import type { IconType } from "react-icons";
import { FiAlertCircle, FiInbox } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface StatusMessageProps {
  title: string;
  description: string;
  variant?: "empty" | "error";
  action?: React.ReactNode;
  icon?: IconType;
}

export function StatusMessage({
  title,
  description,
  variant = "empty",
  action,
  icon,
}: StatusMessageProps) {
  const Icon = icon ?? (variant === "error" ? FiAlertCircle : FiInbox);

  return (
    <div
      className={cn(
        "flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center",
        variant === "error"
          ? "border-red-200 bg-red-50/70"
          : "border-slate-200 bg-white",
      )}
    >
      <div
        className={cn(
          "mb-4 flex size-12 items-center justify-center rounded-xl",
          variant === "error" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-700",
        )}
      >
        <Icon className="size-6" />
      </div>
      <h3 className="text-base font-bold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
