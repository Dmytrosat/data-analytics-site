import { Activity, ArrowDownRight, ArrowUpRight, Database, Users, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { KpiCard } from "@/data/mockData";

const iconMap = {
  database: Database,
  activity: Activity,
  zap: Zap,
  users: Users,
};

interface Props {
  data: KpiCard[];
  loading?: boolean;
}

export function KPICards({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-32" />
            <Skeleton className="mt-3 h-4 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {data.map((k) => {
        const Icon = iconMap[k.iconKey];
        const positive = k.delta >= 0;
        return (
          <Card key={k.id} className="p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{k.title}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{k.value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div
              className={cn(
                "mt-3 inline-flex items-center gap-1 text-xs font-medium",
                positive ? "text-success" : "text-destructive",
              )}
            >
              {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {positive ? "+" : ""}{k.delta}%
              <span className="font-normal text-muted-foreground">за тиждень</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}