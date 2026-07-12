"use client";

import { useMemo, useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import type { User } from "@/interfaces/auth.interface";
import { getApiErrorMessage } from "@/services/api-client";

interface AddMemberModalProps {
  isOpen: boolean;
  isPending: boolean;
  isLoadingUsers: boolean;
  error: unknown;
  users: User[];
  members: User[];
  onClose: () => void;
  onSubmit: (userId: string) => void;
}

export function AddMemberModal({
  isOpen,
  isPending,
  isLoadingUsers,
  error,
  users,
  members,
  onClose,
  onSubmit,
}: AddMemberModalProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const memberIds = useMemo(
    () => new Set(members.map((member) => member.id)),
    [members],
  );
  const availableUsers = useMemo(
    () => users.filter((user) => !memberIds.has(user.id)),
    [memberIds, users],
  );
  const options = useMemo(
    () =>
      availableUsers.map((user) => ({
        label: user.name,
        value: user.id,
        description: user.email,
      })),
    [availableUsers],
  );

  const handleClose = () => {
    setSelectedUserId("");
    onClose();
  };

  return (
    <Modal
      description="Choose a user to add them to this project."
      isOpen={isOpen}
      title="Add project member"
      onClose={handleClose}
    >
      {error ? (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {getApiErrorMessage(error, "Member could not be added.")}
        </div>
      ) : null}
      <div className="space-y-4">
        <Select
          disabled={isLoadingUsers || availableUsers.length === 0}
          label="User"
          options={options}
          placeholder={
            isLoadingUsers
              ? "Loading users"
              : availableUsers.length === 0
                ? "No users available"
                : "Select a user"
          }
          value={selectedUserId}
          onChange={setSelectedUserId}
        />
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            disabled={!selectedUserId}
            isLoading={isPending}
            type="button"
            onClick={() => {
              onSubmit(selectedUserId);
              setSelectedUserId("");
            }}
          >
            <FiUserPlus className="size-5" />
            Add member
          </Button>
        </div>
      </div>
    </Modal>
  );
}
