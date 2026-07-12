"use client";

import { useState } from "react";
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
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  onCreateProject: () => void;
}

const navigationItems = [
  { label: "Projects", icon: FiGrid, isActive: true },
  { label: "Assigned", icon: FiCheckSquare },
  { label: "Teams", icon: FiUsers },
  { label: "Settings", icon: FiSettings },
];

export function DashboardShell({
  children,
  onCreateProject,
}: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

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
            onCreateProject();
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
          <Avatar name={user?.name ?? "TeamBoard User"} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{user?.name}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <Button
          className="w-full justify-start text-slate-300 hover:bg-white/10 hover:text-white"
          type="button"
          variant="ghost"
          onClick={logout}
        >
          <FiLogOut className="size-5" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
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

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Button
                aria-label="Open navigation"
                className="size-10 p-0 lg:hidden"
                type="button"
                variant="secondary"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <FiMenu className="size-5" />
              </Button>
              <div className="hidden items-center gap-2 text-sm font-bold text-slate-500 sm:flex">
                <FiBriefcase className="size-5" />
                Project dashboard
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                aria-label="Notifications"
                className="size-10 p-0"
                type="button"
                variant="secondary"
              >
                <FiBell className="size-5" />
              </Button>
              <Button
                className="hidden sm:inline-flex"
                type="button"
                onClick={onCreateProject}
              >
                <FiPlus className="size-5" />
                New project
              </Button>
              <Button
                aria-label="Create project"
                className="size-10 p-0 sm:hidden"
                type="button"
                onClick={onCreateProject}
              >
                <FiPlus className="size-5" />
              </Button>
              <Button
                aria-label="Logout"
                className="size-10 p-0 lg:hidden"
                type="button"
                variant="ghost"
                onClick={logout}
              >
                <FiLogOut className="size-5" />
              </Button>
            </div>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
