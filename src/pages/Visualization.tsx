import { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  BarChart3, LineChart as LineIcon, PieChart as PieIcon, Activity, Radar as RadarIcon,
  Hash, Plus, Save, Share2, Download, Trash2, GripVertical, Settings2, Maximize2,
  ArrowUp, ArrowDown, LayoutGrid, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/dashboard/Header";
import { DesktopSidebar } from "@/components/dashboard/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  defaultWidgets, widgetLibrary, savedDashboards,
  revenueTimeline, trafficByChannel, conversionFunnel, performanceRadar, ingestionTimeline,
  type DashboardWidget, type ChartKind,
} from "@/data/mockData";

const PALETTE = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--info))",
  "hsl(var(--destructive))",
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};

const kindIcon: Record<ChartKind, React.ComponentType<{ className?: string }>> = {
  kpi: Hash,
  line: LineIcon,
  area: Activity,
  bar: BarChart3,
  pie: PieIcon,
  radar: RadarIcon,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "щойно";
  if (m < 60) return `${m} хв тому`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} год тому`;
  return `${Math.floor(h / 24)} дн тому`;
}

function sampleDataFor(kind: ChartKind) {
  switch (kind) {
    case "line": return ingestionTimeline;
    case "area": return revenueTimeline;
    case "bar": return conversionFunnel;
    case "pie": return trafficByChannel;
    case "radar": return performanceRadar;
    default: return undefined;
  }
}

function WidgetChart({ w }: { w: DashboardWidget }) {
  if (w.kind === "kpi") {
    const positive = (w.delta ?? 0) >= 0;
    return (
      <div className="flex h-full flex-col justify-between">
        <div className="text-3xl font-semibold tracking-tight">{w.value}</div>
        <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
          {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {Math.abs(w.delta ?? 0)}% за тиждень
        </div>
      </div>
    );
  }

  const data = w.data ?? [];

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        {w.kind === "line" ? (
          <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="records" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="errors" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
          </LineChart>
        ) : w.kind === "area" ? (
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#gRev)" strokeWidth={2} />
            <Area type="monotone" dataKey="cost" stroke="hsl(var(--warning))" fill="url(#gCost)" strokeWidth={2} />
          </AreaChart>
        ) : w.kind === "bar" ? (
          <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : w.kind === "pie" ? (
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        ) : (
          <RadarChart data={data} outerRadius={80}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <Radar name="Поточний" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
            <Radar name="Попередній" dataKey="B" stroke="hsl(var(--info))" fill="hsl(var(--info))" fillOpacity={0.25} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
          </RadarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

const Visualization = () => {
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(defaultWidgets);
  const [period, setPeriod] = useState("30d");
  const [editMode, setEditMode] = useState(false);
  const [libOpen, setLibOpen] = useState(false);
  const [activeDash, setActiveDash] = useState(savedDashboards[0].id);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const stats = useMemo(() => ({
    total: widgets.length,
    kpis: widgets.filter(w => w.kind === "kpi").length,
    charts: widgets.filter(w => w.kind !== "kpi").length,
  }), [widgets]);

  const addWidget = (kind: ChartKind) => {
    const meta = widgetLibrary.find(w => w.kind === kind)!;
    const id = `w${Date.now()}`;
    const next: DashboardWidget = kind === "kpi"
      ? { id, kind, title: "Новий KPI", value: "0", delta: 0 }
      : { id, kind, title: meta.title, description: meta.description, data: sampleDataFor(kind) as DashboardWidget["data"] };
    setWidgets(w => [...w, next]);
    setLibOpen(false);
    toast.success(`Додано віджет: ${meta.title}`);
  };

  const removeWidget = (id: string) => {
    setWidgets(w => w.filter(x => x.id !== id));
    toast("Віджет видалено");
  };

  const duplicateWidget = (id: string) => {
    setWidgets(w => {
      const idx = w.findIndex(x => x.id === id);
      if (idx < 0) return w;
      const copy = { ...w[idx], id: `w${Date.now()}`, title: `${w[idx].title} (копія)` };
      const arr = [...w];
      arr.splice(idx + 1, 0, copy);
      return arr;
    });
    toast.success("Віджет продубльовано");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <DesktopSidebar />

      <main className="pt-16 md:pl-60">
        <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6">
          {/* Заголовок + дії */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Візуалізація</h1>
              <p className="text-sm text-muted-foreground">
                Конструктор дашбордів — додавайте, переставляйте та зберігайте віджети
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32" aria-label="Період">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 години</SelectItem>
                  <SelectItem value="7d">7 днів</SelectItem>
                  <SelectItem value="30d">30 днів</SelectItem>
                  <SelectItem value="90d">90 днів</SelectItem>
                  <SelectItem value="1y">1 рік</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={editMode ? "default" : "outline"}
                size="sm"
                onClick={() => setEditMode(v => !v)}
                aria-label="Перемкнути режим редагування"
              >
                {editMode ? <><Eye className="h-4 w-4" /> Перегляд</> : <><LayoutGrid className="h-4 w-4" /> Редагувати</>}
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("Дашборд збережено")} aria-label="Зберегти">
                <Save className="h-4 w-4" /> Зберегти
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast("Посилання скопійовано")} aria-label="Поділитися">
                <Share2 className="h-4 w-4" /> Поділитися
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("Експорт у PNG почався")} aria-label="Експорт">
                <Download className="h-4 w-4" /> Експорт
              </Button>
              <Button size="sm" onClick={() => setLibOpen(true)} aria-label="Додати віджет">
                <Plus className="h-4 w-4" /> Віджет
              </Button>
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Усього віджетів", value: stats.total, icon: LayoutGrid },
              { label: "KPI карток", value: stats.kpis, icon: Hash },
              { label: "Графіків", value: stats.charts, icon: BarChart3 },
              { label: "Збережені дашборди", value: savedDashboards.length, icon: Save },
            ].map(s => (
              <Card key={s.label} className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <s.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xl font-semibold leading-none">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="canvas" className="space-y-4">
            <TabsList>
              <TabsTrigger value="canvas">Полотно</TabsTrigger>
              <TabsTrigger value="dashboards">Збережені</TabsTrigger>
              <TabsTrigger value="library">Бібліотека</TabsTrigger>
            </TabsList>

            {/* CANVAS */}
            <TabsContent value="canvas" className="space-y-4">
              {/* Перемикач збережених */}
              <div className="flex flex-wrap items-center gap-2">
                {savedDashboards.map(d => (
                  <button
                    key={d.id}
                    onClick={() => { setActiveDash(d.id); toast(`Відкрито: ${d.name}`); }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeDash === d.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label={`Дашборд ${d.name}`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="p-5"><Skeleton className="h-48 w-full" /></Card>
                  ))}
                </div>
              ) : widgets.length === 0 ? (
                <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
                  <LayoutGrid className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">Полотно порожнє</h3>
                    <p className="text-sm text-muted-foreground">Додайте перший віджет, щоб почати</p>
                  </div>
                  <Button onClick={() => setLibOpen(true)}>
                    <Plus className="h-4 w-4" /> Додати віджет
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {widgets.map((w) => {
                    const Icon = kindIcon[w.kind];
                    const span = w.kind === "kpi" ? "" : "md:col-span-2";
                    return (
                      <Card
                        key={w.id}
                        className={`group relative flex flex-col gap-3 p-5 transition-shadow ${span} ${editMode ? "ring-1 ring-dashed ring-border hover:ring-primary" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {editMode && (
                              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" aria-hidden />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                <h3 className="truncate text-sm font-semibold">{w.title}</h3>
                              </div>
                              {w.description && (
                                <p className="truncate text-xs text-muted-foreground">{w.description}</p>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" aria-label="Меню віджета">
                                <Settings2 className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast("Налаштування відкрито")}>
                                <Settings2 className="h-4 w-4" /> Налаштувати
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast("Розгорнуто")}>
                                <Maximize2 className="h-4 w-4" /> Розгорнути
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => duplicateWidget(w.id)}>
                                <Plus className="h-4 w-4" /> Дублювати
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => removeWidget(w.id)}>
                                <Trash2 className="h-4 w-4" /> Видалити
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex-1">
                          <WidgetChart w={w} />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* SAVED */}
            <TabsContent value="dashboards">
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b p-4">
                  <div>
                    <h3 className="text-sm font-semibold">Збережені дашборди</h3>
                    <p className="text-xs text-muted-foreground">Колекція командних і особистих звітів</p>
                  </div>
                  <div className="relative">
                    <Input placeholder="Пошук..." className="w-56" aria-label="Пошук дашбордів" />
                  </div>
                </div>
                <ul className="divide-y">
                  {savedDashboards.map(d => (
                    <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-muted/40">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{d.name}</h4>
                          <Badge variant="secondary">{d.widgets} віджетів</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{d.description}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Оновлено {timeAgo(d.updatedAt)} · {d.owner}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setActiveDash(d.id); toast(`Відкрито: ${d.name}`); }}>
                          <Eye className="h-4 w-4" /> Відкрити
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toast.success("Дублікат створено")}>
                          Дублювати
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>

            {/* LIBRARY */}
            <TabsContent value="library">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {widgetLibrary.map(item => {
                  const Icon = kindIcon[item.kind];
                  return (
                    <Card key={item.kind} className="flex flex-col gap-3 p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-xs uppercase">{item.kind}</Badge>
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-auto" onClick={() => addWidget(item.kind)}>
                        <Plus className="h-4 w-4" /> Додати на полотно
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Діалог бібліотеки */}
      <Dialog open={libOpen} onOpenChange={setLibOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Додати віджет</DialogTitle>
            <DialogDescription>Оберіть тип візуалізації для полотна</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {widgetLibrary.map(item => {
              const Icon = kindIcon[item.kind];
              return (
                <button
                  key={item.kind}
                  onClick={() => addWidget(item.kind)}
                  className="flex flex-col items-start gap-2 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent"
                  aria-label={`Додати ${item.title}`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLibOpen(false)}>Закрити</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Visualization;
