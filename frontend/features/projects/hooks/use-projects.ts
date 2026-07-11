import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateProjectPayload } from "@/interfaces/project.interface";
import { projectsService } from "@/services/projects.service";

export const projectQueryKeys = {
  all: ["projects"] as const,
  list: () => [...projectQueryKeys.all, "list"] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectQueryKeys.list(),
    queryFn: () => projectsService.getProjects(1, 20),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) =>
      projectsService.createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
    },
  });
}
