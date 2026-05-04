/**
 * Мокові дані для дашборду Data.
 * ───────────────────────────────────────────────
 * Як замінити на реальні API:
 * 1. Створіть src/lib/api.ts з функціями fetchSources(), fetchKpis(), fetchActivity().
 * 2. У відповідних компонентах замініть імпорт з цього файлу
 *    на useQuery({ queryKey:['sources'], queryFn: fetchSources }) (TanStack Query вже встановлено).
 * 3. Структура JSON нижче відповідає очікуваному формату backend-відповідей.
 */

export type SourceStatus = "active" | "paused" | "error" | "syncing";
export type SourceType = "API" | "Web Scraping" | "CSV/Excel" | "GraphQL";

export interface DataSource {
  id: string;
  source: string;
  type: SourceType;
  records: number;
  status: SourceStatus;
  lastSync: string; // ISO date
}

export interface KpiCard {
  id: string;
  title: string;
  value: string;
  delta: number; // %
  iconKey: "database" | "activity" | "zap" | "users";
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  status: "success" | "warning" | "error" | "info";
  timestamp: string; // ISO
}

export const kpis: KpiCard[] = [
  { id: "k1", title: "Усього записів", value: "1 284 502", delta: 12.4, iconKey: "database" },
  { id: "k2", title: "Активні джерела", value: "27", delta: 4.1, iconKey: "zap" },
  { id: "k3", title: "Запитів за день", value: "48 921", delta: -2.3, iconKey: "activity" },
  { id: "k4", title: "Користувачі", value: "1 432", delta: 8.7, iconKey: "users" },
];

const types: SourceType[] = ["API", "Web Scraping", "CSV/Excel", "GraphQL"];
const statuses: SourceStatus[] = ["active", "paused", "error", "syncing"];
const sourceNames = [
  "Stripe Payments", "Shopify Orders", "Google Analytics", "HubSpot CRM", "Salesforce Leads",
  "Twitter Trends", "Reddit Scraper", "LinkedIn Jobs", "Amazon Products", "eBay Listings",
  "Weather API", "OpenAI Logs", "GitHub Issues", "Jira Tickets", "Slack Messages",
  "Mailchimp Campaigns", "Intercom Chats", "Zendesk Tickets", "Notion Pages", "Airtable Base",
  "PostgreSQL Mirror", "MongoDB Sync", "Sentry Errors", "Datadog Metrics", "Cloudflare Logs",
  "AWS CloudTrail", "Stripe Disputes", "Twilio SMS", "SendGrid Emails", "Segment Events",
  "Mixpanel Funnels", "Algolia Search",
];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// Deterministic seed-ish: base values so list is stable per render.
export const sources: DataSource[] = sourceNames.map((name, i) => ({
  id: `src_${(i + 1).toString().padStart(3, "0")}`,
  source: name,
  type: types[i % types.length],
  records: Math.floor(1000 + ((i * 9173) % 98000)),
  status: statuses[i % statuses.length],
  lastSync: new Date(Date.now() - i * 1000 * 60 * 37).toISOString(),
}));
// silence unused warning
void rand;

// 14 days ingestion timeline
export const ingestionTimeline = Array.from({ length: 14 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return {
    date: d.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" }),
    records: 4000 + Math.round(Math.sin(i / 2) * 1500 + i * 220 + Math.random() * 800),
    errors: Math.round(Math.random() * 80 + 10),
  };
});

export const sourceTypeDistribution = [
  { name: "API", value: 42 },
  { name: "Web Scraping", value: 23 },
  { name: "CSV/Excel", value: 18 },
  { name: "GraphQL", value: 17 },
];

