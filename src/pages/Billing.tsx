import { useEffect, useMemo, useState } from "react";
import {
  CreditCard, Download, Plus, Check, Sparkles, AlertCircle, CheckCircle2,
  Clock, RefreshCw, TrendingUp, Wallet, Receipt, Zap, Calendar,
  MoreVertical, Trash2, Star, ShieldCheck, ArrowUpRight, ArrowDownRight,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import { Header } from "@/components/dashboard/Header";
import { DesktopSidebar } from "@/components/dashboard/Sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  billingPlans, currentPlanId, usageMetrics, invoices as initialInvoices,
  paymentMethods as initialMethods, billingHistory, upcomingCharges,
  type Invoice, type InvoiceStatus, type PaymentMethod, type PlanTier,
} from "@/data/mockData";

const statusMeta: Record<InvoiceStatus, { label: string; cls: string; Icon: LucideIcon }> = {
  paid: { label: "Сплачено", cls: "bg-success/10 text-success border-success/20", Icon: CheckCircle2 },
  pending: { label: "Очікує", cls: "bg-primary/10 text-primary border-primary/20", Icon: Clock },
  failed: { label: "Помилка", cls: "bg-destructive/10 text-destructive border-destructive/20", Icon: AlertCircle },
  refunded: { label: "Повернуто", cls: "bg-muted text-muted-foreground border-border", Icon: RefreshCw },
};

