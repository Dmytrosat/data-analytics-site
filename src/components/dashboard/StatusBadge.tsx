import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SourceStatus } from "@/data/mockData";

const labels: Record<SourceStatus, string> = {
  active: "Активне",
  paused: "Призупинено",
  error: "Помилка",
  syncing: "Синхронізація",
};

const styles: Record<SourceStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  paused: "bg-muted text-muted-foreground border-border",
  error: "bg-destructive/15 text-destructive border-destructive/30",
  syncing: "bg-info/15 text-info border-info/30",
};

export function StatusBadge({ status }: { status: SourceStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", styles[status])}>
      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full",
        status === "active" && "bg-success",
        status === "paused" && "bg-muted-foreground",
        status === "error" && "bg-destructive",
        status === "syncing" && "bg-info animate-pulse",
      )} />
      {labels[status]}
    </Badge>
  );
}