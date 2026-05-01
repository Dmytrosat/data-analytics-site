import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { activity, type ActivityItem } from "@/data/mockData";
import { cn } from "@/lib/utils";

const iconMap = {
  success: { Icon: CheckCircle2, cls: "text-success bg-success/10" },
  warning: { Icon: AlertTriangle, cls: "text-warning bg-warning/10" },
  error: { Icon: XCircle, cls: "text-destructive bg-destructive/10" },
  info: { Icon: Info, cls: "text-info bg-info/10" },
};

const badgeMap: Record<ActivityItem["status"], string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  error: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-info/15 text-info border-info/30",
};

export function ActivityLog({ loading }: { loading?: boolean }) {
  const [period, setPeriod] = useState("7d");

  const items = useMemo(() => {
    const cutoff = period === "24h" ? 24 : period === "7d" ? 24 * 7 : 24 * 30;
    return activity.filter(
      (a) => Date.now() - new Date(a.timestamp).getTime() < cutoff * 60 * 60 * 1000,
    );
  }, [period]);

  return (
    <Card className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="text-base font-semibold">Журнал активності</h3>
          <p className="text-sm text-muted-foreground">Останні події системи</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32" aria-label="Період"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 години</SelectItem>
            <SelectItem value="7d">7 днів</SelectItem>
            <SelectItem value="30d">30 днів</SelectItem>
          </SelectContent>
        </Select>
      </header>

      <ScrollArea className="h-[480px]">
        <ol className="relative p-5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="mb-5 flex gap-3">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </li>
              ))
            : items.length === 0
            ? <li className="py-8 text-center text-sm text-muted-foreground">Подій не знайдено</li>
            : items.map((item, idx) => {
              const { Icon, cls } = iconMap[item.status];
              const isLast = idx === items.length - 1;
              return (
                <li key={item.id} className="relative flex gap-3 pb-5">
                  {!isLast && <span className="absolute left-4 top-9 h-full w-px bg-border" aria-hidden />}
                  <div className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", cls)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{item.title}</p>
                      <Badge variant="outline" className={cn("text-[10px]", badgeMap[item.status])}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground/80">
                      {new Date(item.timestamp).toLocaleString("uk-UA", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                </li>
              );
            })}
        </ol>
      </ScrollArea>
    </Card>
  );
}