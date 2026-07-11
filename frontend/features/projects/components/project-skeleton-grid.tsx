import { Skeleton } from "@/components/ui/skeleton";

export function ProjectSkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="rounded-xl border border-slate-200 bg-white p-5" key={index}>
          <div className="mb-5 flex items-center justify-between">
            <Skeleton className="size-11" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <div className="mt-8 flex items-end justify-between border-t border-slate-100 pt-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="size-9" />
          </div>
        </div>
      ))}
    </div>
  );
}
