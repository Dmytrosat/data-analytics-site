import { useEffect, useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { DesktopSidebar } from "@/components/dashboard/Sidebar";
import { RecordsTable } from "@/components/dashboard/RecordsTable";
import { records } from "@/data/mockData";

/**
 * Сторінка Records — перегляд окремих записів (events) з усіх джерел.
 * Замініть `records` з mockData на запит TanStack Query до вашого API:
 *   const { data: records = [], isLoading } = useQuery({
 *     queryKey: ["records"], queryFn: fetchRecords,
 *   });
 */
const Records = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <DesktopSidebar />

      <main className="pt-16 md:pl-60">
        <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Записи</h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Завантаження..." : `Усього записів: ${records.length}`}
            </p>
          </div>

          <RecordsTable data={records} loading={loading} />
        </div>
      </main>
    </div>
  );
};

export default Records;