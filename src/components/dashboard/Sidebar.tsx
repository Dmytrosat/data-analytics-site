import {
  LayoutDashboard, Database, Table2, BarChart3, ScrollText, Settings,
  LineChart, FileText, Plug, Users, UsersRound, CreditCard,
  KeyRound, Webhook, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

type NavItem = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    title: "Меню",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
      { id: "sources", label: "Sources", icon: Database, path: "/sources" },
      { id: "records", label: "Records", icon: Table2, path: "/records" },
      { id: "visualization", label: "Visualization", icon: BarChart3, path: "/visualization" },
      { id: "logs", label: "Logs", icon: ScrollText, path: "/logs" },
    ],
  },
  {
    title: "Аналітика",
    items: [
      { id: "analytics", label: "Analytics", icon: LineChart, path: "/analytics" },
      { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
      { id: "integrations", label: "Integrations", icon: Plug, path: "/integrations" },
    ],
  },
  {
    title: "Команда",
    items: [
      { id: "users", label: "Users", icon: Users, path: "/users" },
      { id: "teams", label: "Teams", icon: UsersRound, path: "/teams" },
      { id: "billing", label: "Billing", icon: CreditCard, path: "/billing" },
    ],
  },
  {
    title: "Розробка",
    items: [
      { id: "api-keys", label: "API Keys", icon: KeyRound, path: "/api-keys" },
      { id: "webhooks", label: "Webhooks", icon: Webhook, path: "/webhooks" },
      { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
    ],
  },
  {
    title: "Система",
    items: [
      { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];

interface Props {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: Props = {}) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="flex flex-col gap-4 p-3 pb-8" aria-label="Головна навігація">
      {navSections.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {section.title}
          </div>
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
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
        </div>
      ))}
    </nav>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-60 overflow-y-auto border-r border-border bg-sidebar md:block">
      <SidebarNav />
    </aside>
  );
}
