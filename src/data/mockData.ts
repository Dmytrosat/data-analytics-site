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