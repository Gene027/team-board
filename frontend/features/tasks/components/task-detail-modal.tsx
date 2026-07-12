"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  FiCalendar,
  FiMessageSquare,
  FiSend,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TextArea, TextInput } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TASK_PRIORITY_LABELS, TaskPriority } from "@/enums/task-priority.enum";
import { TASK_STATUS_LABELS, TaskStatus } from "@/enums/task-status.enum";
import { PriorityBadge, StatusBadge } from "@/features/tasks/components/task-badges";
import {
  commentSchema,
  type CommentFormValues,
  updateTaskSchema,
  type UpdateTaskFormValues,
} from "@/features/tasks/schemas/task.schema";
import type { User } from "@/interfaces/auth.interface";
import type { TaskDetail, UpdateTaskPayload } from "@/interfaces/task.interface";
import { formatDate } from "@/lib/utils";
import { getApiErrorMessage } from "@/services/api-client";

interface TaskDetailModalProps {
  isOpen: boolean;
  task: TaskDetail | undefined;
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isCommenting: boolean;
  updateError: unknown;
  commentError: unknown;
  members: User[];
  onClose: () => void;
  onDelete: () => void;
  onUpdate: (payload: UpdateTaskPayload) => void;
  onAddComment: (values: CommentFormValues) => void;
}

export function TaskDetailModal({
  isOpen,
  task,
  isLoading,
  isUpdating,
  isDeleting,
  isCommenting,
  updateError,
  commentError,
  members,
  onClose,
  onDelete,
  onUpdate,
  onAddComment,
}: TaskDetailModalProps) {
  const commentForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "" },
  });
  const updateForm = useForm<UpdateTaskFormValues>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      assigneeId: task?.assignee?.id ?? "",
    },
  });
  const assigneeValue = useWatch({
    control: updateForm.control,
    name: "assigneeId",
  });
  const assigneeOptions = [
    {
      label: task?.assignee ? "Keep current assignee" : "Unassigned",
      value: "",
      description: task?.assignee?.name ?? "No owner yet",
    },
    ...members.map((member) => ({
      label: member.name,
      value: member.id,
      description: member.email,
    })),
  ];

  useEffect(() => {
    if (task) {
      updateForm.reset({
        title: task.title,
        description: task.description ?? "",
        assigneeId: task.assignee?.id ?? "",
      });
    }
  }, [task, updateForm]);

  return (
    <Modal
      bodyClassName="scrollbar-hidden overflow-y-auto pr-1"
      className="max-w-3xl"
      description="Review task context, change workflow state, and keep discussion attached to the work."
      isOpen={isOpen}
      title={task?.title ?? "Task details"}
      onClose={onClose}
    >
      {isLoading ? (
        <TaskDetailSkeleton />
      ) : task ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>

            <form
              className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-white p-4"
              onSubmit={updateForm.handleSubmit((values) => {
                const payload: UpdateTaskPayload = {
                  title: values.title.trim(),
                  description: values.description?.trim() ?? "",
                };

                if (values.assigneeId && values.assigneeId !== task.assignee?.id) {
                  payload.assigneeId = values.assigneeId;
                }

                onUpdate(payload);
              })}
            >
              <h3 className="text-sm font-black text-slate-800">Edit task</h3>
              <TextInput
                error={updateForm.formState.errors.title?.message}
                label="Title"
                maxLength={160}
                {...updateForm.register("title")}
              />
              <TextArea
                error={updateForm.formState.errors.description?.message}
                label="Description"
                maxLength={1000}
                {...updateForm.register("description")}
              />
              <Select
                label="Assignee"
                options={assigneeOptions}
                value={assigneeValue ?? ""}
                onChange={(value) =>
                  updateForm.setValue("assigneeId", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <Button isLoading={isUpdating} type="submit">
                Save task
              </Button>
            </form>

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                <FiMessageSquare className="size-5" />
                Comments
              </div>
              <div className="scrollbar-hidden max-h-80 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                {task.comments.length > 0 ? (
                  task.comments.map((comment) => (
                    <div
                      className="rounded-xl border border-slate-200 bg-white p-4"
                      key={comment.id}
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <Avatar name={comment.author?.name ?? "User"} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-800">
                              {comment.author?.name ?? "Unknown user"}
                            </p>
                            <p className="text-xs font-semibold text-slate-400">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="scrollbar-hidden max-h-40 overflow-y-auto whitespace-pre-line break-words text-sm leading-6 text-slate-600">
                        {comment.body}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-semibold text-slate-400">
                    No comments yet.
                  </div>
                )}
              </div>

              {commentError ? (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {getApiErrorMessage(commentError, "Comment could not be added.")}
                </div>
              ) : null}

              <form
                className="mt-4 space-y-3"
                onSubmit={commentForm.handleSubmit((values) => {
                  onAddComment({ body: values.body.trim() });
                  commentForm.reset();
                })}
              >
                <TextArea
                  error={commentForm.formState.errors.body?.message}
                  label="Add comment"
                  maxLength={1000}
                  placeholder="Share an update or decision."
                  {...commentForm.register("body")}
                />
                <Button isLoading={isCommenting} type="submit">
                  <FiSend className="size-5" />
                  Comment
                </Button>
              </form>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-0 lg:self-start">
            <InfoBlock
              icon={<FiUser className="size-4" />}
              label="Assignee"
              value={task.assignee?.name ?? "Unassigned"}
            />
            <InfoBlock
              icon={<FiUser className="size-4" />}
              label="Created by"
              value={task.assigner?.name ?? "Unknown"}
            />
            <InfoBlock
              icon={<FiCalendar className="size-4" />}
              label="Created"
              value={formatDate(task.createdAt)}
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-black text-slate-800">Workflow</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(TaskStatus).map((status) => (
                  <Button
                    className="h-9 px-2 text-xs"
                    disabled={task.status === status}
                    isLoading={isUpdating && task.status !== status}
                    key={status}
                    type="button"
                    variant={task.status === status ? "primary" : "secondary"}
                    onClick={() => onUpdate({ status })}
                  >
                    {TASK_STATUS_LABELS[status]}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-black text-slate-800">Priority</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(TaskPriority).map((priority) => (
                  <Button
                    className="h-9 px-2 text-xs"
                    disabled={task.priority === priority}
                    isLoading={isUpdating && task.priority !== priority}
                    key={priority}
                    type="button"
                    variant={task.priority === priority ? "primary" : "secondary"}
                    onClick={() => onUpdate({ priority })}
                  >
                    {TASK_PRIORITY_LABELS[priority]}
                  </Button>
                ))}
              </div>
            </div>

            {updateError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {getApiErrorMessage(updateError, "Task could not be updated.")}
              </div>
            ) : null}

            <Button
              className="w-full"
              isLoading={isDeleting}
              type="button"
              variant="danger"
              onClick={onDelete}
            >
              <FiTrash2 className="size-5" />
              Delete task
            </Button>
          </aside>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
          Task could not be loaded.
        </div>
      )}
    </Modal>
  );
}

interface InfoBlockProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoBlock({ icon, label, value }: InfoBlockProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {icon}
        {label}
      </div>
      <p className="truncate text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}

function TaskDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div>
        <Skeleton className="mb-4 h-6 w-48" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="mt-6 h-5 w-32" />
        <Skeleton className="mt-3 h-24 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
