import {
  Database, BarChart3, ScrollText, LineChart, FileText,
  Users, UsersRound, CreditCard, KeyRound, Webhook, Bell, Settings,
} from "lucide-react";
import { PagePlaceholder } from "@/components/dashboard/PagePlaceholder";

/**
 * Каркасні сторінки для розділів сайдбару.
 * Замініть експорт на повноцінний компонент при реалізації розділу.
 */

export const SourcesPage = () => (
  <PagePlaceholder
    title="Джерела"
    description="Керування підключеними джерелами даних"
    icon={Database}
    bullets={["Каталог конекторів", "Налаштування авторизації", "Розклад синхронізації"]}
  />
);

export const VisualizationPage = () => (
  <PagePlaceholder
    title="Візуалізація"
    description="Конструктор діаграм та дашбордів"
    icon={BarChart3}
    bullets={["Drag & drop редактор", "10+ типів графіків", "Збережені перегляди"]}
  />
);

export const LogsPage = () => (
  <PagePlaceholder
    title="Логи"
    description="Системні події та аудит"
    icon={ScrollText}
    bullets={["Фільтр за рівнем", "Повнотекстовий пошук", "Експорт у JSON/CSV"]}
  />
);

export const AnalyticsPage = () => (
  <PagePlaceholder
    title="Аналітика"
    description="Метрики продуктивності та використання"
    icon={LineChart}
    bullets={["Когортний аналіз", "Воронки конверсії", "Порівняння періодів"]}
  />
);

export const ReportsPage = () => (
  <PagePlaceholder
    title="Звіти"
    description="Генерація та розсилка звітів"
    icon={FileText}
    bullets={["Шаблони звітів", "Розклад e-mail", "PDF/Excel експорт"]}
  />
);

export const UsersPage = () => (
  <PagePlaceholder
    title="Користувачі"
    description="Облікові записи та ролі"
    icon={Users}
    bullets={["Запрошення e-mail", "Ролі та права", "Журнал активності"]}
  />
);

export const TeamsPage = () => (
  <PagePlaceholder
    title="Команди"
    description="Робочі простори та групи"
    icon={UsersRound}
    bullets={["Багато команд", "Ізоляція даних", "Спільні дашборди"]}
  />
);

export const BillingPage = () => (
  <PagePlaceholder
    title="Тарифи"
    description="Підписка, рахунки та використання"
    icon={CreditCard}
    bullets={["Поточний план", "Історія платежів", "Ліміти та квоти"]}
  />
);

export const ApiKeysPage = () => (
  <PagePlaceholder
    title="API Keys"
    description="Ключі для програмного доступу"
    icon={KeyRound}
    bullets={["Створення ключів", "Скоупи та обмеження", "Ротація та revoke"]}
  />
);

export const WebhooksPage = () => (
  <PagePlaceholder
    title="Webhooks"
    description="HTTP-callback на події системи"
    icon={Webhook}
    bullets={["Підписка на події", "Retry-політика", "Логи доставок"]}
  />
);

export const NotificationsPage = () => (
  <PagePlaceholder
    title="Сповіщення"
    description="Канали та правила сповіщень"
    icon={Bell}
    bullets={["E-mail, Slack, SMS", "Розумні правила", "Тиха година"]}
  />
);

export const SettingsPage = () => (
  <PagePlaceholder
    title="Налаштування"
    description="Загальні параметри застосунку"
    icon={Settings}
    bullets={["Профіль та локалізація", "Тема інтерфейсу", "Безпека акаунта"]}
  />
);
