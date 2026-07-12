import { ProjectWorkspaceScreen } from "@/features/tasks/components/project-workspace-screen";

interface ProjectWorkspacePageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectWorkspacePage({
  params,
}: ProjectWorkspacePageProps) {
  const { projectId } = await params;

  return <ProjectWorkspaceScreen projectId={projectId} />;
}
