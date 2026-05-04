import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Index from "./pages/Index.tsx";
import Records from "./pages/Records.tsx";
import Integrations from "./pages/Integrations.tsx";
import Visualization from "./pages/Visualization.tsx";
import {
  SourcesPage, LogsPage,
  AnalyticsPage, ReportsPage,
  UsersPage, TeamsPage, BillingPage,
  ApiKeysPage, WebhooksPage, NotificationsPage,
  SettingsPage,
} from "./pages/Placeholders.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/records" element={<Records />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/visualization" element={<Visualization />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/api-keys" element={<ApiKeysPage />} />
            <Route path="/webhooks" element={<WebhooksPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
