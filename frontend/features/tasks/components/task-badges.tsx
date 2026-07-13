import type { TaskPriority } from "@/enums/task-priority.enum";
import { TASK_PRIORITY_LABELS } from "@/enums/task-priority.enum";
import type { TaskStatus } from "@/enums/task-status.enum";
import { TASK_STATUS_LABELS } from "@/enums/task-status.enum";
import { cn } from "@/lib/utils";

const priorityClassNames: Record<TaskPriority, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-cyan-50 text-cyan-700",
  high: "bg-rose-50 text-rose-700",
};

const statusClassNames: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-cyan-50 text-cyan-700",
  blocked: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-700",
};

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-1 text-xs font-black",
        priorityClassNames[priority],
      )}
    >
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  );
}

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-1 text-xs font-black",
        statusClassNames[status],
      )}
    >
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}
