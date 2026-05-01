import { useEffect, useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { DesktopSidebar, type NavId } from "@/components/dashboard/Sidebar";
import { KPICards } from "@/components/dashboard/KPICards";
import { DataTable } from "@/components/dashboard/DataTable";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { ActivityLog } from "@/components/dashboard/ActivityLog";
import { SourceDialog } from "@/components/dashboard/SourceDialog";
import { kpis, sources } from "@/data/mockData";

/**
 * Data — Dashboard
 * ─────────────────
 * Інструкція з підключення реальних даних:
 * 1) Замініть імпорти з "@/data/mockData" на запити до вашого API через TanStack Query.
 *    Приклад:
 *      const { data: kpis, isLoading } = useQuery({ queryKey:['kpis'], queryFn: fetchKpis });
 * 2) Передавайте `loading` у відповідні компоненти (Skeleton вже реалізовано).
 * 3) Активний пункт сайдбару зберігається в локальному стані; при переході
 *    на router-структуру замініть `active` на `useLocation().pathname`.
 */
const Index = () => {
  const [active, setActive] = useState<NavId>("dashboard");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Імітація завантаження даних 1.5s
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header active={active} onSelect={setActive} />
      <DesktopSidebar active={active} onSelect={setActive} />

      <main className="pt-16 md:pl-60">
        <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Огляд</h1>
            <p className="text-sm text-muted-foreground">
              Стан агрегації даних у реальному часі
            </p>
          </div>

          <KPICards data={kpis} loading={loading} />

          <ChartsSection loading={loading} />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <DataTable data={sources} loading={loading} onAdd={() => setDialogOpen(true)} />
            </div>
            <div>
              <ActivityLog loading={loading} />
            </div>
          </div>
        </div>
      </main>

      <SourceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default Index;
