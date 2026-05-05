import { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  Users, Activity, MousePointerClick, Clock, DollarSign, Target,
  ArrowUp, ArrowDown, Calendar, Download, RefreshCw, Filter, Globe2,
  Smartphone, Monitor, Tablet, TrendingUp, TrendingDown, Eye, Share2,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/dashboard/Header";
import { DesktopSidebar } from "@/components/dashboard/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  analyticsKpis, analyticsTimeline, analyticsChannels, analyticsDevices,
  analyticsCountries, analyticsTopPages, analyticsCohorts, analyticsHeatmap,
  analyticsFunnel, analyticsEvents, type AnalyticsKpi,
} from "@/data/mockData";

/**
 * Analytics — Поглиблений аналітичний розділ
 * ─────────────────────────────────────────────
 * Замінити мок на real-time дані:
 *   const { data } = useQuery({ queryKey: ["analytics", period], queryFn: () => fetchAnalytics(period) });
 * Усі датасети у `src/data/mockData.ts` мають структуру, готову до бекенд-відповіді.
 */

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};

const PALETTE = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--accent-foreground))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
];

const kpiIconMap = {
  users: Users,
  session: Activity,
  bounce: MousePointerClick,
  duration: Clock,
  revenue: DollarSign,
  conversion: Target,
};

const deviceIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
};

function formatNumber(n: number): string {
  return n.toLocaleString("uk-UA");
}

function Sparkbar({ values, positive = true }: { values: number[]; positive?: boolean }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return (
    <div className="flex h-8 items-end gap-0.5">
      {values.map((v, i) => {
        const h = ((v - min) / range) * 100;
        return (
          <div
            key={i}
            className={`w-1 rounded-sm ${positive ? "bg-primary/60" : "bg-destructive/60"}`}
            style={{ height: `${Math.max(8, h)}%` }}
          />
        );
      })}
    </div>
  );
}

