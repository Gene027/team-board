import type { PaginatedResponse } from "@/interfaces/api.interface";
import type {
  AddProjectMemberPayload,
  CreateProjectPayload,
  ProjectDetail,
  ProjectListItem,
  UpdateProjectPayload,
} from "@/interfaces/project.interface";
import type { User } from "@/interfaces/auth.interface";
import { apiClient } from "@/services/api-client";

export const projectsService = {
  async getProjects(page = 1, limit = 20, search?: string) {
    const { data } = await apiClient.get<PaginatedResponse<ProjectListItem>>(
      "/projects",
      {
        params: { page, limit, search: search?.trim() || undefined },
      },
    );
    return data;
  },

  async createProject(payload: CreateProjectPayload) {
    const { data } = await apiClient.post<ProjectListItem>("/projects", payload);
    return data;
  },

  async getProject(projectId: string) {
    const { data } = await apiClient.get<ProjectDetail>(`/projects/${projectId}`);
    return data;
  },

  async getProjectMembers(projectId: string, page = 1, limit = 100) {
    const { data } = await apiClient.get<PaginatedResponse<User>>(
      `/projects/${projectId}/members`,
      {
        params: { page, limit },
      },
    );
    return data;
  },

  async addProjectMember(projectId: string, payload: AddProjectMemberPayload) {
    const { data } = await apiClient.post<ProjectDetail>(
      `/projects/${projectId}/members`,
      payload,
    );
    return data;
  },

  async updateProject(projectId: string, payload: UpdateProjectPayload) {
    const { data } = await apiClient.patch<ProjectDetail>(
      `/projects/${projectId}`,
      payload,
    );
    return data;
  },

  async deleteProject(projectId: string) {
    const { data } = await apiClient.delete<{ deleted: true }>(
      `/projects/${projectId}`,
    );
    return data;
  },

  async removeProjectMember(projectId: string, userId: string) {
    const { data } = await apiClient.delete<ProjectDetail>(
      `/projects/${projectId}/members/${userId}`,
    );
    return data;
  },
};
