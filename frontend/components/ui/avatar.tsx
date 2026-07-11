import { getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
}

export function Avatar({ name }: AvatarProps) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white shadow-sm">
      {getInitials(name)}
    </div>
  );
}
