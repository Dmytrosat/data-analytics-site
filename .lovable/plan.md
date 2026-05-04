## Сторінка Integrations

Замінити placeholder `IntegrationsPage` на повноцінну сторінку з каталогом інтеграцій, фільтрами та керуванням станом (увімкнути/вимкнути) на мокових даних.

### Що буде зроблено

**1. Мокові дані** — `src/data/mockData.ts`
Додати тип `Integration` та масив `integrations` (~12 елементів):
- `id`, `name`, `description`, `category` ("Communication" | "Analytics" | "Storage" | "Payments" | "DevOps" | "CRM")
- `iconKey` (ключ для lucide-іконки: slack, github, stripe, google, notion, zapier, dropbox, mailchimp, hubspot, jira, figma, sentry)
- `enabled: boolean`, `status: "connected" | "disconnected" | "error"`
- `lastSync: string` (ISO), `eventsToday: number`

**2. Нова сторінка** — `src/pages/Integrations.tsx`
Структура (Header + Sidebar layout, як на інших сторінках):
- Заголовок "Інтеграції" + опис + кнопка "Додати інтеграцію" (відкриває toast).
- 4 KPI-міні-картки зверху: Усього, Активних, З помилками, Подій за день.
- Панель фільтрів: пошук за назвою (`Input`), фільтр категорії (`Select`), tabs "Усі / Активні / Вимкнені / Помилки".
- Сітка карток `grid sm:grid-cols-2 lg:grid-cols-3 gap-4`. Кожна картка:
  - Іконка інтеграції (lucide) у кольоровому квадраті, назва, категорія (`Badge`).
  - Опис (2 рядки, truncate).
  - Рядок метрик: "Останній sync", "Подій сьогодні".
  - Статус-індикатор (точка + текст: Підключено / Вимкнено / Помилка).
  - `Switch` для увімкнення/вимкнення + `DropdownMenu` (Налаштувати, Тест з'єднання, Переглянути логи, Видалити).
- Стан зберігається у локальному `useState` (мутація мокових даних на льоту).
- Перемикання `Switch` показує `sonner` toast ("Інтеграцію X увімкнено/вимкнено") і змінює `status` відповідно.
- Пункти меню в DropdownMenu теж викликають toasts (без реальної дії).
- Skeleton loader (0.6s) при першому завантаженні.
- Empty state, якщо фільтри нічого не знайшли.

**3. Роутинг** — `src/App.tsx`
Замінити імпорт `IntegrationsPage` з `Placeholders.tsx` на новий компонент `Integrations` з `./pages/Integrations.tsx`. Залишити маршрут `/integrations`.

**4. Placeholders.tsx**
Видалити експорт `IntegrationsPage` (більше не потрібен).

### Технічні деталі

- Іконки беруться з `lucide-react` через мапу `iconMap: Record<string, LucideIcon>` всередині компонента.
- Категорії мають кольорові акценти через існуючі токени (`bg-primary/10 text-primary` тощо).
- Усі інтерактивні елементи мають `aria-label`.
- Адаптивність: 1 колонка <640px, 2 — <1024px, 3 — ≥1024px.
- Коментар у файлі пояснює, як замінити мок на API через TanStack Query (`useQuery({queryKey:['integrations'], queryFn: fetchIntegrations})` + мутація через `useMutation` для toggle).
