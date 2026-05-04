import { useEffect, useMemo, useState } from "react";
import {
  MessageSquare, Github, CreditCard, BarChart3, FileText, Zap,
  HardDrive, Mail, Users, Briefcase, Figma, AlertTriangle, Plug,
  Search, MoreVertical, Plus, Power, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/dashboard/Header";
import { DesktopSidebar } from "@/components/dashboard/Sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  integrations as initialIntegrations,
  type Integration,
  type IntegrationCategory,
  type IntegrationStatus,
} from "@/data/mockData";

/**
 * Сторінка Integrations — каталог сторонніх сервісів з керуванням станом.
 * Як замінити мокові дані на API:
 *   const { data = [] } = useQuery({ queryKey: ["integrations"], queryFn: fetchIntegrations });
 *   const toggleMut = useMutation({ mutationFn: toggleIntegration });
 *   onCheckedChange={(v) => toggleMut.mutate({ id, enabled: v })}
 */

const iconMap: Record<Integration["iconKey"], LucideIcon> = {
  slack: MessageSquare,
  github: Github,
  stripe: CreditCard,
  google: BarChart3,
  notion: FileText,
  zapier: Zap,
  dropbox: HardDrive,
  mailchimp: Mail,
  hubspot: Users,
  jira: Briefcase,
  figma: Figma,
  sentry: AlertTriangle,
};

const categories: ("all" | IntegrationCategory)[] = [
  "all", "Communication", "Analytics", "Storage", "Payments", "DevOps", "CRM",
];

const statusMeta: Record<IntegrationStatus, { label: string; dot: string; text: string }> = {
  connected: { label: "Підключено", dot: "bg-success", text: "text-success" },
  disconnected: { label: "Вимкнено", dot: "bg-muted-foreground", text: "text-muted-foreground" },
  error: { label: "Помилка", dot: "bg-destructive", text: "text-destructive" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "щойно";
  if (m < 60) return `${m} хв тому`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} год тому`;
  return `${Math.round(h / 24)} дн тому`;
}

const Integrations = () => {
  const [items, setItems] = useState<Integration[]>(initialIntegrations);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | IntegrationCategory>("all");
  const [tab, setTab] = useState<"all" | "active" | "disabled" | "error">("all");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (query && !it.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (category !== "all" && it.category !== category) return false;
      if (tab === "active" && !it.enabled) return false;
      if (tab === "disabled" && it.enabled) return false;
      if (tab === "error" && it.status !== "error") return false;
      return true;
    });
  }, [items, query, category, tab]);

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((i) => i.enabled).length,
    errors: items.filter((i) => i.status === "error").length,
    events: items.reduce((s, i) => s + i.eventsToday, 0),
  }), [items]);

  const handleToggle = (id: string, value: boolean) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, enabled: value, status: value ? "connected" : "disconnected" }
          : it,
      ),
    );
    const target = items.find((i) => i.id === id);
    if (target) {
      toast.success(
        value ? `${target.name} увімкнено` : `${target.name} вимкнено`,
        { description: value ? "З'єднання активне" : "Синхронізацію зупинено" },
      );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <DesktopSidebar />

      <main className="pt-16 md:pl-60">
        <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Plug className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Інтеграції</h1>
                <p className="text-sm text-muted-foreground">
                  Підключайте сторонні сервіси та керуйте їх станом
                </p>
              </div>
            </div>
            <Button
              onClick={() => toast.info("Каталог інтеграцій", { description: "Відкриється у наступному релізі" })}
              aria-label="Додати інтеграцію"
            >
              <Plus className="h-4 w-4" />
              Додати інтеграцію
            </Button>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Усього", value: stats.total, tone: "text-foreground" },
              { label: "Активних", value: stats.active, tone: "text-success" },
              { label: "З помилками", value: stats.errors, tone: "text-destructive" },
              { label: "Подій сьогодні", value: stats.events.toLocaleString("uk-UA"), tone: "text-primary" },
            ].map((k) => (
              <Card key={k.label} className="p-4">
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className={cn("mt-1 text-2xl font-semibold tracking-tight", k.tone)}>
                  {k.value}
                </div>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Пошук за назвою..."
                    className="pl-9"
                    aria-label="Пошук інтеграцій"
                  />
                </div>
                <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                  <SelectTrigger className="w-full sm:w-[200px]" aria-label="Фільтр категорії">
                    <SelectValue placeholder="Категорія" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c === "all" ? "Усі категорії" : c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
                <TabsList>
                  <TabsTrigger value="all">Усі</TabsTrigger>
                  <TabsTrigger value="active">Активні</TabsTrigger>
                  <TabsTrigger value="disabled">Вимкнені</TabsTrigger>
                  <TabsTrigger value="error">Помилки</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </Card>

          {/* Grid */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-9 w-full" />
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-base font-semibold">Нічого не знайдено</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Спробуйте змінити фільтри або пошуковий запит.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => { setQuery(""); setCategory("all"); setTab("all"); }}
              >
                Скинути фільтри
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((it) => {
                const Icon = iconMap[it.iconKey];
                const meta = statusMeta[it.status];
                return (
                  <Card key={it.id} className="flex flex-col p-5 transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold leading-tight">{it.name}</div>
                          <Badge variant="outline" className="mt-1 text-[10px] font-medium">
                            {it.category}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Дії для ${it.name}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.info(`Налаштування ${it.name}`)}>
                            Налаштувати
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`З'єднання з ${it.name} перевірено`)}>
                            Тест з'єднання
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info(`Логи ${it.name}`)}>
                            Переглянути логи
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => toast.error(`${it.name} видалено`, { description: "Дію симульовано" })}
                          >
                            Видалити
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                      {it.description}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-border bg-secondary/30 p-3 text-xs">
                      <div>
                        <div className="text-muted-foreground">Останній sync</div>
                        <div className="mt-0.5 font-medium text-foreground">{timeAgo(it.lastSync)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Подій сьогодні</div>
                        <div className="mt-0.5 font-medium text-foreground">
                          {it.eventsToday.toLocaleString("uk-UA")}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={cn("h-2 w-2 rounded-full", meta.dot, it.status === "error" && "animate-pulse")} />
                        <span className={cn("font-medium", meta.text)}>{meta.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Power className="h-3.5 w-3.5 text-muted-foreground" />
                        <Switch
                          checked={it.enabled}
                          onCheckedChange={(v) => handleToggle(it.id, v)}
                          aria-label={`${it.enabled ? "Вимкнути" : "Увімкнути"} ${it.name}`}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Integrations;
