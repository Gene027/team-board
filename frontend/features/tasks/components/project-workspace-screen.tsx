"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { StatusMessage } from "@/components/ui/status-message";
import { ROUTES } from "@/constants/routes";
import { TaskStatus } from "@/enums/task-status.enum";
import { AddMemberModal } from "@/features/tasks/components/add-member-modal";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import { ProjectSettingsModal } from "@/features/tasks/components/project-settings-modal";
import { TaskBoardSkeleton } from "@/features/tasks/components/task-board-skeleton";
import { TaskColumn } from "@/features/tasks/components/task-column";
import { TaskDetailModal } from "@/features/tasks/components/task-detail-modal";
import {
  useAddProjectMember,
  useDeleteProject,
  useProjectDetail,
  useProjectMembers,
  useRemoveProjectMember,
  useUpdateProject,
} from "@/features/tasks/hooks/use-project-workspace";
import {
  useAddTaskComment,
  useCreateTask,
  useDeleteTask,
  useTaskDetail,
  useTasks,
  useUpdateTask,
} from "@/features/tasks/hooks/use-tasks";
import { useAuth } from "@/hooks/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useUsers } from "@/hooks/use-users";
import type { TaskListItem } from "@/interfaces/task.interface";
import { getInitials } from "@/lib/utils";

interface ProjectWorkspaceScreenProps {
  projectId: string;
}

const boardStatuses = [
  TaskStatus.Todo,
  TaskStatus.InProgress,
  TaskStatus.Blocked,
  TaskStatus.Done,
];

