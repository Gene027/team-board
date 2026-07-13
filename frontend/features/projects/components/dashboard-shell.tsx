"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FiBell,
  FiBriefcase,
  FiCheckSquare,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiPlus,
  FiSettings,
  FiUsers,
} from "react-icons/fi";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { useCreateProject } from "@/features/projects/hooks/use-projects";
import { useAuth } from "@/hooks/use-auth";
import { cn, getInitials } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
}

const navigationItems = [
  { label: "Projects", icon: FiGrid, isActive: true },
  { label: "Assigned", icon: FiCheckSquare },
  { label: "Teams", icon: FiUsers },
  { label: "Settings", icon: FiSettings },
];

interface DashboardChromeContextValue {
  openCreateProject: () => void;
  setRouteTitle: (title: string) => void;
}

const DashboardChromeContext = createContext<DashboardChromeContextValue | null>(
  null,
);

export function useDashboardChrome() {
  const context = useContext(DashboardChromeContext);

  if (!context) {
    throw new Error("useDashboardChrome must be used within DashboardShell.");
  }

  return context;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [routeTitleOverride, setRouteTitleOverride] = useState<{
    pathname: string;
    title: string;
  } | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const createProjectMutation = useCreateProject();
  const isProjectDetailPage = pathname !== ROUTES.dashboard;
  const fallbackRouteTitle = isProjectDetailPage ? "Project workspace" : "Projects";
  const routeTitle =
    routeTitleOverride?.pathname === pathname
      ? routeTitleOverride.title
      : fallbackRouteTitle;

  const openCreateProject = useCallback(() => setIsCreateProjectOpen(true), []);
  const updateRouteTitle = useCallback((title: string) => {
    setRouteTitleOverride({
      pathname,
      title: title.trim() || fallbackRouteTitle,
    });
  }, [fallbackRouteTitle, pathname]);
  const chromeContext = useMemo(
    () => ({ openCreateProject, setRouteTitle: updateRouteTitle }),
    [openCreateProject, updateRouteTitle],
  );

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isAccountMenuOpen]);

  const handleCreateProject = (values: { name: string; description?: string }) => {
    createProjectMutation.mutate(values, {
      onSuccess: () => setIsCreateProjectOpen(false),
    });
  };

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    logout();
  };

  const userName = user?.name ?? "TeamBoard User";
  const userEmail = user?.email ?? "";

  const sidebar = (
    <aside className="flex h-full flex-col bg-slate-950 text-white">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-white text-base font-black text-slate-950">
          TB
        </div>
        <div>
          <p className="text-sm font-black">TeamBoard</p>
          <p className="text-xs text-slate-400">Project OS</p>
        </div>
      </div>

      <div className="px-3 py-5">
        <Button
          className="w-full bg-white text-slate-950 hover:bg-slate-100"
          type="button"
          onClick={() => {
            setIsMobileMenuOpen(false);
            openCreateProject();
          }}
        >
          <FiPlus className="size-5" />
          New project
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navigationItems.map((item) => (
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition",
              item.isActive
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white",
            )}
            key={item.label}
            type="button"
          >
            <item.icon className="size-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-4 flex items-center gap-3">
          <Avatar name={userName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{userName}</p>
            <p className="truncate text-xs text-slate-400">{userEmail}</p>
          </div>
        </div>
        <Button
          className="w-full justify-start text-slate-300 hover:bg-white/10 hover:text-white"
          type="button"
          variant="ghost"
          onClick={handleLogout}
        >
          <FiLogOut className="size-5" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-100 text-slate-950">
      <div className="hidden fixed inset-y-0 left-0 w-72 lg:block">{sidebar}</div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/40"
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative h-full w-72 animate-slide-in">{sidebar}</div>
        </div>
      ) : null}

      <div className="min-w-0 lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-2 px-2 min-[360px]:px-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-2 min-[360px]:gap-3">
              <Button
                aria-label="Open navigation"
                className="size-10 shrink-0 p-0 lg:hidden"
                type="button"
                variant="secondary"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <FiMenu className="size-5" />
              </Button>
              <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-600">
                <FiBriefcase className="hidden size-5 shrink-0 sm:block" />
                <span className="min-w-0 truncate">{routeTitle}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                aria-label="Notifications"
                className="size-10 p-0"
                type="button"
                variant="secondary"
              >
                <FiBell className="size-5" />
              </Button>
              <div className="relative" ref={accountMenuRef}>
                <button
                  aria-expanded={isAccountMenuOpen}
                  aria-label="Open account menu"
                  className="flex h-10 max-w-56 items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
                  type="button"
                  onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-950 text-xs font-black text-white">
                    {getInitials(userName)}
                  </span>
                  <span className="hidden min-w-0 pr-1 md:block">
                    <span className="block truncate text-xs font-black text-slate-950">
                      {userName}
                    </span>
                    <span className="block truncate text-[11px] font-semibold leading-4 text-slate-500">
                      {userEmail}
                    </span>
                  </span>
                </button>
                {isAccountMenuOpen ? (
                  <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
                    <div className="border-b border-slate-100 p-4">
                      <p className="truncate text-sm font-black text-slate-950">
                        {userName}
                      </p>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                        {userEmail}
                      </p>
                    </div>
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                      type="button"
                      onClick={handleLogout}
                    >
                      <FiLogOut className="size-5" />
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>
        <DashboardChromeContext.Provider value={chromeContext}>
          {children}
        </DashboardChromeContext.Provider>
      </div>

      <CreateProjectModal
        error={createProjectMutation.error}
        isOpen={isCreateProjectOpen}
        isPending={createProjectMutation.isPending}
        onClose={() => setIsCreateProjectOpen(false)}
        onSubmit={handleCreateProject}
      />
    </main>
  );
}
