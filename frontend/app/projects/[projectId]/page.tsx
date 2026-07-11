import Link from "next/link";
import { FiArrowLeft, FiColumns, FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

interface ProjectWorkspacePageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectWorkspacePage({
  params,
}: ProjectWorkspacePageProps) {
  const { projectId } = await params;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          href={ROUTES.home}
        >
          <FiArrowLeft className="size-4" />
          Back to projects
        </Link>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-700">
              Workspace
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-normal">
              Project board is next
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Project `{projectId}` is selected. The next slice can add columns,
              tasks, members, and issue workflows here.
            </p>
          </div>
          <Button type="button" variant="secondary">
            <FiPlus className="size-5" />
            Add task soon
          </Button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {["Backlog", "In progress", "Done"].map((column) => (
            <div
              className="min-h-64 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4"
              key={column}
            >
              <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                <FiColumns className="size-5" />
                {column}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