export const activity: ActivityItem[] = [
  { id: "a1", title: "Синхронізація завершена", description: "Stripe Payments — 1 245 нових записів", status: "success", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: "a2", title: "Помилка з'єднання", description: "Shopify Orders — таймаут 30s", status: "error", timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString() },
  { id: "a3", title: "Нове джерело додано", description: "GitHub Issues підключено через API token", status: "info", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: "a4", title: "Перевищено ліміт API", description: "Twitter Trends — 80% денної квоти", status: "warning", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
  { id: "a5", title: "Експорт CSV", description: "Експортовано 12 480 рядків", status: "success", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
  { id: "a6", title: "Зміна налаштувань", description: "Інтервал синхронізації Salesforce: 15хв → 5хв", status: "info", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: "a7", title: "Помилка валідації", description: "CSV upload — 14 рядків з некоректним email", status: "warning", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
  { id: "a8", title: "Користувач увійшов", description: "admin@data.app з IP 192.168.1.42", status: "info", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
];

// ─────────── Records (окремі події/рядки даних) ───────────
export type RecordStatus = "success" | "pending" | "failed" | "warning";

export interface RecordItem {
  id: string;
  sourceId: string;
  sourceName: string;
  type: SourceType;
  payload: string;
  status: RecordStatus;
  createdAt: string; // ISO
}

const recordStatuses: RecordStatus[] = ["success", "pending", "failed", "warning"];
const payloadSamples = [
  "Order #%n imported", "User signup event", "Webhook delivered", "Row inserted",
  "Schema validated", "Rate limit hit", "Auth token refreshed", "Batch processed",
  "File parsed (%n rows)", "Record updated", "Duplicate skipped", "Field mapped",
];

// Деterministic generator (without seed lib): based on index — стабільний між рендерами.
export const records: RecordItem[] = Array.from({ length: 120 }).map((_, i) => {
  const src = sources[i % sources.length];
  // Розподіляємо на 30 днів назад
  const minutesBack = (i * 173) % (60 * 24 * 30);
  const createdAt = new Date(Date.now() - minutesBack * 60 * 1000).toISOString();
  const tpl = payloadSamples[i % payloadSamples.length];
  return {
    id: `rec_${(i + 1).toString().padStart(4, "0")}`,
    sourceId: src.id,
    sourceName: src.source,
    type: src.type,
    payload: tpl.replace("%n", String(((i * 37) % 9000) + 1)),
    status: recordStatuses[(i * 3) % recordStatuses.length],
    createdAt,
  };
});

// ─────────── Integrations ───────────
export type IntegrationCategory =
  | "Communication"
  | "Analytics"
  | "Storage"
  | "Payments"
  | "DevOps"
  | "CRM";

export type IntegrationStatus = "connected" | "disconnected" | "error";

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  iconKey:
    | "slack"
    | "github"
    | "stripe"
    | "google"
    | "notion"
    | "zapier"
    | "dropbox"
    | "mailchimp"
    | "hubspot"
    | "jira"
    | "figma"
    | "sentry";
  enabled: boolean;
  status: IntegrationStatus;
  lastSync: string; // ISO
  eventsToday: number;
}

export const integrations: Integration[] = [
  { id: "int_01", name: "Slack", description: "Сповіщення про події та помилки в каналах команди.", category: "Communication", iconKey: "slack", enabled: true, status: "connected", lastSync: new Date(Date.now() - 1000 * 60 * 8).toISOString(), eventsToday: 1284 },
  { id: "int_02", name: "GitHub", description: "Синхронізація issues, pull requests та deployments.", category: "DevOps", iconKey: "github", enabled: true, status: "connected", lastSync: new Date(Date.now() - 1000 * 60 * 17).toISOString(), eventsToday: 642 },
  { id: "int_03", name: "Stripe", description: "Платежі, підписки та події біллінгу в реальному часі.", category: "Payments", iconKey: "stripe", enabled: true, status: "connected", lastSync: new Date(Date.now() - 1000 * 60 * 3).toISOString(), eventsToday: 318 },
  { id: "int_04", name: "Google Analytics", description: "Імпорт метрик трафіку та воронок конверсії.", category: "Analytics", iconKey: "google", enabled: false, status: "disconnected", lastSync: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), eventsToday: 0 },
  { id: "int_05", name: "Notion", description: "Двостороння синхронізація сторінок і баз даних.", category: "Storage", iconKey: "notion", enabled: true, status: "error", lastSync: new Date(Date.now() - 1000 * 60 * 90).toISOString(), eventsToday: 12 },
  { id: "int_06", name: "Zapier", description: "Автоматизація через 6000+ сторонніх сервісів.", category: "DevOps", iconKey: "zapier", enabled: true, status: "connected", lastSync: new Date(Date.now() - 1000 * 60 * 12).toISOString(), eventsToday: 894 },
  { id: "int_07", name: "Dropbox", description: "Синхронізація файлів та резервних копій.", category: "Storage", iconKey: "dropbox", enabled: false, status: "disconnected", lastSync: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), eventsToday: 0 },
  { id: "int_08", name: "Mailchimp", description: "Email-кампанії, підписники та аналітика розсилок.", category: "Communication", iconKey: "mailchimp", enabled: true, status: "connected", lastSync: new Date(Date.now() - 1000 * 60 * 45).toISOString(), eventsToday: 156 },
  { id: "int_09", name: "HubSpot", description: "CRM, контакти, угоди та маркетинг-автоматизація.", category: "CRM", iconKey: "hubspot", enabled: true, status: "connected", lastSync: new Date(Date.now() - 1000 * 60 * 22).toISOString(), eventsToday: 478 },
  { id: "int_10", name: "Jira", description: "Задачі, спринти та прогрес команди розробки.", category: "DevOps", iconKey: "jira", enabled: false, status: "disconnected", lastSync: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), eventsToday: 0 },
  { id: "int_11", name: "Figma", description: "Сповіщення про коментарі, зміни в макетах і прототипи.", category: "Communication", iconKey: "figma", enabled: true, status: "connected", lastSync: new Date(Date.now() - 1000 * 60 * 31).toISOString(), eventsToday: 87 },
  { id: "int_12", name: "Sentry", description: "Моніторинг помилок та продуктивності застосунків.", category: "Analytics", iconKey: "sentry", enabled: true, status: "error", lastSync: new Date(Date.now() - 1000 * 60 * 4).toISOString(), eventsToday: 53 },
];

