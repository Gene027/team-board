import type { PaginatedResponse } from "@/interfaces/api.interface";
import type {
  AddTaskCommentPayload,
  CreateTaskPayload,
  TaskDetail,
  TaskListItem,
  UpdateTaskPayload,
} from "@/interfaces/task.interface";
import { apiClient } from "@/services/api-client";

export const tasksService = {
  async getTasks(
    projectId: string,
    page = 1,
    limit = 100,
    search?: string,
    assigneeId?: string,
  ) {
    const { data } = await apiClient.get<PaginatedResponse<TaskListItem>>(
      `/projects/${projectId}/tasks`,
      {
        params: {
          page,
          limit,
          search: search?.trim() || undefined,
          assigneeId: assigneeId || undefined,
        },
      },
    );
    return data;
  },

  async getTask(projectId: string, taskId: string) {
    const { data } = await apiClient.get<TaskDetail>(
      `/projects/${projectId}/tasks/${taskId}`,
    );
    return data;
  },

  async createTask(projectId: string, payload: CreateTaskPayload) {
    const { data } = await apiClient.post<TaskListItem>(
      `/projects/${projectId}/tasks`,
      payload,
    );
    return data;
  },

  async updateTask(projectId: string, taskId: string, payload: UpdateTaskPayload) {
    const { data } = await apiClient.patch<TaskListItem>(
      `/projects/${projectId}/tasks/${taskId}`,
      payload,
    );
    return data;
  },

  async deleteTask(projectId: string, taskId: string) {
    const { data } = await apiClient.delete<{ deleted: true }>(
      `/projects/${projectId}/tasks/${taskId}`,
    );
    return data;
  },

  async addComment(
    projectId: string,
    taskId: string,
    payload: AddTaskCommentPayload,
  ) {
    const { data } = await apiClient.post<TaskDetail>(
      `/projects/${projectId}/tasks/${taskId}/comments`,
      payload,
    );
    return data;
  },
};
