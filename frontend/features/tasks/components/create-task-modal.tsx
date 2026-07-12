"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { TextArea, TextInput } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { TASK_PRIORITY_LABELS, TaskPriority } from "@/enums/task-priority.enum";
import { TASK_STATUS_LABELS, TaskStatus } from "@/enums/task-status.enum";
import {
  createTaskSchema,
  type CreateTaskFormValues,
} from "@/features/tasks/schemas/task.schema";
import type { User } from "@/interfaces/auth.interface";
import { getApiErrorMessage } from "@/services/api-client";

interface CreateTaskModalProps {
  isOpen: boolean;
  defaultStatus: TaskStatus;
  members: User[];
  isPending: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (values: CreateTaskFormValues) => void;
}

export function CreateTaskModal({
  isOpen,
  defaultStatus,
  members,
  isPending,
  error,
  onClose,
  onSubmit,
}: CreateTaskModalProps) {
  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: defaultStatus,
      priority: TaskPriority.Medium,
      assigneeId: "",
    },
  });
  const [statusValue, priorityValue, assigneeValue] = useWatch({
    control: form.control,
    name: ["status", "priority", "assigneeId"],
  });
  const statusOptions = Object.values(TaskStatus).map((status) => ({
    label: TASK_STATUS_LABELS[status],
    value: status,
  }));
  const priorityOptions = Object.values(TaskPriority).map((priority) => ({
    label: TASK_PRIORITY_LABELS[priority],
    value: priority,
  }));
  const assigneeOptions = [
    { label: "Unassigned", value: "", description: "No owner yet" },
    ...members.map((member) => ({
      label: member.name,
      value: member.id,
      description: member.email,
    })),
  ];

  useEffect(() => {
    if (isOpen) {
      form.setValue("status", defaultStatus);
    }
  }, [defaultStatus, form, isOpen]);

  const handleClose = () => {
    form.reset({
      title: "",
      description: "",
      status: defaultStatus,
      priority: TaskPriority.Medium,
      assigneeId: "",
    });
    onClose();
  };

  return (
    <Modal
      description="Create a task, set priority, and assign it to a project member."
      isOpen={isOpen}
      title="Create task"
      onClose={handleClose}
    >
      {error ? (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {getApiErrorMessage(error, "Task could not be created.")}
        </div>
      ) : null}

      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          onSubmit({
            ...values,
            title: values.title.trim(),
            description: values.description?.trim() || undefined,
            assigneeId: values.assigneeId || undefined,
          });
          form.reset();
        })}
      >
        <TextInput
          error={form.formState.errors.title?.message}
          label="Title"
          maxLength={160}
          placeholder="Write acceptance criteria"
          {...form.register("title")}
        />
        <TextArea
          error={form.formState.errors.description?.message}
          label="Description"
          maxLength={1000}
          placeholder="Add context, requirements, or links."
          {...form.register("description")}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Status"
            options={statusOptions}
            value={statusValue}
            onChange={(value) =>
              form.setValue("status", value as TaskStatus, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          <Select
            label="Priority"
            options={priorityOptions}
            value={priorityValue}
            onChange={(value) =>
              form.setValue("priority", value as TaskPriority, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          <Select
            label="Assignee"
            options={assigneeOptions}
            placeholder="Choose teammate"
            value={assigneeValue ?? ""}
            onChange={(value) =>
              form.setValue("assigneeId", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
        </div>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button isLoading={isPending} type="submit">
            <FiPlus className="size-5" />
            Create task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