export function ProjectWorkspaceScreen({ projectId }: ProjectWorkspaceScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus>(
    TaskStatus.Todo,
  );
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 350);
  const { user } = useAuth();
  const router = useRouter();
  const activeProjectId = projectId;

  const projectQuery = useProjectDetail(activeProjectId);
  const membersQuery = useProjectMembers(activeProjectId);
  const usersQuery = useUsers(Boolean(activeProjectId));
  const tasksQuery = useTasks(
    activeProjectId,
    debouncedSearchQuery,
    selectedAssigneeId,
  );
  const taskDetailQuery = useTaskDetail(activeProjectId, selectedTaskId);
  const createTaskMutation = useCreateTask(activeProjectId);
  const updateTaskMutation = useUpdateTask(activeProjectId);
  const deleteTaskMutation = useDeleteTask(activeProjectId);
  const addCommentMutation = useAddTaskComment(activeProjectId, selectedTaskId);
  const addProjectMemberMutation = useAddProjectMember(activeProjectId);
  const updateProjectMutation = useUpdateProject(activeProjectId);
  const deleteProjectMutation = useDeleteProject(activeProjectId);
  const removeProjectMemberMutation = useRemoveProjectMember(activeProjectId);

  const tasks = useMemo(() => tasksQuery.data?.data ?? [], [tasksQuery.data?.data]);
  const members = useMemo(
    () => membersQuery.data?.data ?? [],
    [membersQuery.data?.data],
  );

  const tasksByStatus = useMemo(() => {
    return boardStatuses.reduce<Record<TaskStatus, TaskListItem[]>>(
      (accumulator, status) => {
        accumulator[status] = tasks.filter((task) => task.status === status);
        return accumulator;
      },
      {
        [TaskStatus.Todo]: [],
        [TaskStatus.InProgress]: [],
        [TaskStatus.Blocked]: [],
        [TaskStatus.Done]: [],
      },
    );
  }, [tasks]);

  const openCreateTask = (status = TaskStatus.Todo) => {
    setCreateTaskStatus(status);
    setIsCreateTaskOpen(true);
  };

  const moveTask = (status: TaskStatus, taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    setDraggedTaskId(null);

    if (!task || task.status === status) {
      return;
    }

    updateTaskMutation.mutate({ taskId, payload: { status } });
  };

  const refreshWorkspace = () => {
    projectQuery.refetch();
    membersQuery.refetch();
    tasksQuery.refetch();
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-slate-950"
            href={ROUTES.dashboard}
          >
            <FiArrowLeft className="size-4" />
            Projects
          </Link>
          <div className="flex items-center gap-2">
            <Button
              className="hidden sm:inline-flex"
              type="button"
              variant="secondary"
              onClick={() => setIsProjectSettingsOpen(true)}
            >
              <FiSettings className="size-5" />
              Settings
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddMemberOpen(true)}
            >
              <FiUserPlus className="size-5" />
              Add member
            </Button>
            <Button
              isLoading={
                projectQuery.isFetching ||
                membersQuery.isFetching ||
                (tasksQuery.isFetching && !searchQuery)
              }
              type="button"
              variant="secondary"
              onClick={refreshWorkspace}
            >
              <FiRefreshCw className="size-5" />
              Refresh
            </Button>
            <Button type="button" onClick={() => openCreateTask()}>
              <FiPlus className="size-5" />
              New task
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-700">
              Project workspace
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
              {projectQuery.data?.name ?? "Project board"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              {projectQuery.data?.description ||
                "Plan, assign, move, and discuss tasks from one focused board."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Metric label="Tasks" value={tasks.length} />
            <Metric label="Members" value={members.length} />
            <Metric
              label="Done"
              value={tasksByStatus[TaskStatus.Done]?.length ?? 0}
            />
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div className="relative lg:w-96">
            <TextInput
              aria-label="Search tasks"
              label="Search tasks"
              placeholder="Search by title"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <FiSearch className="pointer-events-none absolute right-3 top-10 size-5 text-slate-400" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-slate-500 lg:justify-end">
            {tasksQuery.isFetching && searchQuery ? (
              <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-500">
                <span className="size-3 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
                Searching
              </span>
            ) : null}
            <div className="flex items-center gap-2">
              <FiUsers className="size-5" />
              {members.length > 0 ? (
                <div className="flex items-center gap-2">
                  {selectedAssigneeId ? (
                    <Button
                      className="h-9 px-3 text-xs"
                      type="button"
                      variant="secondary"
                      onClick={() => setSelectedAssigneeId("")}
                    >
                      Clear
                    </Button>
                  ) : null}
                  <div className="flex -space-x-2">
                  {members.slice(0, 6).map((member) => (
                    <button
                      aria-label={`Filter tasks assigned to ${member.name}`}
                      className={`flex size-9 items-center justify-center rounded-full border-2 text-xs font-black shadow-sm transition ${
                        selectedAssigneeId === member.id
                          ? "z-10 border-cyan-300 bg-cyan-700 text-white ring-2 ring-cyan-200"
                          : "border-white bg-slate-950 text-white hover:-translate-y-0.5 hover:bg-slate-800"
                      }`}
                      key={member.id}
                      title={`${member.name} (${member.email})`}
                      type="button"
                      onClick={() =>
                        setSelectedAssigneeId((currentAssigneeId) =>
                          currentAssigneeId === member.id ? "" : member.id,
                        )
                      }
                    >
                      {getInitials(member.name)}
                    </button>
                  ))}
                  {members.length > 6 ? (
                    <div
                      className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-black text-slate-700 shadow-sm"
                      title={`${members.length - 6} more members`}
                    >
                      +{members.length - 6}
                    </div>
                  ) : null}
                  </div>
                </div>
              ) : (
                <span>No members loaded</span>
              )}
            </div>
          </div>
        </div>

        {projectQuery.isError || tasksQuery.isError ? (
          <StatusMessage
            action={<Button onClick={refreshWorkspace}>Try again</Button>}
            description="The project or task board could not be loaded from the API."
            title="Workspace did not load"
            variant="error"
          />
        ) : tasksQuery.isLoading || projectQuery.isLoading ? (
          <TaskBoardSkeleton />
        ) : tasks.length === 0 && !debouncedSearchQuery ? (
          <StatusMessage
            action={
              <Button type="button" onClick={() => openCreateTask()}>
                <FiPlus className="size-5" />
                Create first task
              </Button>
            }
            description="Create a task and assign it to a teammate to begin planning this project."
            title="No tasks yet"
          />
        ) : tasks.length === 0 ? (
          <StatusMessage
            description="Try a different title or clear the selected member filter."
            title="No matching tasks"
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-4">
            {boardStatuses.map((status) => (
              <TaskColumn
                draggedTaskId={draggedTaskId}
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                updatingTaskId={
                  updateTaskMutation.isPending
                    ? updateTaskMutation.variables?.taskId ?? null
                    : null
                }
                onCreateTask={openCreateTask}
                onDragStart={setDraggedTaskId}
                onDropTask={moveTask}
                onOpenTask={setSelectedTaskId}
              />
            ))}
          </div>
        )}
      </section>

      <CreateTaskModal
        defaultStatus={createTaskStatus}
        error={createTaskMutation.error}
        isOpen={isCreateTaskOpen}
        isPending={createTaskMutation.isPending}
        members={members}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={(values) => {
          createTaskMutation.mutate(values, {
            onSuccess: () => setIsCreateTaskOpen(false),
          });
        }}
      />

      <AddMemberModal
        error={addProjectMemberMutation.error}
        isOpen={isAddMemberOpen}
        isLoadingUsers={usersQuery.isLoading}
        isPending={addProjectMemberMutation.isPending}
        members={members}
        users={usersQuery.data?.data ?? []}
        onClose={() => setIsAddMemberOpen(false)}
        onSubmit={(userId) => {
          addProjectMemberMutation.mutate({ userId }, {
            onSuccess: () => setIsAddMemberOpen(false),
          });
        }}
      />

      <ProjectSettingsModal
        currentUserId={user?.id}
        deleteError={deleteProjectMutation.error}
        isDeleting={deleteProjectMutation.isPending}
        isOpen={isProjectSettingsOpen}
        isRemovingMember={removeProjectMemberMutation.isPending}
        isUpdating={updateProjectMutation.isPending}
        members={members}
        project={projectQuery.data}
        removeMemberError={removeProjectMemberMutation.error}
        updateError={updateProjectMutation.error}
        onClose={() => setIsProjectSettingsOpen(false)}
        onDeleteProject={() => {
          deleteProjectMutation.mutate(undefined, {
            onSuccess: () => router.push(ROUTES.dashboard),
          });
        }}
        onRemoveMember={(userId, onSuccess) => {
          removeProjectMemberMutation.mutate(userId, {
            onSuccess: () => {
              if (selectedAssigneeId === userId) {
                setSelectedAssigneeId("");
              }
              tasksQuery.refetch();
              onSuccess?.();
            },
          });
        }}
        onUpdate={(values) => {
          updateProjectMutation.mutate(values, {
            onSuccess: () => setIsProjectSettingsOpen(false),
          });
        }}
      />

      <TaskDetailModal
        commentError={addCommentMutation.error}
        isCommenting={addCommentMutation.isPending}
        isDeleting={deleteTaskMutation.isPending}
        isLoading={taskDetailQuery.isLoading}
        isOpen={Boolean(selectedTaskId)}
        isUpdating={updateTaskMutation.isPending}
        members={members}
        task={taskDetailQuery.data}
        updateError={updateTaskMutation.error}
        onAddComment={(values) => addCommentMutation.mutate(values)}
        onClose={() => setSelectedTaskId(null)}
        onDelete={() => {
          if (!selectedTaskId) {
            return;
          }

          deleteTaskMutation.mutate(selectedTaskId, {
            onSuccess: () => setSelectedTaskId(null),
          });
        }}
        onUpdate={(payload) => {
          if (!selectedTaskId) {
            return;
          }

          updateTaskMutation.mutate({ taskId: selectedTaskId, payload });
        }}
      />
    </main>
  );
}

interface MetricProps {
  label: string;
  value: number;
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-4 text-center">
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
    </div>
  );
}
