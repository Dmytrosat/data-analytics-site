import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plug } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  name: z.string().min(2, "Мінімум 2 символи").max(60),
  type: z.enum(["API", "Web Scraping", "CSV/Excel", "GraphQL"], {
    errorMap: () => ({ message: "Оберіть тип" }),
  }),
  endpoint: z.string().min(3, "Вкажіть endpoint або шлях до файлу"),
  token: z.string().optional(),
  interval: z.enum(["5", "15", "60", "360", "1440"]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function SourceDialog({ open, onOpenChange }: Props) {
  const [testing, setTesting] = useState(false);

  const {
    register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", endpoint: "", token: "", interval: "15" },
  });

  const typeValue = watch("type");
  const intervalValue = watch("interval");

  const handleTest = async () => {
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setTesting(false);
    toast.success("З'єднання успішне", { description: "Сервер відповів за 320ms" });
  };

  const onSubmit = async (values: FormValues) => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Джерело збережено", { description: `${values.name} (${values.type})` });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Нове джерело даних</DialogTitle>
          <DialogDescription>Підключіть API, скрапер або файл для агрегації.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="src-name">Назва</Label>
            <Input id="src-name" placeholder="Stripe Payments" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="src-type">Тип</Label>
            <Select value={typeValue} onValueChange={(v) => setValue("type", v as FormValues["type"], { shouldValidate: true })}>
              <SelectTrigger id="src-type"><SelectValue placeholder="Оберіть тип" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="API">API</SelectItem>
                <SelectItem value="Web Scraping">Web Scraping</SelectItem>
                <SelectItem value="CSV/Excel">CSV/Excel</SelectItem>
                <SelectItem value="GraphQL">GraphQL</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="src-endpoint">Endpoint / шлях до файлу</Label>
            <Input id="src-endpoint" placeholder="https://api.example.com/v1/data" {...register("endpoint")} />
            {errors.endpoint && <p className="text-xs text-destructive">{errors.endpoint.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="src-token">Token (опціонально)</Label>
            <Input id="src-token" type="password" placeholder="sk_live_..." {...register("token")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="src-interval">Інтервал синхронізації</Label>
            <Select value={intervalValue} onValueChange={(v) => setValue("interval", v as FormValues["interval"])}>
              <SelectTrigger id="src-interval"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Кожні 5 хвилин</SelectItem>
                <SelectItem value="15">Кожні 15 хвилин</SelectItem>
                <SelectItem value="60">Щогодини</SelectItem>
                <SelectItem value="360">Кожні 6 годин</SelectItem>
                <SelectItem value="1440">Щодня</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={handleTest} disabled={testing}>
              {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plug className="mr-2 h-4 w-4" />}
              Тест з'єднання
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Зберегти
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}