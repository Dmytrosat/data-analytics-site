import { LayoutDashboard, Database, Table2, BarChart3, ScrollText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "sources", label: "Sources", icon: Database },
  { id: "records", label: "Records", icon: Table2 },
  { id: "visualization", label: "Visualization", icon: BarChart3 },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export type NavId = (typeof navItems)[number]["id"];

interface Props {
  active: NavId;
  onSelect: (id: NavId) => void;
}

export function SidebarNav({ active, onSelect }: Props) {
  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="Головна навігація">
      <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Меню
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
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

export function DesktopSidebar(props: Props) {
  return (
    <aside className="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-60 border-r border-border bg-sidebar md:block">
      <SidebarNav {...props} />
    </aside>
  );
}