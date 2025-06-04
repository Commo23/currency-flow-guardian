import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ExposureProvider } from "@/contexts/ExposureContext";
import { HedgingProvider } from "@/contexts/HedgingContext";
import { MetricsProvider } from "@/contexts/MetricsContext";
import Dashboard from "./pages/Dashboard";
import Exposures from "./pages/Exposures";
import Scenarios from "./pages/Scenarios";
import Hedging from "./pages/Hedging";
import Reporting from "./pages/Reporting";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <ExposureProvider>
          <HedgingProvider>
            <MetricsProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <main className="flex-1">
                      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2">
                        <SidebarTrigger />
                      </div>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/exposures" element={<Exposures />} />
                        <Route path="/scenarios" element={<Scenarios />} />
                        <Route path="/hedging" element={<Hedging />} />
                        <Route path="/reporting" element={<Reporting />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                </SidebarProvider>
              </BrowserRouter>
            </MetricsProvider>
          </HedgingProvider>
        </ExposureProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
