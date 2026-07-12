import { ProtectedDashboardLayout } from "@/features/auth/components/protected-dashboard-layout";

interface ProjectsLayoutProps {
  children: React.ReactNode;
}

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return <ProtectedDashboardLayout>{children}</ProtectedDashboardLayout>;
}
