import { Skeleton } from "@/components/ui/skeleton";

export function TaskBoardSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, columnIndex) => (
        <section
          className="min-h-[560px] rounded-xl border border-slate-200 bg-slate-50 p-3"
          key={columnIndex}
        >
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="size-8" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((__, taskIndex) => (
              <div
                className="rounded-xl border border-slate-200 bg-white p-4"
                key={taskIndex}
              >
                <div className="mb-4 flex items-center justify-between">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
                <div className="mt-5 border-t border-slate-100 pt-3">
                  <Skeleton className="h-8 w-36" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