// ─────────── Visualization ───────────
export type ChartKind = "line" | "area" | "bar" | "pie" | "radar" | "kpi";

export interface DashboardWidget {
  id: string;
  title: string;
  kind: ChartKind;
  description?: string;
  /** Дані для графіка */
  data?: Array<Record<string, number | string>>;
  /** Для KPI */
  value?: string;
  delta?: number;
}

export interface SavedDashboard {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  widgets: number;
  owner: string;
}

const months = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];

export const revenueTimeline = months.map((m, i) => ({
  name: m,
  revenue: 12000 + Math.round(Math.sin(i / 1.7) * 4000 + i * 900 + Math.random() * 1500),
  cost: 6000 + Math.round(Math.cos(i / 2) * 2000 + i * 380 + Math.random() * 800),
}));

export const trafficByChannel = [
  { name: "Organic", value: 4280 },
  { name: "Paid", value: 2390 },
  { name: "Referral", value: 1420 },
  { name: "Direct", value: 980 },
  { name: "Social", value: 1640 },
];

export const conversionFunnel = [
  { name: "Visit", value: 12480 },
  { name: "Sign up", value: 4820 },
  { name: "Trial", value: 2140 },
  { name: "Paid", value: 612 },
];

export const performanceRadar = [
  { metric: "Speed", A: 86, B: 72 },
  { metric: "Reliability", A: 92, B: 80 },
  { metric: "Latency", A: 74, B: 65 },
  { metric: "Coverage", A: 88, B: 78 },
  { metric: "Quality", A: 81, B: 70 },
  { metric: "UX", A: 90, B: 75 },
];

export const defaultWidgets: DashboardWidget[] = [
  { id: "w1", kind: "kpi", title: "MRR", value: "$148.2k", delta: 9.4 },
  { id: "w2", kind: "kpi", title: "Активні користувачі", value: "12 480", delta: 4.2 },
  { id: "w3", kind: "kpi", title: "Конверсія", value: "4.9%", delta: -1.2 },
  { id: "w4", kind: "kpi", title: "Avg session", value: "5m 12s", delta: 2.8 },
  { id: "w5", kind: "area", title: "Виручка vs витрати", description: "12 місяців", data: revenueTimeline },
  { id: "w6", kind: "pie", title: "Трафік за каналами", description: "Останні 30 днів", data: trafficByChannel },
  { id: "w7", kind: "bar", title: "Воронка конверсії", description: "Етапи користувача", data: conversionFunnel },
  { id: "w8", kind: "radar", title: "Performance score", description: "Поточний vs попередній квартал", data: performanceRadar },
  { id: "w9", kind: "line", title: "Завантаження записів", description: "14 днів", data: ingestionTimeline },
];

export const widgetLibrary: Array<{ kind: ChartKind; title: string; description: string }> = [
  { kind: "kpi", title: "KPI карта", description: "Велике число + дельта" },
  { kind: "line", title: "Лінійний графік", description: "Тренди в часі" },
  { kind: "area", title: "Area chart", description: "Накопичувальна динаміка" },
  { kind: "bar", title: "Стовпчики", description: "Порівняння категорій" },
  { kind: "pie", title: "Кругова", description: "Розподіл частин" },
  { kind: "radar", title: "Radar", description: "Багатовимірне порівняння" },
];

export const savedDashboards: SavedDashboard[] = [
  { id: "d1", name: "Revenue overview", description: "Виручка, MRR, церн", updatedAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(), widgets: 8, owner: "admin@data.app" },
  { id: "d2", name: "Product analytics", description: "Активність користувачів та фічі", updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), widgets: 12, owner: "pm@data.app" },
  { id: "d3", name: "Ops health", description: "SLA, помилки, latency", updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), widgets: 6, owner: "ops@data.app" },
  { id: "d4", name: "Marketing funnel", description: "Канали, CPA, конверсія", updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), widgets: 9, owner: "growth@data.app" },
];