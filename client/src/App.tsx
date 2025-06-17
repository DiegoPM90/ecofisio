import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import NetworkStatus from "@/components/network-status";
import { SessionManager } from "@/components/session-manager";
import { SessionIndicator } from "@/components/session-indicator";

// Direct imports to fix dynamic loading issues
import Home from "@/pages/home";
import Cancel from "@/pages/cancel";
import Status from "@/pages/status";
import Auth from "@/pages/auth";
import MyAppointments from "@/pages/my-appointments";
import Profile from "@/pages/profile";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-600 text-sm">Cargando...</p>
    </div>
  </div>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cancel" component={Cancel} />
      <Route path="/status" component={Status} />
      <Route path="/auth" component={Auth} />
      <Route path="/login" component={Auth} />
      <Route path="/my-appointments" component={MyAppointments} />
      <Route path="/profile" component={Profile} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <NetworkStatus />
          <SessionManager />
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
