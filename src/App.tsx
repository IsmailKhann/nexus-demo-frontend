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
            <Route path="/crm" element={<CRM />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route
              path="/applications"
              element={<Placeholder title="Online Leasing" description="Applications, eSignature, and automated document generation" />}
            />
            <Route
              path="/maintenance"
              element={<Maintenance />}
            />
            <Route
              path="/accounting"
              element={<Placeholder title="Accounting & Financials" description="GL, AR, payments, and QuickBooks integration" />}
            />
            <Route
              path="/analytics"
              element={<Placeholder title="Analytics & BI" description="Custom dashboards, reports, and AI insights" />}
            />
            <Route
              path="/ai-center"
              element={<Placeholder title="AI Center" description="ALIA assistant, call scoring, and AI-powered features" />}
            />
            <Route
              path="/integrations"
              element={<Placeholder title="Integrations" description="Marketplace and API connectivity" />}
            />
            <Route
              path="/users"
              element={<Placeholder title="Users & Roles" description="User management and permissions" />}
            />
            <Route
              path="/settings"
              element={<Placeholder title="Settings" description="Platform configuration" />}
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
