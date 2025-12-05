import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Marketing from "./pages/Marketing";
import Maintenance from "./pages/Maintenance";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";
import Applications from "./pages/Applications";
import Accounting from "./pages/Accounting";
import Analytics from "./pages/Analytics";
import AICenter from "./pages/AICenter";
import Integrations from "./pages/Integrations";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Inbox from "./pages/Inbox";
import Properties from "./pages/Properties";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route
              path="/applications"
              element={<Applications />}
            />
            <Route
              path="/maintenance"
              element={<Maintenance />}
            />
            <Route
              path="/accounting"
              element={<Accounting />}
            />
            <Route
              path="/analytics"
              element={<Analytics />}
            />
            <Route
              path="/ai-center"
              element={<AICenter />}
            />
            <Route
              path="/integrations"
              element={<Integrations />}
            />
            <Route
              path="/users"
              element={<Users />}
            />
            <Route
              path="/settings"
              element={<Settings />}
            />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
