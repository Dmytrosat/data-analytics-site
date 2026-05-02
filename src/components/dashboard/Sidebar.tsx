import { LayoutDashboard, Database, Table2, BarChart3, ScrollText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

export const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "sources", label: "Sources", icon: Database, path: "/" },
  { id: "records", label: "Records", icon: Table2, path: "/records" },
  { id: "visualization", label: "Visualization", icon: BarChart3, path: "/" },
  { id: "logs", label: "Logs", icon: ScrollText, path: "/" },
  { id: "settings", label: "Settings", icon: Settings, path: "/" },
] as const;

export type NavId = (typeof navItems)[number]["id"];

interface Props {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: Props = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="Головна навігація">
      <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Меню
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          (item.path === "/records" && location.pathname === "/records") ||
          (item.path === "/" && location.pathname === "/" && item.id === "dashboard");
        return (
          <button
            key={item.id}
            onClick={() => {
              navigate(item.path);
              onNavigate?.();
            }}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-sidebar-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-60 border-r border-border bg-sidebar md:block">
      <SidebarNav />
    </aside>
  );
}