import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddProjectMemberPayload,
  UpdateProjectPayload,
} from "@/interfaces/project.interface";
import { notifyApiError, notifySuccess } from "@/lib/toast";
import { projectsService } from "@/services/projects.service";

export const projectWorkspaceQueryKeys = {
  all: (projectId: string) => ["project-workspace", projectId] as const,
  detail: (projectId: string) =>
    [...projectWorkspaceQueryKeys.all(projectId), "detail"] as const,
  members: (projectId: string) =>
    [...projectWorkspaceQueryKeys.all(projectId), "members"] as const,
};

export function useProjectDetail(projectId: string) {
  return useQuery({
    queryKey: projectWorkspaceQueryKeys.detail(projectId),
    queryFn: () => projectsService.getProject(projectId),
    enabled: Boolean(projectId),
  });
}

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: projectWorkspaceQueryKeys.members(projectId),
    queryFn: () => projectsService.getProjectMembers(projectId),
    enabled: Boolean(projectId),
  });
}

export function useAddProjectMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddProjectMemberPayload) =>
      projectsService.addProjectMember(projectId, payload),
    onSuccess: () => {
      notifySuccess("Member added.");
      queryClient.invalidateQueries({
        queryKey: projectWorkspaceQueryKeys.all(projectId),
      });
    },
    onError: (error) => {
      notifyApiError(error, "Member could not be added.");
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProjectPayload) =>
      projectsService.updateProject(projectId, payload),
    onSuccess: () => {
      notifySuccess("Project updated.");
      queryClient.invalidateQueries({
        queryKey: projectWorkspaceQueryKeys.all(projectId),
      });
    },
    onError: (error) => {
      notifyApiError(error, "Project could not be updated.");
    },
  });
}

export function useDeleteProject(projectId: string) {
  return useMutation({
    mutationFn: () => projectsService.deleteProject(projectId),
    onSuccess: () => {
      notifySuccess("Project deleted.");
    },
    onError: (error) => {
      notifyApiError(error, "Project could not be deleted.");
    },
  });
}

export function useRemoveProjectMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      projectsService.removeProjectMember(projectId, userId),
    onSuccess: () => {
      notifySuccess("Member removed.");
      queryClient.invalidateQueries({
        queryKey: projectWorkspaceQueryKeys.all(projectId),
      });
    },
    onError: (error) => {
      notifyApiError(error, "Member could not be removed.");
    },
  });
}