function KpiCard({ kpi, loading }: { kpi: AnalyticsKpi; loading: boolean }) {
  const Icon = kpiIconMap[kpi.iconKey];
  const positive = kpi.delta >= 0;
  // For bounce — inverted: lower is better
  const isGood = kpi.iconKey === "bounce" ? !positive : positive;

  if (loading) {
    return (
      <Card className="p-5">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-8 w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span>{kpi.title}</span>
        </div>
        <Badge
          variant="outline"
          className={`gap-1 ${isGood ? "border-success/40 text-success" : "border-destructive/40 text-destructive"}`}
        >
          {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {Math.abs(kpi.delta).toFixed(1)}%
        </Badge>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{kpi.value}</div>
      <div className="mt-3">
        <Sparkbar values={kpi.trend} positive={isGood} />
      </div>
    </Card>
  );
}

function CohortHeat({ value }: { value: number | null }) {
  if (value === null) {
    return <div className="h-9 rounded-md bg-muted/30" />;
  }
  // Color by intensity (0-100) using primary opacity
  const intensity = Math.min(1, value / 70);
  return (
    <div
      className="flex h-9 items-center justify-center rounded-md text-xs font-medium"
      style={{
        backgroundColor: `hsl(var(--primary) / ${0.08 + intensity * 0.6})`,
        color: intensity > 0.5 ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
      }}
    >
      {value}%
    </div>
  );
}

function HeatmapCell({ value, max }: { value: number; max: number }) {
  const intensity = value / max;
  return (
    <div
      className="h-6 rounded-sm transition-transform hover:scale-110"
      style={{ backgroundColor: `hsl(var(--primary) / ${0.05 + intensity * 0.85})` }}
      title={`${value} подій`}
    />
  );
}

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [compare, setCompare] = useState("prev");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const heatmapMax = useMemo(
    () => Math.max(...analyticsHeatmap.flatMap((d) => d.hours)),
    [],
  );

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Дані оновлено");
    }, 600);
  };

  const handleExport = () => {
    toast.success("Експорт CSV", { description: "Файл analytics-report.csv готовий до завантаження" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <DesktopSidebar />

      <main className="pt-16 md:pl-60">
        <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Аналітика</h1>
              <p className="text-sm text-muted-foreground">
                Поведінка користувачів, конверсії та утримання — у реальному часі
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[140px]" aria-label="Період">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 днів</SelectItem>
                  <SelectItem value="30d">30 днів</SelectItem>
                  <SelectItem value="90d">90 днів</SelectItem>
                  <SelectItem value="ytd">З початку року</SelectItem>
                </SelectContent>
              </Select>
              <Select value={compare} onValueChange={setCompare}>
                <SelectTrigger className="w-[180px]" aria-label="Порівняння">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prev">vs попередній період</SelectItem>
                  <SelectItem value="year">vs торік</SelectItem>
                  <SelectItem value="none">без порівняння</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleRefresh} aria-label="Оновити">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Експорт
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {analyticsKpis.map((k) => (
              <KpiCard key={k.id} kpi={k} loading={loading} />
            ))}
          </div>

          {/* Main timeline + devices */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">Активність користувачів</h2>
                  <p className="text-xs text-muted-foreground">Поточний vs попередній період</p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  +14.2%
                </Badge>
              </div>
              {loading ? (
                <Skeleton className="h-[280px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={analyticsTimeline}>
                    <defs>
                      <linearGradient id="curGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area
                      type="monotone" dataKey="previous" name="Попередній"
                      stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4"
                      fill="url(#prevGrad)" strokeWidth={2}
                    />
                    <Area
                      type="monotone" dataKey="current" name="Поточний"
                      stroke="hsl(var(--primary))" fill="url(#curGrad)" strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="mb-4 text-base font-semibold">Пристрої</h2>
              {loading ? (
                <Skeleton className="h-[280px] w-full" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={analyticsDevices}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {analyticsDevices.map((_, i) => (
                          <Cell key={i} fill={PALETTE[i]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {analyticsDevices.map((d, i) => {
                      const Icon = deviceIconMap[d.name];
                      return (
                        <div key={d.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span>{d.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: PALETTE[i] }}
                            />
                            <span className="font-medium tabular-nums">{d.value}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Tabs section */}
          <Tabs defaultValue="acquisition">
            <TabsList>
              <TabsTrigger value="acquisition">Залучення</TabsTrigger>
              <TabsTrigger value="behavior">Поведінка</TabsTrigger>
              <TabsTrigger value="conversion">Конверсії</TabsTrigger>
              <TabsTrigger value="retention">Утримання</TabsTrigger>
              <TabsTrigger value="events">Події</TabsTrigger>
            </TabsList>

            {/* Acquisition */}
            <TabsContent value="acquisition" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="p-5 lg:col-span-2">
                  <h2 className="mb-4 text-base font-semibold">Канали залучення</h2>
                  {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsChannels} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis dataKey="name" type="category" width={110} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="users" name="Користувачі" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Card>

                <Card className="p-5">
                  <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
                    <Globe2 className="h-4 w-4" />
                    Топ країн
                  </h2>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analyticsCountries.map((c) => {
                        const max = analyticsCountries[0].users;
                        const pct = (c.users / max) * 100;
                        return (
                          <div key={c.code} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span className="text-base">{c.flag}</span>
                                <span>{c.name}</span>
                              </span>
                              <span className="font-medium tabular-nums text-muted-foreground">
                                {formatNumber(c.users)}
                              </span>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>

              <Card className="p-5">
                <h2 className="mb-4 text-base font-semibold">Конверсія за каналами</h2>
                {loading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                          <th className="pb-2 font-medium">Канал</th>
                          <th className="pb-2 font-medium">Користувачі</th>
                          <th className="pb-2 font-medium">Сесії</th>
                          <th className="pb-2 font-medium">Конверсія</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {analyticsChannels.map((c) => (
                          <tr key={c.name} className="hover:bg-muted/40">
                            <td className="py-2.5 font-medium">{c.name}</td>
                            <td className="py-2.5 tabular-nums">{formatNumber(c.users)}</td>
                            <td className="py-2.5 tabular-nums">{formatNumber(c.sessions)}</td>
                            <td className="py-2.5">
                              <Badge variant="outline" className="border-success/40 text-success">
                                {c.conversion.toFixed(1)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Behavior */}
            <TabsContent value="behavior" className="space-y-4">
              <Card className="p-5">
                <h2 className="mb-4 text-base font-semibold">Топ сторінок</h2>
                {loading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                          <th className="pb-2 font-medium">Сторінка</th>
                          <th className="pb-2 font-medium">Перегляди</th>
                          <th className="pb-2 font-medium">Час</th>
                          <th className="pb-2 font-medium">Bounce</th>
                          <th className="pb-2 text-right font-medium">Дії</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {analyticsTopPages.map((p) => (
                          <tr key={p.path} className="hover:bg-muted/40">
                            <td className="py-2.5">
                              <div className="font-medium">{p.title}</div>
                              <div className="text-xs text-muted-foreground">{p.path}</div>
                            </td>
                            <td className="py-2.5 tabular-nums">{formatNumber(p.views)}</td>
                            <td className="py-2.5 tabular-nums text-muted-foreground">{p.avgTime}</td>
                            <td className="py-2.5">
                              <span className={p.bounce > 35 ? "text-destructive" : "text-success"}>
                                {p.bounce}%
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              <Button variant="ghost" size="icon" aria-label="Переглянути">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              <Card className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold">Heatmap активності</h2>
                    <p className="text-xs text-muted-foreground">Розподіл подій за днями та годинами</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Менше</span>
                    <div className="flex gap-0.5">
                      {[0.1, 0.3, 0.5, 0.7, 0.9].map((o) => (
                        <div key={o} className="h-3 w-3 rounded-sm" style={{ backgroundColor: `hsl(var(--primary) / ${o})` }} />
                      ))}
                    </div>
                    <span>Більше</span>
                  </div>
                </div>
                {loading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-[640px]">
                      <div className="mb-1 ml-8 grid grid-cols-24 gap-0.5" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
                        {Array.from({ length: 24 }).map((_, h) => (
                          <div key={h} className="text-center text-[10px] text-muted-foreground">
                            {h % 3 === 0 ? h : ""}
                          </div>
                        ))}
                      </div>
                      {analyticsHeatmap.map((row) => (
                        <div key={row.day} className="mb-0.5 flex items-center gap-2">
                          <div className="w-6 text-xs text-muted-foreground">{row.day}</div>
                          <div className="grid flex-1 gap-0.5" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
                            {row.hours.map((v, h) => (
                              <HeatmapCell key={h} value={v} max={heatmapMax} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Conversion */}
            <TabsContent value="conversion" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="p-5">
                  <h2 className="mb-4 text-base font-semibold">Воронка конверсії</h2>
                  {loading ? (
                    <Skeleton className="h-[320px] w-full" />
                  ) : (
                    <div className="space-y-3">
                      {analyticsFunnel.map((stage, i) => {
                        const next = analyticsFunnel[i + 1];
                        const drop = next ? ((stage.value - next.value) / stage.value) * 100 : 0;
                        return (
                          <div key={stage.stage}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                              <span className="font-medium">{stage.stage}</span>
                              <div className="flex items-center gap-3">
                                <span className="tabular-nums text-muted-foreground">
                                  {formatNumber(stage.value)}
                                </span>
                                <Badge variant="outline">{stage.conversion.toFixed(1)}%</Badge>
                              </div>
                            </div>
                            <div className="relative h-8 overflow-hidden rounded-md bg-muted">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                                style={{ width: `${stage.conversion}%` }}
                              />
                            </div>
                            {next && (
                              <div className="ml-2 mt-1 text-xs text-destructive">
                                ↓ Відсіялось {drop.toFixed(1)}%
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                <Card className="p-5">
                  <h2 className="mb-4 text-base font-semibold">Конверсія в часі</h2>
                  {loading ? (
                    <Skeleton className="h-[320px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={analyticsTimeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line
                          type="monotone" dataKey="current" name="Поточний"
                          stroke="hsl(var(--success))" strokeWidth={2} dot={false}
                        />
                        <Line
                          type="monotone" dataKey="previous" name="Попередній"
                          stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="4 4" dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* Retention */}
            <TabsContent value="retention" className="space-y-4">
              <Card className="p-5">
                <div className="mb-4">
                  <h2 className="text-base font-semibold">Cohort retention</h2>
                  <p className="text-xs text-muted-foreground">Відсоток повернення користувачів за тижнями</p>
                </div>
                {loading ? (
                  <Skeleton className="h-[320px] w-full" />
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-[720px]">
                      <div className="mb-2 grid gap-1 text-xs text-muted-foreground" style={{ gridTemplateColumns: "120px 80px repeat(8, minmax(0, 1fr))" }}>
                        <div>Когорта</div>
                        <div>Розмір</div>
                        {Array.from({ length: 8 }).map((_, w) => (
                          <div key={w} className="text-center">Тиж {w}</div>
                        ))}
                      </div>
                      {analyticsCohorts.map((c) => (
                        <div key={c.cohort} className="mb-1 grid gap-1 text-sm" style={{ gridTemplateColumns: "120px 80px repeat(8, minmax(0, 1fr))" }}>
                          <div className="flex items-center font-medium">{c.cohort}</div>
                          <div className="flex items-center text-muted-foreground tabular-nums">{formatNumber(c.size)}</div>
                          {c.weeks.map((v, w) => <CohortHeat key={w} value={v} />)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Events */}
            <TabsContent value="events" className="space-y-4">
              <Card className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold">Події застосунку</h2>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                    Експорт
                  </Button>
                </div>
                {loading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {analyticsEvents.map((e) => {
                      const positive = e.change >= 0;
                      return (
                        <div key={e.id} className="rounded-lg border bg-card/50 p-4 transition-colors hover:bg-muted/40">
                          <div className="font-mono text-xs text-muted-foreground">{e.name}</div>
                          <div className="mt-1 text-2xl font-semibold tabular-nums">{formatNumber(e.count)}</div>
                          <div className={`mt-1 flex items-center gap-1 text-xs ${positive ? "text-success" : "text-destructive"}`}>
                            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {positive ? "+" : ""}{e.change.toFixed(1)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Analytics;