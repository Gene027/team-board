import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";

export const userQueryKeys = {
  all: ["users"] as const,
  list: () => [...userQueryKeys.all, "list"] as const,
};

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: userQueryKeys.list(),
    queryFn: () => usersService.getUsers(),
    enabled,
  });
}
