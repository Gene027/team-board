import { ProtectedDashboardLayout } from "@/features/auth/components/protected-dashboard-layout";
import { DashboardShell } from "@/features/projects/components/dashboard-shell";

interface ProjectsLayoutProps {
  children: React.ReactNode;
}

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return (
    <ProtectedDashboardLayout>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedDashboardLayout>
  );
}
