import { useEffect, useMemo, useState } from "react";
import {
  FileText, FileSpreadsheet, FileCode2, FileType, Plus, Search,
  Calendar, Download, Mail, MoreVertical, Play, Pause, Trash2, Copy,
  Clock, CheckCircle2, AlertCircle, Loader2, FileEdit,
  DollarSign, TrendingUp, Users, Activity, Settings2, Megaphone,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Header } from "@/components/dashboard/Header";
import { DesktopSidebar } from "@/components/dashboard/Sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  reportTemplates, scheduledReports as initialSchedules,
  generatedReports as initialReports,
  reportsActivityTimeline, reportsByCategory,
  type GeneratedReport, type ScheduledReport, type ReportFormat,
  type ReportStatus, type ReportCategory, type ReportFrequency,
} from "@/data/mockData";

const templateIconMap: Record<string, LucideIcon> = {
  revenue: DollarSign,
  growth: TrendingUp,
  users: Users,
  ops: Activity,
  custom: Settings2,
  marketing: Megaphone,
};

const formatIconMap: Record<ReportFormat, LucideIcon> = {
  PDF: FileType,
  Excel: FileSpreadsheet,
  CSV: FileText,
  JSON: FileCode2,
};

const statusMeta: Record<ReportStatus, { label: string; cls: string; Icon: LucideIcon }> = {
  ready: { label: "Готовий", cls: "bg-success/10 text-success border-success/20", Icon: CheckCircle2 },
  generating: { label: "Генерація", cls: "bg-primary/10 text-primary border-primary/20", Icon: Loader2 },
  scheduled: { label: "Заплановано", cls: "bg-secondary text-secondary-foreground border-border", Icon: Clock },
  failed: { label: "Помилка", cls: "bg-destructive/10 text-destructive border-destructive/20", Icon: AlertCircle },
  draft: { label: "Чернетка", cls: "bg-muted text-muted-foreground border-border", Icon: FileEdit },
};

