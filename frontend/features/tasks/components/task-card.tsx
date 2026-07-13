"use client";

import { FiMessageSquare, FiUser } from "react-icons/fi";
import { Avatar } from "@/components/ui/avatar";
import type { TaskListItem } from "@/interfaces/task.interface";
import { formatDate } from "@/lib/utils";
import { PriorityBadge } from "@/features/tasks/components/task-badges";

interface TaskCardProps {
  task: TaskListItem;
  isUpdating: boolean;
  onOpen: (taskId: string) => void;
  onDragStart: (taskId: string) => void;
}

export function TaskCard({
  task,
  isUpdating,
  onOpen,
  onDragStart,
}: TaskCardProps) {
  return (
    <button
      className="group w-full min-w-0 cursor-pointer rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-950/5 disabled:cursor-wait disabled:opacity-70"
      draggable={!isUpdating}
      disabled={isUpdating}
      type="button"
      onClick={() => onOpen(task.id)}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", task.id);
        onDragStart(task.id);
      }}
    >
      <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
        <PriorityBadge priority={task.priority} />
        <span className="shrink-0 text-xs font-bold text-slate-400">
          {formatDate(task.updatedAt ?? task.createdAt)}
        </span>
      </div>
      <h3 className="line-clamp-2 text-sm font-black leading-5 text-slate-950">
        {task.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
        {task.description || "No description yet."}
      </p>
      <div className="mt-4 flex min-w-0 items-center justify-between gap-3 border-t border-slate-100 pt-3">
        {task.assignee ? (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar name={task.assignee.name} />
            <span className="truncate text-xs font-bold text-slate-600">
              {task.assignee.name}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <FiUser className="size-4" />
            Unassigned
          </div>
        )}
        <FiMessageSquare className="size-4 text-slate-400 transition group-hover:text-slate-700" />
      </div>
    </button>
  );
}
