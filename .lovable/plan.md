## Сторінка Records

Окрема маршрутизована сторінка зі списком окремих записів (events) — на відміну від таблиці джерел на головній.

### Що додаю

**1. Мокові дані записів** (`src/data/mockData.ts`)
- Новий тип `RecordItem`: `id`, `sourceId`, `sourceName`, `type`, `payload` (короткий опис), `status` (`success | pending | failed | warning`), `createdAt` (ISO).
- Згенерую ~120 записів, рівномірно розподілених за останні 30 днів, прив'язаних до існуючих `sources`.

**2. Сторінка** (`src/pages/Records.tsx`)
- Той самий layout-каркас, що й Index: `Header` + `DesktopSidebar` + `<main>` з `pt-16 md:pl-60`.
- Заголовок "Записи" + підзаголовок з лічильником "знайдено N з M".
- 1.5s skeleton для імітації завантаження (як на Index).

**3. Компонент таблиці** (`src/components/dashboard/RecordsTable.tsx`)
- Колонки: ID (моно), Джерело, Тип, Опис (truncate), Статус (Badge), Дата (локалізована).
- Фільтри в шапці картки:
  - Глобальний пошук (по id/sourceName/payload).
  - Select статусу: усі / success / pending / failed / warning.
  - Select джерела (з `sources`).
  - **Діапазон дат**: дві кнопки-Popover з shadcn `Calendar` (від / до). Очищення одним кліком "Скинути".
- Дії: "Експорт CSV" (фільтрований результат), пагінація (10 на сторінку).
- Skeleton-стани, empty-state, повна адаптивність.

**4. Навігація**
- `App.tsx`: додати `<Route path="/records" element={<Records />} />`.
- `Sidebar.tsx`: пункт "Records" вже є — переробляю `SidebarNav` так, щоб клік виконував `navigate(...)`, а активний стан визначався з `useLocation()`. Index і Records вживатимуть один сайдбар без локального state.
- Заміна сигнатури `Header` / `DesktopSidebar`: прибираю пропси `active`/`onSelect`, бо тепер вони працюють через router. Оновлюю Index відповідно.

### Технічні деталі

- Фільтр дат: `react-day-picker` через shadcn `Calendar`, дві окремі дати `from` / `to`. Якщо обидві задані — фільтрую `createdAt >= from && createdAt <= to (end of day)`.
- Wrapper календаря: `className="p-3 pointer-events-auto"` для коректної роботи в Popover.
- CSV export: переюзаю ту саму логіку, що в `DataTable` (Blob → download).
- Усі кольори/бейджі — через існуючі семантичні токени (`success/warning/destructive/info`); створю мапінг для `RecordStatus` аналогічно `StatusBadge`.

### Карта файлів

```text
src/
  data/mockData.ts                          (+ RecordItem, records[])
  components/dashboard/
    Sidebar.tsx                             (router-based active)
    Header.tsx                              (без onSelect props)
    RecordsTable.tsx                        (NEW)
  pages/
    Index.tsx                               (без local nav state)
    Records.tsx                             (NEW)
  App.tsx                                   (+ /records route)
```
