"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { TextArea, TextInput } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from "@/features/projects/schemas/project.schema";
import { getApiErrorMessage } from "@/services/api-client";

interface CreateProjectModalProps {
  isOpen: boolean;
  isPending: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (values: CreateProjectFormValues) => void;
}

export function CreateProjectModal({
  isOpen,
  isPending,
  error,
  onClose,
  onSubmit,
}: CreateProjectModalProps) {
  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "" },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      description="Create a focused workspace for tasks, owners, and decisions."
      isOpen={isOpen}
      title="New project"
      onClose={handleClose}
    >
      {error ? (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {getApiErrorMessage(error, "Project could not be created.")}
        </div>
      ) : null}

      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          onSubmit({
            name: values.name.trim(),
            description: values.description?.trim() || undefined,
          });
          form.reset();
        })}
      >
        <TextInput
          error={form.formState.errors.name?.message}
          label="Project name"
          maxLength={120}
          placeholder="Website Redesign"
          {...form.register("name")}
        />
        <TextArea
          error={form.formState.errors.description?.message}
          label="Description"
          maxLength={500}
          placeholder="A short description of the work this project owns."
          {...form.register("description")}
        />
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button isLoading={isPending} type="submit">
            <FiPlus className="size-5" />
            Create project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
