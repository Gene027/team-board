import type { PaginatedResponse } from "@/interfaces/api.interface";
import type {
  CreateProjectPayload,
  ProjectListItem,
} from "@/interfaces/project.interface";
import { apiClient } from "@/services/api-client";

export const projectsService = {
  async getProjects(page = 1, limit = 20) {
    const { data } = await apiClient.get<PaginatedResponse<ProjectListItem>>(
      "/projects",
      {
        params: { page, limit },
      },
    );
    return data;
  },

  async createProject(payload: CreateProjectPayload) {
    const { data } = await apiClient.post<ProjectListItem>("/projects", payload);
    return data;
  },
};
