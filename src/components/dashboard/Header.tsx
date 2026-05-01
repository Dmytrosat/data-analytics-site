import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SidebarNav, type NavId } from "./Sidebar";
import { Badge } from "@/components/ui/badge";

interface Props {
  active: NavId;
  onSelect: (id: NavId) => void;
}

export function Header({ active, onSelect }: Props) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/60 md:px-6">
      {/* Mobile hamburger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Відкрити меню">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="px-6 pt-6 text-lg font-bold">Data</SheetTitle>
          <SidebarNav active={active} onSelect={onSelect} />
        </SheetContent>
      </Sheet>

      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          D
        </div>
        <span className="text-lg font-semibold tracking-tight">Data</span>
      </div>

      {/* Search */}
      <div className="ml-4 hidden flex-1 max-w-md md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Пошук джерел, записів, логів..."
            className="pl-9"
            aria-label="Глобальний пошук"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative" aria-label="Сповіщення">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full bg-destructive p-0 text-[10px] text-destructive-foreground">
            3
          </Badge>
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
            АД
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}