import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import Login from "@/pages/login";
import MainLayout from "@/components/layout/main-layout";
import Dashboard from "@/pages/dashboard";
import Reservations from "@/pages/reservations";
import Rooms from "@/pages/rooms";
import Guests from "@/pages/guests";
import Restaurant from "@/pages/restaurant";
import Billing from "@/pages/billing";
import Inventory from "@/pages/inventory";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/reservations" component={Reservations} />
        <Route path="/rooms" component={Rooms} />
        <Route path="/guests" component={Guests} />
        <Route path="/restaurant" component={Restaurant} />
        <Route path="/billing" component={Billing} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
