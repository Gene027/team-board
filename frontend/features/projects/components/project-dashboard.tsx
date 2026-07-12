"use client";

import { useMemo, useState } from "react";
import { FiPlus, FiRefreshCw, FiSearch, FiTrendingUp } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { StatusMessage } from "@/components/ui/status-message";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { DashboardShell } from "@/features/projects/components/dashboard-shell";
import { ProjectCard } from "@/features/projects/components/project-card";
import { ProjectSkeletonGrid } from "@/features/projects/components/project-skeleton-grid";
import {
  useCreateProject,
  useProjects,
} from "@/features/projects/hooks/use-projects";
import { useAuth } from "@/hooks/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function ProjectDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  const { user } = useAuth();
  const projectsQuery = useProjects(debouncedSearchQuery);
  const createProjectMutation = useCreateProject();

  const projects = useMemo(
    () => projectsQuery.data?.data ?? [],
    [projectsQuery.data?.data],
  );

  const ownedCount = projects.filter((project) => project.ownerId === user?.id).length;

  const handleCreateProject = (values: { name: string; description?: string }) => {
    createProjectMutation.mutate(values, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      },
    });
  };

  return (
    <DashboardShell onCreateProject={() => setIsCreateModalOpen(true)}>
      <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="animate-in rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-700">
                  Project selection
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
                  Choose a workspace
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Pick the project your team is working on. The board view comes
                  next, but project access starts here.
                </p>
              </div>
              <Button
                className="w-full whitespace-nowrap md:w-auto md:min-w-40 md:shrink-0"
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <FiPlus className="size-5 shrink-0" />
                <span>Create project</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Metric label="Projects" value={projects.length} />
            <Metric label="Owned" value={ownedCount} />
            <Metric label="Pages" value={projectsQuery.data?.meta.totalPages ?? 0} />
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-96">
            <TextInput
              aria-label="Search projects"
              label="Search"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <FiSearch className="pointer-events-none absolute right-3 top-10 size-5 text-slate-400" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              isLoading={projectsQuery.isFetching}
              type="button"
              variant="secondary"
              onClick={() => projectsQuery.refetch()}
            >
              <FiRefreshCw className="size-5" />
              Refresh
            </Button>
          </div>
        </div>

        {projectsQuery.isLoading ? (
          <ProjectSkeletonGrid />
        ) : projectsQuery.isError ? (
          <StatusMessage
            action={
              <Button type="button" onClick={() => projectsQuery.refetch()}>
                Try again
              </Button>
            }
            description="We could not load your projects from the API. Check your connection and try again."
            title="Projects did not load"
            variant="error"
          />
        ) : projects.length === 0 && debouncedSearchQuery.trim() ? (
          <StatusMessage
            description="Try a different search term or clear the search field to see every project."
            title="No matching projects"
          />
        ) : projects.length === 0 ? (
          <StatusMessage
            action={
              <Button type="button" onClick={() => setIsCreateModalOpen(true)}>
                <FiPlus className="size-5" />
                Create your first project
              </Button>
            }
            description="Create a project to begin organizing work, members, and project decisions."
            icon={FiTrendingUp}
            title="No projects yet"
          />
        ) : (
          <div className="grid animate-in gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                isOwner={project.ownerId === user?.id}
                key={project.id}
                project={project}
              />
            ))}
          </div>
        )}
      </section>

      <CreateProjectModal
        error={createProjectMutation.error}
        isOpen={isCreateModalOpen}
        isPending={createProjectMutation.isPending}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </DashboardShell>
  );
}

interface MetricProps {
  label: string;
  value: number;
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-4 text-center">
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
    </div>
  );
}
