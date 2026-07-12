import type { PaginatedResponse } from "@/interfaces/api.interface";
import type { User } from "@/interfaces/auth.interface";
import { apiClient } from "@/services/api-client";

export const usersService = {
  async getUsers(page = 1, limit = 100) {
    const { data } = await apiClient.get<PaginatedResponse<User>>("/users", {
      params: { page, limit },
    });
    return data;
  },
};
