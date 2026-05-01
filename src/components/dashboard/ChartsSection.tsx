import {
  CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ingestionTimeline, sourceTypeDistribution } from "@/data/mockData";

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--info))"];

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
};

export function ChartsSection({ loading }: { loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5"><Skeleton className="h-72 w-full" /></Card>
        <Card className="p-5"><Skeleton className="h-72 w-full" /></Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <header className="mb-4">
          <h3 className="text-base font-semibold">Динаміка завантажень</h3>
          <p className="text-sm text-muted-foreground">Записи та помилки за 14 днів</p>
        </header>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ingestionTimeline} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="records" name="Записи" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="errors" name="Помилки" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <header className="mb-4">
          <h3 className="text-base font-semibold">Типи джерел</h3>
          <p className="text-sm text-muted-foreground">Розподіл за категоріями</p>
        </header>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sourceTypeDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
              >
                {sourceTypeDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}