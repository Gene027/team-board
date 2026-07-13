import Link from "next/link";
import { FiArrowRight, FiCalendar, FiLayers, FiUser } from "react-icons/fi";
import { ROUTES } from "@/constants/routes";
import type { ProjectListItem } from "@/interfaces/project.interface";
import { formatDate } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectListItem;
  isOwner: boolean;
}

export function ProjectCard({ project, isOwner }: ProjectCardProps) {
  return (
    <Link
      className="group flex h-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-950/5 min-[360px]:p-5"
      href={ROUTES.project(project.id)}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex size-11 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
          <FiLayers className="size-5" />
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
          {isOwner ? "Owner" : "Member"}
        </span>
      </div>

      <h3 className="line-clamp-2 text-lg font-black tracking-normal text-slate-950">
        {project.name}
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-500">
        {project.description || "No project description yet."}
      </p>

      <div className="mt-6 flex min-w-0 items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="min-w-0 space-y-1 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <FiCalendar className="size-4 shrink-0" />
            <span className="truncate">{formatDate(project.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiUser className="size-4 shrink-0" />
            <span className="truncate">Workspace access</span>
          </div>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white transition group-hover:translate-x-0.5">
          <FiArrowRight className="size-5" />
        </div>
      </div>
    </Link>
  );
}