const frequencyLabel: Record<ReportFrequency, string> = {
  once: "Одноразово", daily: "Щодня", weekly: "Щотижня",
  monthly: "Щомісяця", quarterly: "Щокварталу",
};

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (Math.abs(m) < 1) return "щойно";
  const future = m < 0;
  const abs = Math.abs(m);
  if (abs < 60) return future ? `через ${abs} хв` : `${abs} хв тому`;
  const h = Math.round(abs / 60);
  if (h < 24) return future ? `через ${h} год` : `${h} год тому`;
  const d = Math.round(h / 24);
  return future ? `через ${d} дн` : `${d} дн тому`;
}

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<GeneratedReport[]>(initialReports);
  const [schedules, setSchedules] = useState<ScheduledReport[]>(initialSchedules);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | ReportCategory>("all");
  const [format, setFormat] = useState<"all" | ReportFormat>("all");
  const [tab, setTab] = useState("library");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => reports.filter((r) => {
    if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (category !== "all" && r.category !== category) return false;
    if (format !== "all" && r.format !== format) return false;
    return true;
  }), [reports, query, category, format]);

  const stats = useMemo(() => ({
    total: reports.length,
    ready: reports.filter((r) => r.status === "ready").length,
    scheduled: schedules.filter((s) => s.enabled).length,
    downloads: reports.reduce((s, r) => s + r.downloads, 0),
  }), [reports, schedules]);

  const handleGenerate = (templateId?: string) => {
    const tpl = reportTemplates.find((t) => t.id === (templateId ?? selectedTemplate));
    if (!tpl) return;
    const newReport: GeneratedReport = {
      id: `rep_${Date.now()}`,
      name: `${tpl.name} — ${new Date().toLocaleDateString("uk-UA")}`,
      category: tpl.category,
      format: "PDF",
      status: "generating",
      size: "—",
      pages: 0,
      createdAt: new Date().toISOString(),
      createdBy: "admin@data.app",
      period: "Last 30 days",
      downloads: 0,
    };
    setReports((prev) => [newReport, ...prev]);
    setCreateOpen(false);
    setSelectedTemplate(null);
    toast.success("Звіт у черзі генерації", { description: tpl.name });
    // Симуляція готовності
    setTimeout(() => {
      setReports((prev) => prev.map((r) =>
        r.id === newReport.id
          ? { ...r, status: "ready", size: "1.2 MB", pages: 12 }
          : r
      ));
      toast.success("Звіт готовий", { description: newReport.name });
    }, 2400);
  };

  const handleDelete = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.success("Звіт видалено");
  };

  const handleDuplicate = (r: GeneratedReport) => {
    const copy = { ...r, id: `rep_${Date.now()}`, name: `${r.name} (копія)`, createdAt: new Date().toISOString(), downloads: 0 };
    setReports((prev) => [copy, ...prev]);
    toast.success("Звіт продубльовано");
  };

  const handleDownload = (r: GeneratedReport) => {
    setReports((prev) => prev.map((x) => x.id === r.id ? { ...x, downloads: x.downloads + 1 } : x));
    toast.success(`Завантаження ${r.format}`, { description: r.name });
  };

  const handleScheduleToggle = (id: string, value: boolean) => {
    setSchedules((prev) => prev.map((s) => s.id === id ? { ...s, enabled: value } : s));
    const s = schedules.find((x) => x.id === id);
    if (s) toast.success(value ? `Розклад "${s.name}" увімкнено` : `Розклад "${s.name}" призупинено`);
  };

  const handleScheduleDelete = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    toast.success("Розклад видалено");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <DesktopSidebar />

      <main className="pt-16 md:pl-60">
        <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6">
          {/* Page header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Звіти</h1>
                <p className="text-sm text-muted-foreground">
                  Шаблони, генерація, розклади та історія звітів
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => toast.info("Імпорт шаблону", { description: "Доступно в наступному релізі" })}>
                <FileEdit className="h-4 w-4" />
                Імпорт шаблону
              </Button>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4" />
                    Новий звіт
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[560px]">
                  <DialogHeader>
                    <DialogTitle>Створити звіт</DialogTitle>
                    <DialogDescription>
                      Оберіть шаблон і налаштуйте параметри генерації.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Шаблон</Label>
                      <Select value={selectedTemplate ?? ""} onValueChange={setSelectedTemplate}>
                        <SelectTrigger><SelectValue placeholder="Оберіть шаблон..." /></SelectTrigger>
                        <SelectContent>
                          {reportTemplates.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Період</Label>
                        <Select defaultValue="30d">
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7d">Останні 7 днів</SelectItem>
                            <SelectItem value="30d">Останні 30 днів</SelectItem>
                            <SelectItem value="90d">Останні 90 днів</SelectItem>
                            <SelectItem value="ytd">YTD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Формат</Label>
                        <Select defaultValue="PDF">
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PDF">PDF</SelectItem>
                            <SelectItem value="Excel">Excel</SelectItem>
                            <SelectItem value="CSV">CSV</SelectItem>
                            <SelectItem value="JSON">JSON</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Опис (необов'язково)</Label>
                      <Textarea placeholder="Додайте контекст для цього звіту..." rows={3} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateOpen(false)}>Скасувати</Button>
                    <Button onClick={() => handleGenerate()} disabled={!selectedTemplate}>
                      <Play className="h-4 w-4" />
                      Згенерувати
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Усього звітів", value: stats.total, tone: "text-foreground" },
              { label: "Готових", value: stats.ready, tone: "text-success" },
              { label: "Активних розкладів", value: stats.scheduled, tone: "text-primary" },
              { label: "Завантажень", value: stats.downloads.toLocaleString("uk-UA"), tone: "text-foreground" },
            ].map((k) => (
              <Card key={k.label} className="p-4">
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className={cn("mt-1 text-2xl font-semibold tracking-tight", k.tone)}>
                  {k.value}
                </div>
              </Card>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-4 lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Активність генерації</div>
                  <div className="text-xs text-muted-foreground">Останні 14 днів</div>
                </div>
                <Badge variant="outline" className="text-xs">14d</Badge>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reportsActivityTimeline}>
                    <defs>
                      <linearGradient id="repGen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="generated" name="Згенеровано" stroke="hsl(var(--primary))" fill="url(#repGen)" strokeWidth={2} />
                    <Area type="monotone" dataKey="scheduled" name="За розкладом" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3) / 0.15)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-4">
              <div className="mb-3">
                <div className="text-sm font-semibold">Розподіл за категоріями</div>
                <div className="text-xs text-muted-foreground">Усі згенеровані звіти</div>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={reportsByCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {reportsByCategory.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="library">Бібліотека шаблонів</TabsTrigger>
              <TabsTrigger value="generated">Згенеровані ({reports.length})</TabsTrigger>
              <TabsTrigger value="schedules">Розклади ({schedules.length})</TabsTrigger>
            </TabsList>

            {/* Templates */}
            <TabsContent value="library" className="space-y-4">
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="p-5 space-y-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-9 w-full" />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {reportTemplates.map((t) => {
                    const Icon = templateIconMap[t.iconKey];
                    return (
                      <Card key={t.id} className="flex flex-col p-5 transition-shadow hover:shadow-md">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                        </div>
                        <div className="mt-3 font-semibold">{t.name}</div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          <span>Популярність</span>
                          <span className="ml-auto font-medium text-foreground">{t.popularity}%</span>
                        </div>
                        <Progress value={t.popularity} className="mt-1 h-1" />
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" className="flex-1" onClick={() => handleGenerate(t.id)}>
                            <Play className="h-3.5 w-3.5" />
                            Згенерувати
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toast.info("Превʼю шаблону", { description: t.name })} aria-label="Превʼю">
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Generated */}
            <TabsContent value="generated" className="space-y-4">
              <Card className="p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Пошук звіту..." className="pl-9" />
                  </div>
                  <div className="flex gap-2">
                    <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                      <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Усі категорії</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Усі формати</SelectItem>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="Excel">Excel</SelectItem>
                        <SelectItem value="CSV">CSV</SelectItem>
                        <SelectItem value="JSON">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden">
                {loading ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-10 text-center">
                    <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-3 font-semibold">Звітів не знайдено</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Спробуйте змінити фільтри.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Назва</TableHead>
                        <TableHead>Категорія</TableHead>
                        <TableHead>Період</TableHead>
                        <TableHead>Формат</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Розмір</TableHead>
                        <TableHead>Створено</TableHead>
                        <TableHead className="text-right">Завант.</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((r) => {
                        const FmtIcon = formatIconMap[r.format];
                        const sm = statusMeta[r.status];
                        return (
                          <TableRow key={r.id}>
                            <TableCell>
                              <div className="font-medium">{r.name}</div>
                              <div className="text-xs text-muted-foreground">{r.createdBy}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{r.period}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-sm">
                                <FmtIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                {r.format}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn("gap-1 text-[10px]", sm.cls)}>
                                <sm.Icon className={cn("h-3 w-3", r.status === "generating" && "animate-spin")} />
                                {sm.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm tabular-nums">{r.size}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{timeAgo(r.createdAt)}</TableCell>
                            <TableCell className="text-right tabular-nums">{r.downloads}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" aria-label="Дії">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDownload(r)} disabled={r.status !== "ready"}>
                                    <Download className="h-4 w-4" />
                                    Завантажити
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toast.info("Надіслати email", { description: r.name })}>
                                    <Mail className="h-4 w-4" />
                                    Надіслати email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicate(r)}>
                                    <Copy className="h-4 w-4" />
                                    Дублювати
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleDelete(r.id)} className="text-destructive focus:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                    Видалити
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </TabsContent>

            {/* Schedules */}
            <TabsContent value="schedules" className="space-y-4">
              {loading ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-5"><Skeleton className="h-24 w-full" /></Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {schedules.map((s) => {
                    const FmtIcon = formatIconMap[s.format];
                    return (
                      <Card key={s.id} className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold">{s.name}</div>
                              <Badge variant="outline" className="text-[10px]">
                                <Calendar className="mr-1 h-3 w-3" />
                                {frequencyLabel[s.frequency]}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><FmtIcon className="h-3 w-3" />{s.format}</span>
                              <span>•</span>
                              <span>{s.owner}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={s.enabled} onCheckedChange={(v) => handleScheduleToggle(s.id, v)} aria-label="Увімкнути розклад" />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Дії">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast.info("Запустити зараз", { description: s.name })}>
                                  <Play className="h-4 w-4" />
                                  Запустити зараз
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.info("Редагування", { description: s.name })}>
                                  <FileEdit className="h-4 w-4" />
                                  Редагувати
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleScheduleDelete(s.id)}>
                                  <Trash2 className="h-4 w-4" />
                                  Видалити
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3 text-xs">
                          <div>
                            <div className="text-muted-foreground">Наступний запуск</div>
                            <div className="mt-0.5 font-medium text-foreground">{formatDate(s.nextRun)}</div>
                            <div className="text-[10px] text-muted-foreground">{timeAgo(s.nextRun)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Останній запуск</div>
                            <div className="mt-0.5 font-medium text-foreground">{formatDate(s.lastRun)}</div>
                            <div className="text-[10px] text-muted-foreground">{timeAgo(s.lastRun)}</div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <div className="flex flex-wrap gap-1">
                            {s.recipients.map((r) => (
                              <Badge key={r} variant="secondary" className="text-[10px] font-normal">{r}</Badge>
                            ))}
                          </div>
                        </div>

                        {!s.enabled && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Pause className="h-3 w-3" />
                            Розклад призупинено
                          </div>
                        )}
                      </Card>
                    );
                  })}

                  <Card className="flex min-h-[220px] flex-col items-center justify-center border-dashed p-5 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div className="mt-3 font-semibold">Новий розклад</div>
                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                      Налаштуйте автоматичну генерацію звітів за розкладом і відправку email-одержувачам.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => toast.info("Майстер розкладу", { description: "Доступно в наступному релізі" })}>
                      <Plus className="h-4 w-4" />
                      Створити розклад
                    </Button>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Reports;
