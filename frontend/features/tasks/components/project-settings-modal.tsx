"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiSave, FiTrash2, FiUserMinus } from "react-icons/fi";
import { z } from "zod";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TextArea, TextInput } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { User } from "@/interfaces/auth.interface";
import type { ProjectDetail } from "@/interfaces/project.interface";
import { getApiErrorMessage } from "@/services/api-client";

const projectSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters.")
    .max(120, "Project name must be 120 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

type ProjectSettingsValues = z.infer<typeof projectSettingsSchema>;

interface ProjectSettingsModalProps {
  isOpen: boolean;
  project: ProjectDetail | undefined;
  members: User[];
  currentUserId?: string;
  updateError: unknown;
  removeMemberError: unknown;
  deleteError: unknown;
  isUpdating: boolean;
  isRemovingMember: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onUpdate: (values: ProjectSettingsValues) => void;
  onRemoveMember: (userId: string, onSuccess?: () => void) => void;
  onDeleteProject: () => void;
}

export function ProjectSettingsModal({
  isOpen,
  project,
  members,
  currentUserId,
  updateError,
  removeMemberError,
  deleteError,
  isUpdating,
  isRemovingMember,
  isDeleting,
  onClose,
  onUpdate,
  onRemoveMember,
  onDeleteProject,
}: ProjectSettingsModalProps) {
  const [memberPendingRemoval, setMemberPendingRemoval] = useState<User | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [deleteConfirmationPhrase, setDeleteConfirmationPhrase] = useState("");
  const form = useForm<ProjectSettingsValues>({
    resolver: zodResolver(projectSettingsSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
    },
  });

  useEffect(() => {
    if (isOpen && project) {
      form.reset({
        name: project.name,
        description: project.description ?? "",
      });
    }
  }, [form, isOpen, project]);

  const ownerId = project?.ownerId;
  const expectedDeletePhrase = project?.name ?? "";
  const canDeleteProject =
    expectedDeletePhrase.length > 0 &&
    deleteConfirmationPhrase.trim() === expectedDeletePhrase;

  return (
    <>
      <Modal
        className="max-w-3xl"
        description="Update project details, remove members, or delete the project."
        isOpen={isOpen}
        title="Project settings"
        onClose={onClose}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) =>
              onUpdate({
                name: values.name.trim(),
                description: values.description?.trim() ?? "",
              }),
            )}
          >
            {updateError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {getApiErrorMessage(updateError, "Project could not be updated.")}
              </div>
            ) : null}
            <TextInput
              error={form.formState.errors.name?.message}
              label="Project name"
              maxLength={120}
              {...form.register("name")}
            />
            <TextArea
              error={form.formState.errors.description?.message}
              label="Description"
              maxLength={500}
              {...form.register("description")}
            />
            <Button isLoading={isUpdating} type="submit">
              <FiSave className="size-5" />
              Save changes
            </Button>
          </form>

          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 text-sm font-black text-slate-800">Members</h3>
              {removeMemberError ? (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {getApiErrorMessage(
                    removeMemberError,
                    "Member could not be removed.",
                  )}
                </div>
              ) : null}
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {members.map((member) => {
                  const isOwner = member.id === ownerId;

                  return (
                    <div
                      className="flex items-center justify-between gap-3 rounded-lg bg-white p-2"
                      key={member.id}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar name={member.name} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-800">
                            {member.name}
                          </p>
                          <p className="truncate text-xs font-semibold text-slate-400">
                            {isOwner ? "Owner" : member.email}
                          </p>
                        </div>
                      </div>
                      {!isOwner && member.id !== currentUserId ? (
                        <Button
                          aria-label={`Remove ${member.name}`}
                          className="size-9 shrink-0 p-0"
                          disabled={isRemovingMember}
                          type="button"
                          variant="ghost"
                          onClick={() => setMemberPendingRemoval(member)}
                        >
                          <FiUserMinus className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <h3 className="text-sm font-black text-red-800">Danger zone</h3>
              <p className="mt-2 text-sm leading-6 text-red-700">
                Deleting a project cannot be undone.
              </p>
              {deleteError ? (
                <div className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700">
                  {getApiErrorMessage(deleteError, "Project could not be deleted.")}
                </div>
              ) : null}
              <Button
                className="mt-4 w-full"
                isLoading={isDeleting}
                type="button"
                variant="danger"
                onClick={() => setIsDeleteConfirmationOpen(true)}
              >
                <FiTrash2 className="size-5" />
                Delete project
              </Button>
            </div>
          </aside>
        </div>
      </Modal>

      <Modal
        className="max-w-md"
        description="Their assigned tasks in this project will become unassigned."
        isOpen={Boolean(memberPendingRemoval)}
        title="Remove member?"
        onClose={() => setMemberPendingRemoval(null)}
      >
        {memberPendingRemoval ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <Avatar name={memberPendingRemoval.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-800">
                  {memberPendingRemoval.name}
                </p>
                <p className="truncate text-xs font-semibold text-slate-500">
                  {memberPendingRemoval.email}
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMemberPendingRemoval(null)}
              >
                Cancel
              </Button>
              <Button
                isLoading={isRemovingMember}
                type="button"
                variant="danger"
                onClick={() => {
                  onRemoveMember(memberPendingRemoval.id, () =>
                    setMemberPendingRemoval(null),
                  );
                }}
              >
                <FiUserMinus className="size-5" />
                Remove member
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        className="max-w-md"
        description="This will permanently delete the project and cannot be undone."
        isOpen={isDeleteConfirmationOpen}
        title="Delete project?"
        onClose={() => {
          setDeleteConfirmationPhrase("");
          setIsDeleteConfirmationOpen(false);
        }}
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-black text-red-800">
              {project?.name ?? "This project"}
            </p>
            <p className="mt-2 text-sm leading-6 text-red-700">
              All project access and project data will be removed.
            </p>
          </div>
          <TextInput
            label={`Type "${expectedDeletePhrase}" to confirm`}
            placeholder={expectedDeletePhrase}
            value={deleteConfirmationPhrase}
            onChange={(event) => setDeleteConfirmationPhrase(event.target.value)}
          />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDeleteConfirmationPhrase("");
                setIsDeleteConfirmationOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!canDeleteProject}
              isLoading={isDeleting}
              type="button"
              variant="danger"
              onClick={onDeleteProject}
            >
              <FiTrash2 className="size-5" />
              Delete project
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
