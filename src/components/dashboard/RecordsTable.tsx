import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Download, Search, X } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { RecordItem, RecordStatus } from "@/data/mockData";
import { sources } from "@/data/mockData";

interface Props {
  data: RecordItem[];
  loading?: boolean;
}

const PAGE_SIZE = 10;

const statusLabels: Record<RecordStatus, string> = {
  success: "Успішно",
  pending: "В обробці",
  failed: "Помилка",
  warning: "Попередження",
};

const statusStyles: Record<RecordStatus, string> = {
  success: "bg-success/15 text-success border-success/30",
  pending: "bg-info/15 text-info border-info/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  warning: "bg-warning/15 text-warning border-warning/30",
};

function RecordStatusBadge({ status }: { status: RecordStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", statusStyles[status])}>
      {statusLabels[status]}
    </Badge>
  );
}

export function RecordsTable({ data, loading }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const q = query.toLowerCase();
      const matchQ =
        q === "" ||
        row.id.toLowerCase().includes(q) ||
        row.sourceName.toLowerCase().includes(q) ||
        row.payload.toLowerCase().includes(q);
      const matchS = statusFilter === "all" || row.status === statusFilter;
      const matchSrc = sourceFilter === "all" || row.sourceId === sourceFilter;
      const date = new Date(row.createdAt);
      const matchFrom = !from || date >= from;
      const matchTo = !to || date <= new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59);
      return matchQ && matchS && matchSrc && matchFrom && matchTo;
    });
  }, [data, query, statusFilter, sourceFilter, from, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetFilters = () => {
    setQuery(""); setStatusFilter("all"); setSourceFilter("all");
    setFrom(undefined); setTo(undefined); setPage(1);
  };

  const exportCsv = () => {
    const headers = ["id", "sourceId", "sourceName", "type", "payload", "status", "createdAt"];
    const rows = filtered.map((r) => headers.map((h) => `"${(r as any)[h]}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `records-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV експортовано", { description: `${filtered.length} рядків` });
  };

  const hasFilters = query || statusFilter !== "all" || sourceFilter !== "all" || from || to;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:max-w-sm lg:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Пошук за ID, джерелом, описом..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="pl-9"
              aria-label="Пошук у записах"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" /> Експорт CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-44" aria-label="Фільтр за статусом">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Усі статуси</SelectItem>
              <SelectItem value="success">Успішно</SelectItem>
              <SelectItem value="pending">В обробці</SelectItem>
              <SelectItem value="failed">Помилка</SelectItem>
              <SelectItem value="warning">Попередження</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-56" aria-label="Фільтр за джерелом">
              <SelectValue placeholder="Джерело" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">Усі джерела</SelectItem>
              {sources.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.source}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("justify-start text-left font-normal sm:w-44", !from && "text-muted-foreground")}
                aria-label="Дата від"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {from ? format(from, "dd.MM.yyyy") : "Дата від"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={from}
                onSelect={(d) => { setFrom(d); setPage(1); }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("justify-start text-left font-normal sm:w-44", !to && "text-muted-foreground")}
                aria-label="Дата до"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {to ? format(to, "dd.MM.yyyy") : "Дата до"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={to}
                onSelect={(d) => { setTo(d); setPage(1); }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="mr-1 h-4 w-4" /> Скинути
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">ID</TableHead>
              <TableHead>Джерело</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Опис</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Створено</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : pageRows.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Записів не знайдено
                  </TableCell>
                </TableRow>
              )
              : pageRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.id}</TableCell>
                  <TableCell className="font-medium">{row.sourceName}</TableCell>
                  <TableCell className="text-muted-foreground">{row.type}</TableCell>
                  <TableCell className="max-w-[260px] truncate">{row.payload}</TableCell>
                  <TableCell><RecordStatusBadge status={row.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {new Date(row.createdAt).toLocaleString("uk-UA", { dateStyle: "short", timeStyle: "short" })}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t border-border p-4 text-sm">
        <span className="text-muted-foreground">
          Показано {pageRows.length} з {filtered.length}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
            Назад
          </Button>
          <span className="text-muted-foreground tabular-nums">{safePage} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
            Далі
          </Button>
        </div>
      </div>
    </Card>
  );
}