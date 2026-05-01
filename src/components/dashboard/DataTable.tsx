import { useMemo, useState } from "react";
import { Download, Plus, Search } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";
import type { DataSource } from "@/data/mockData";
import { toast } from "sonner";

interface Props {
  data: DataSource[];
  loading?: boolean;
  onAdd: () => void;
}

const PAGE_SIZE = 8;

export function DataTable({ data, loading, onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const matchQ = query === "" || row.source.toLowerCase().includes(query.toLowerCase()) || row.id.includes(query);
      const matchS = statusFilter === "all" || row.status === statusFilter;
      const matchT = typeFilter === "all" || row.type === typeFilter;
      return matchQ && matchS && matchT;
    });
  }, [data, query, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCsv = () => {
    const headers = ["id", "source", "type", "records", "status", "lastSync"];
    const rows = filtered.map((r) => headers.map((h) => `"${(r as any)[h]}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data-sources-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV експортовано", { description: `${filtered.length} рядків` });
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Пошук джерел..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="pl-9"
              aria-label="Пошук у таблиці"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="sm:w-40" aria-label="Фільтр за статусом"><SelectValue placeholder="Статус" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Усі статуси</SelectItem>
              <SelectItem value="active">Активне</SelectItem>
              <SelectItem value="paused">Призупинено</SelectItem>
              <SelectItem value="error">Помилка</SelectItem>
              <SelectItem value="syncing">Синхронізація</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="sm:w-40" aria-label="Фільтр за типом"><SelectValue placeholder="Тип" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Усі типи</SelectItem>
              <SelectItem value="API">API</SelectItem>
              <SelectItem value="Web Scraping">Web Scraping</SelectItem>
              <SelectItem value="CSV/Excel">CSV/Excel</SelectItem>
              <SelectItem value="GraphQL">GraphQL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" /> Експорт CSV
          </Button>
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" /> Додати джерело
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">ID</TableHead>
              <TableHead>Джерело</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead className="text-right">Записів</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Остання синхр.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
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
                    Нічого не знайдено
                  </TableCell>
                </TableRow>
              )
              : pageRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.id}</TableCell>
                  <TableCell className="font-medium">{row.source}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.records.toLocaleString("uk-UA")}</TableCell>
                  <TableCell><StatusBadge status={row.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(row.lastSync).toLocaleString("uk-UA", { dateStyle: "short", timeStyle: "short" })}
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
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Назад
          </Button>
          <span className="text-muted-foreground tabular-nums">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Далі
          </Button>
        </div>
      </div>
    </Card>
  );
}