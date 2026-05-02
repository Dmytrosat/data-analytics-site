import { useEffect, useState, type ComponentType } from "react";
import { Header } from "@/components/dashboard/Header";
import { DesktopSidebar } from "@/components/dashboard/Sidebar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description: string;
  icon: LucideIcon | ComponentType<{ className?: string }>;
  bullets?: string[];
}

/**
 * Універсальна сторінка-каркас для розділів, що ще не реалізовані.
 * Layout відповідає Index/Records: Header + DesktopSidebar + main з відступами.
 */
export function PagePlaceholder({ title, description, icon: Icon, bullets }: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <DesktopSidebar />

      <main className="pt-16 md:pl-60">
        <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          {loading ? (
            <Card className="p-6 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Розділ у розробці
                  </div>
                  <h2 className="text-lg font-semibold">Скоро тут буде {title}</h2>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Ми готуємо повноцінний інтерфейс. Нижче — заплановані можливості.
                  </p>
                </div>
                <Button onClick={() => toast.info("Підписку оформлено", { description: "Сповістимо вас, коли розділ запрацює." })}>
                  Сповістити про запуск
                </Button>
              </div>

              {bullets && bullets.length > 0 && (
                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {bullets.map((b) => (
                    <div
                      key={b}
                      className="rounded-lg border border-border bg-secondary/30 p-4 text-sm text-foreground"
                    >
                      {b}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