function formatMoney(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0 })}`;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", { day: "2-digit", month: "short", year: "numeric" });
}
function formatNum(n: number) {
  if (n >= 1_000_000_000) return "∞";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

const Billing = () => {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [planId, setPlanId] = useState<PlanTier>(currentPlanId);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);
  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceStatus>("all");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PlanTier | null>(null);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const currentPlan = useMemo(() => billingPlans.find((p) => p.id === planId)!, [planId]);
  const filteredInvoices = useMemo(
    () => statusFilter === "all" ? invoices : invoices.filter((i) => i.status === statusFilter),
    [invoices, statusFilter]
  );

  const totals = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
    const pending = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);
    const upcoming = upcomingCharges.reduce((s, c) => s + c.amount, 0);
    return { paid, pending, upcoming, count: invoices.length };
  }, [invoices]);

  const handleSelectPlan = (id: PlanTier) => {
    if (id === planId) return;
    setPendingPlan(id);
    setUpgradeOpen(true);
  };

  const confirmPlanChange = () => {
    if (!pendingPlan) return;
    const isUpgrade = billingPlans.findIndex((p) => p.id === pendingPlan) > billingPlans.findIndex((p) => p.id === planId);
    setPlanId(pendingPlan);
    setUpgradeOpen(false);
    toast.success(isUpgrade ? "План оновлено" : "План змінено", {
      description: `Ваш новий тариф: ${billingPlans.find((p) => p.id === pendingPlan)?.name}`,
    });
    setPendingPlan(null);
  };

  const handleDownloadInvoice = (inv: Invoice) => {
    toast.success("Завантаження рахунку", { description: inv.number });
  };

  const handlePayInvoice = (id: string) => {
    setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, status: "paid" } : i));
    toast.success("Оплату прийнято");
  };

  const handleSetDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
    toast.success("Метод оплати за замовчуванням оновлено");
  };

  const handleDeleteMethod = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
    toast.success("Метод оплати видалено");
  };

  const handleAddCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const number = String(fd.get("number") ?? "");
    const last4 = number.replace(/\s/g, "").slice(-4) || "0000";
    const newCard: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: "card",
      brand: number.startsWith("4") ? "Visa" : "Mastercard",
      last4,
      expMonth: Number(fd.get("expMonth") ?? 12),
      expYear: Number(fd.get("expYear") ?? 2028),
      holder: String(fd.get("holder") ?? "—"),
      isDefault: methods.length === 0,
    };
    setMethods((prev) => [...prev, newCard]);
    setAddCardOpen(false);
    toast.success("Картку додано", { description: `•••• ${last4}` });
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
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Тарифи та оплата</h1>
                <p className="text-sm text-muted-foreground">
                  Підписка, рахунки, методи оплати та використання ресурсів
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.success("Звіт надіслано на e-mail")}>
                <Download className="h-4 w-4" /> Експорт історії
              </Button>
              <Button size="sm" onClick={() => setTab("plans")}>
                <Sparkles className="h-4 w-4" /> Оновити план
              </Button>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            )) : (
              <>
                <KpiCard icon={Wallet} title="Поточний план" value={currentPlan.name}
                  hint={`${formatMoney(billingCycle === "yearly" ? currentPlan.priceYearly : currentPlan.price)}/${billingCycle === "yearly" ? "рік" : "міс"}`} />
                <KpiCard icon={Receipt} title="Сплачено цього року" value={formatMoney(totals.paid)}
                  hint={`${totals.count} рахунків`} delta={8.4} />
                <KpiCard icon={Clock} title="Очікує оплати" value={formatMoney(totals.pending)}
                  hint="Найближчий термін: 7 днів" tone={totals.pending > 0 ? "warn" : "ok"} />
                <KpiCard icon={Calendar} title="Наступне списання" value={formatMoney(totals.upcoming)}
                  hint="01 червня 2026" />
              </>
            )}
          </div>

          <Tabs value={tab} onValueChange={setTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Огляд</TabsTrigger>
              <TabsTrigger value="plans">Тарифи</TabsTrigger>
              <TabsTrigger value="usage">Використання</TabsTrigger>
              <TabsTrigger value="invoices">Рахунки</TabsTrigger>
              <TabsTrigger value="methods">Методи оплати</TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Current plan */}
                <Card className="p-6 lg:col-span-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{currentPlan.name}</h3>
                        <Badge className="border bg-primary/10 text-primary border-primary/20">Активний</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{currentPlan.description}</p>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-4xl font-bold tracking-tight">
                          {formatMoney(billingCycle === "yearly" ? currentPlan.priceYearly : currentPlan.price)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /{billingCycle === "yearly" ? "рік" : "місяць"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Наступне списання — 01.06.2026
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" onClick={() => setTab("plans")}>
                        <ArrowUpRight className="h-4 w-4" /> Змінити план
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toast.success("Запит на скасування надіслано")}>
                        Скасувати
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-5" />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Switch id="autorenew" checked={autoRenew} onCheckedChange={(v) => {
                        setAutoRenew(v);
                        toast.success(v ? "Автопоновлення увімкнено" : "Автопоновлення вимкнено");
                      }} />
                      <Label htmlFor="autorenew" className="cursor-pointer">Автопоновлення підписки</Label>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-success" /> Безпечні платежі через Stripe
                    </div>
                  </div>
                </Card>

                {/* Default payment method */}
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">Метод оплати</h3>
                    <Button variant="ghost" size="sm" onClick={() => setTab("methods")}>Змінити</Button>
                  </div>
                  {(() => {
                    const def = methods.find((m) => m.isDefault);
                    if (!def) return <p className="mt-4 text-sm text-muted-foreground">Не налаштовано</p>;
                    return (
                      <div className="mt-3 rounded-lg border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{def.brand}</span>
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="mt-6 font-mono text-lg tracking-widest">
                          •••• •••• •••• {def.last4}
                        </div>
                        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                          <span>{def.holder}</span>
                          {def.expMonth && <span>{String(def.expMonth).padStart(2, "0")}/{def.expYear}</span>}
                        </div>
                      </div>
                    );
                  })()}
                </Card>
              </div>

              {/* Charts row */}
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="p-6 lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold">Витрати за 12 місяців</h3>
                      <p className="text-xs text-muted-foreground">Сума щомісячних рахунків</p>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <TrendingUp className="h-3 w-3" /> +14% YoY
                    </Badge>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={billingHistory}>
                        <defs>
                          <linearGradient id="bgrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                          formatter={(v: number) => [`$${v}`, "Сума"]}
                        />
                        <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="url(#bgrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-base font-semibold">Майбутні списання</h3>
                  <p className="text-xs text-muted-foreground">01 червня 2026</p>
                  <div className="mt-4 space-y-3">
                    {upcomingCharges.map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(c.date)}</p>
                        </div>
                        <span className="font-mono text-sm font-semibold">{formatMoney(c.amount)}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-medium">Разом</span>
                      <span className="font-mono text-base font-bold text-primary">{formatMoney(totals.upcoming)}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent invoices preview */}
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold">Останні рахунки</h3>
                  <Button variant="ghost" size="sm" onClick={() => setTab("invoices")}>
                    Усі рахунки <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
                <InvoicesTable
                  rows={invoices.slice(0, 5)}
                  onDownload={handleDownloadInvoice}
                  onPay={handlePayInvoice}
                  compact
                />
              </Card>
            </TabsContent>

            {/* PLANS */}
            <TabsContent value="plans" className="space-y-6">
              <div className="flex items-center justify-center gap-3">
                <span className={cn("text-sm", billingCycle === "monthly" && "font-semibold")}>Щомісячно</span>
                <Switch
                  checked={billingCycle === "yearly"}
                  onCheckedChange={(v) => setBillingCycle(v ? "yearly" : "monthly")}
                />
                <span className={cn("text-sm", billingCycle === "yearly" && "font-semibold")}>
                  Щорічно <Badge variant="outline" className="ml-1 border-success/30 bg-success/10 text-success">−17%</Badge>
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {billingPlans.map((plan) => {
                  const isCurrent = plan.id === planId;
                  const price = billingCycle === "yearly" ? plan.priceYearly : plan.price;
                  return (
                    <Card key={plan.id} className={cn(
                      "relative flex flex-col p-6 transition-all hover:shadow-md",
                      plan.highlighted && "border-primary ring-1 ring-primary/30",
                      isCurrent && "bg-primary/5"
                    )}>
                      {plan.highlighted && (
                        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                          <Star className="h-3 w-3" /> Популярний
                        </Badge>
                      )}
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{formatMoney(price)}</span>
                        <span className="text-xs text-muted-foreground">
                          /{billingCycle === "yearly" ? "рік" : "міс"}
                        </span>
                      </div>
                      <ul className="mt-5 flex-1 space-y-2">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="mt-6"
                        variant={isCurrent ? "outline" : plan.highlighted ? "default" : "secondary"}
                        disabled={isCurrent}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        {isCurrent ? "Поточний план"
                          : billingPlans.findIndex((p) => p.id === plan.id) > billingPlans.findIndex((p) => p.id === planId)
                            ? "Оновити" : "Перейти"}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* USAGE */}
            <TabsContent value="usage" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {usageMetrics.map((m) => {
                  const pct = Math.min(100, Math.round((m.used / m.limit) * 100));
                  const tone = pct >= 90 ? "destructive" : pct >= 70 ? "primary" : "success";
                  return (
                    <Card key={m.id} className="p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{m.name}</span>
                        <Badge variant="outline" className={cn(
                          tone === "destructive" && "border-destructive/30 bg-destructive/10 text-destructive",
                          tone === "primary" && "border-primary/30 bg-primary/10 text-primary",
                          tone === "success" && "border-success/30 bg-success/10 text-success",
                        )}>{pct}%</Badge>
                      </div>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-2xl font-semibold">{formatNum(m.used)}{m.unit}</span>
                        <span className="text-xs text-muted-foreground">з {formatNum(m.limit)}{m.unit}</span>
                      </div>
                      <Progress value={pct} className="mt-3 h-2" />
                    </Card>
                  );
                })}
              </div>

              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">Динаміка використання</h3>
                    <p className="text-xs text-muted-foreground">Записи опрацьовано за місяць</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={billingHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v: number) => formatNum(v)} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                        formatter={(v: number) => [v.toLocaleString(), "Записи"]}
                      />
                      <Bar dataKey="usage" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Потрібно більше ресурсів?</h3>
                    <p className="text-sm text-muted-foreground">
                      Оновіть свій план або придбайте додаткові пакети.
                    </p>
                  </div>
                  <Button onClick={() => setTab("plans")}>Оновити план</Button>
                </div>
              </Card>
            </TabsContent>

            {/* INVOICES */}
            <TabsContent value="invoices" className="space-y-4">
              <Card className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as never)}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Усі статуси</SelectItem>
                      <SelectItem value="paid">Сплачені</SelectItem>
                      <SelectItem value="pending">Очікують</SelectItem>
                      <SelectItem value="failed">Помилка</SelectItem>
                      <SelectItem value="refunded">Повернуті</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    Знайдено: {filteredInvoices.length}
                  </span>
                  <div className="ml-auto">
                    <Button variant="outline" size="sm" onClick={() => toast.success("Експорт CSV...")}>
                      <Download className="h-4 w-4" /> Експорт CSV
                    </Button>
                  </div>
                </div>
              </Card>
              <Card className="p-0 overflow-hidden">
                <InvoicesTable
                  rows={filteredInvoices}
                  onDownload={handleDownloadInvoice}
                  onPay={handlePayInvoice}
                />
              </Card>
            </TabsContent>

            {/* PAYMENT METHODS */}
            <TabsContent value="methods" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Методи оплати</h3>
                  <p className="text-sm text-muted-foreground">Керуйте картками та способами розрахунків</p>
                </div>
                <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4" /> Додати картку</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Нова банківська картка</DialogTitle>
                      <DialogDescription>Дані захищено та шифровано (PCI DSS).</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddCard} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="holder">Власник картки</Label>
                        <Input id="holder" name="holder" placeholder="JOHN DOE" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="number">Номер картки</Label>
                        <Input id="number" name="number" placeholder="4242 4242 4242 4242" required />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="expMonth">Місяць</Label>
                          <Input id="expMonth" name="expMonth" placeholder="12" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expYear">Рік</Label>
                          <Input id="expYear" name="expYear" placeholder="2028" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" name="cvv" placeholder="123" required />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setAddCardOpen(false)}>Скасувати</Button>
                        <Button type="submit">Додати</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {methods.map((m) => (
                  <Card key={m.id} className={cn(
                    "p-5 transition-all",
                    m.isDefault && "border-primary ring-1 ring-primary/20"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{m.brand}</p>
                          <p className="text-xs text-muted-foreground">
                            {m.type === "card" ? `•••• ${m.last4}` : m.last4}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!m.isDefault && (
                            <DropdownMenuItem onClick={() => handleSetDefault(m.id)}>
                              <Star className="h-4 w-4" /> Зробити основним
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => toast.info("Редагування...")}>
                            Редагувати
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteMethod(m.id)}
                            disabled={m.isDefault}
                          >
                            <Trash2 className="h-4 w-4" /> Видалити
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Власник: <span className="text-foreground">{m.holder}</span></p>
                      {m.expMonth && (
                        <p>Дійсна до: <span className="text-foreground">
                          {String(m.expMonth).padStart(2, "0")}/{m.expYear}
                        </span></p>
                      )}
                    </div>
                    {m.isDefault && (
                      <Badge className="mt-3 border bg-primary/10 text-primary border-primary/20">
                        За замовчуванням
                      </Badge>
                    )}
                  </Card>
                ))}
              </div>

              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    Усі платежі захищено за стандартом <b>PCI DSS Level 1</b>. Ми не зберігаємо повних даних карток —
                    обробку виконує сертифікований платіжний провайдер.
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Plan change confirmation */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Зміна тарифного плану</DialogTitle>
            <DialogDescription>
              Ви переходите з <b>{currentPlan.name}</b> на <b>{billingPlans.find((p) => p.id === pendingPlan)?.name}</b>.
              Зміни наберуть чинності негайно, рахунок буде перераховано пропорційно.
            </DialogDescription>
          </DialogHeader>
          {pendingPlan && (() => {
            const np = billingPlans.find((p) => p.id === pendingPlan)!;
            const price = billingCycle === "yearly" ? np.priceYearly : np.price;
            return (
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Новий тариф</span>
                  <span className="font-semibold">{np.name}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Сума</span>
                  <span className="font-mono font-semibold">
                    {formatMoney(price)}/{billingCycle === "yearly" ? "рік" : "міс"}
                  </span>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeOpen(false)}>Скасувати</Button>
            <Button onClick={confirmPlanChange}>Підтвердити</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface KpiCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  hint?: string;
  delta?: number;
  tone?: "ok" | "warn";
}
const KpiCard = ({ icon: Icon, title, value, hint, delta, tone }: KpiCardProps) => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <div className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md",
        tone === "warn" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      {typeof delta === "number" && (
        <span className={cn("flex items-center gap-1 text-xs font-medium",
          delta >= 0 ? "text-success" : "text-destructive")}>
          {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(delta)}%
        </span>
      )}
    </div>
    <p className="mt-4 text-xs text-muted-foreground">{title}</p>
    <p className="text-2xl font-semibold tracking-tight">{value}</p>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </Card>
);

interface InvoicesTableProps {
  rows: Invoice[];
  onDownload: (i: Invoice) => void;
  onPay: (id: string) => void;
  compact?: boolean;
}
const InvoicesTable = ({ rows, onDownload, onPay, compact }: InvoicesTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Номер</TableHead>
        {!compact && <TableHead>Опис</TableHead>}
        <TableHead>Період</TableHead>
        <TableHead>Дата</TableHead>
        <TableHead className="text-right">Сума</TableHead>
        <TableHead>Статус</TableHead>
        <TableHead className="text-right">Дії</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.length === 0 ? (
        <TableRow>
          <TableCell colSpan={compact ? 6 : 7} className="py-10 text-center text-sm text-muted-foreground">
            Рахунків не знайдено
          </TableCell>
        </TableRow>
      ) : rows.map((inv) => {
        const meta = statusMeta[inv.status];
        return (
          <TableRow key={inv.id}>
            <TableCell className="font-mono text-xs">{inv.number}</TableCell>
            {!compact && <TableCell className="max-w-[260px] truncate">{inv.description}</TableCell>}
            <TableCell className="text-sm text-muted-foreground capitalize">{inv.period}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{formatDate(inv.date)}</TableCell>
            <TableCell className="text-right font-mono font-semibold">{formatMoney(inv.amount)}</TableCell>
            <TableCell>
              <Badge variant="outline" className={cn("gap-1 border", meta.cls)}>
                <meta.Icon className="h-3 w-3" /> {meta.label}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {inv.status === "pending" && (
                  <Button size="sm" variant="ghost" onClick={() => onPay(inv.id)}>Сплатити</Button>
                )}
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onDownload(inv)}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);

export default Billing;
