"use client";

import { FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { TASK_STATUS_LABELS, type TaskStatus } from "@/enums/task-status.enum";
import { TaskCard } from "@/features/tasks/components/task-card";
import type { TaskListItem } from "@/interfaces/task.interface";
import { cn } from "@/lib/utils";

interface TaskColumnProps {
  status: TaskStatus;
  tasks: TaskListItem[];
  draggedTaskId: string | null;
  updatingTaskId: string | null;
  onCreateTask: (status: TaskStatus) => void;
  onDropTask: (status: TaskStatus, taskId: string) => void;
  onOpenTask: (taskId: string) => void;
  onDragStart: (taskId: string) => void;
}

export function TaskColumn({
  status,
  tasks,
  draggedTaskId,
  updatingTaskId,
  onCreateTask,
  onDropTask,
  onOpenTask,
  onDragStart,
}: TaskColumnProps) {
  const isDropTarget = Boolean(draggedTaskId);

  return (
    <section
      className={cn(
        "flex min-h-[560px] flex-col rounded-xl border border-slate-200 bg-slate-50 p-3 transition",
        isDropTarget && "border-slate-300 bg-slate-100",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => {
        event.preventDefault();
        const taskId = event.dataTransfer.getData("text/plain") || draggedTaskId;

        if (taskId) {
          onDropTask(status, taskId);
        }
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-black text-slate-800">
            {TASK_STATUS_LABELS[status]}
          </h2>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-black text-slate-500">
            {tasks.length}
          </span>
        </div>
        <Button
          aria-label={`Create task in ${TASK_STATUS_LABELS[status]}`}
          className="size-8 p-0"
          type="button"
          variant="ghost"
          onClick={() => onCreateTask(status)}
        >
          <FiPlus className="size-4" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard
            isUpdating={updatingTaskId === task.id}
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            onOpen={onOpenTask}
          />
        ))}
        {tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70 p-5 text-center text-sm font-semibold leading-6 text-slate-400">
            Drop tasks here or create a new one.
          </div>
        ) : null}
      </div>
    </section>
  );
}
