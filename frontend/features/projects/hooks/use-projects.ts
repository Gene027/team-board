import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateProjectPayload } from "@/interfaces/project.interface";
import { notifyApiError, notifySuccess } from "@/lib/toast";
import { projectsService } from "@/services/projects.service";

export const projectQueryKeys = {
  all: ["projects"] as const,
  list: (search = "") => [...projectQueryKeys.all, "list", search] as const,
};

export function useProjects(search = "") {
  return useQuery({
    queryKey: projectQueryKeys.list(search),
    queryFn: () => projectsService.getProjects(1, 20, search),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) =>
      projectsService.createProject(payload),
    onSuccess: () => {
      notifySuccess("Project created.");
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
    },
    onError: (error) => {
      notifyApiError(error, "Project could not be created.");
    },
  });
}
