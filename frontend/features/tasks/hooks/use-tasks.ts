import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginatedResponse } from "@/interfaces/api.interface";
import type {
  AddTaskCommentPayload,
  CreateTaskPayload,
  TaskDetail,
  TaskListItem,
  UpdateTaskPayload,
} from "@/interfaces/task.interface";
import { tasksService } from "@/services/tasks.service";

export const taskQueryKeys = {
  all: (projectId: string) => ["tasks", projectId] as const,
  lists: (projectId: string) => [...taskQueryKeys.all(projectId), "list"] as const,
  list: (projectId: string, search = "", assigneeId = "") =>
    [...taskQueryKeys.lists(projectId), search, assigneeId] as const,
  detail: (projectId: string, taskId: string) =>
    [...taskQueryKeys.all(projectId), "detail", taskId] as const,
};

export function useTasks(projectId: string, search = "", assigneeId = "") {
  return useQuery({
    queryKey: taskQueryKeys.list(projectId, search, assigneeId),
    queryFn: () => tasksService.getTasks(projectId, 1, 100, search, assigneeId),
    enabled: Boolean(projectId),
  });
}

export function useTaskDetail(projectId: string, taskId?: string | null) {
  return useQuery({
    queryKey: taskQueryKeys.detail(projectId, taskId ?? ""),
    queryFn: () => tasksService.getTask(projectId, taskId ?? ""),
    enabled: Boolean(projectId && taskId),
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) =>
      tasksService.createTask(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all(projectId) });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: UpdateTaskPayload;
    }) => tasksService.updateTask(projectId, taskId, payload),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: taskQueryKeys.all(projectId) });

      const previousTaskLists = queryClient.getQueriesData<
        PaginatedResponse<TaskListItem>
      >({
        queryKey: taskQueryKeys.lists(projectId),
      });
      const previousTaskDetail = queryClient.getQueryData<TaskDetail>(
        taskQueryKeys.detail(projectId, variables.taskId),
      );

      queryClient.setQueriesData<PaginatedResponse<TaskListItem>>(
        { queryKey: taskQueryKeys.lists(projectId) },
        (currentData) => {
          if (!currentData) {
            return currentData;
          }

          return {
            ...currentData,
            data: currentData.data.map((task) =>
              task.id === variables.taskId
                ? { ...task, ...variables.payload }
                : task,
            ),
          };
        },
      );

      queryClient.setQueryData<TaskDetail>(
        taskQueryKeys.detail(projectId, variables.taskId),
        (currentTask) =>
          currentTask ? { ...currentTask, ...variables.payload } : currentTask,
      );

      return { previousTaskLists, previousTaskDetail };
    },
    onError: (_error, variables, context) => {
      context?.previousTaskLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });

      if (context?.previousTaskDetail) {
        queryClient.setQueryData(
          taskQueryKeys.detail(projectId, variables.taskId),
          context.previousTaskDetail,
        );
      }
    },
    onSettled: (_task, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all(projectId) });
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.detail(projectId, variables.taskId),
      });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksService.deleteTask(projectId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all(projectId) });
    },
  });
}

export function useAddTaskComment(projectId: string, taskId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddTaskCommentPayload) =>
      tasksService.addComment(projectId, taskId ?? "", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all(projectId) });

      if (taskId) {
        queryClient.invalidateQueries({
          queryKey: taskQueryKeys.detail(projectId, taskId),
        });
      }
    },
  });
}
