import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import Dashboard from "./pages/admin/dashboard";

function Router() {
  return ( // TODO: Add a loading state
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/admin/*" component={Dashboard}/>
      <Route component={NotFound} />
    </Switch>
  );
} 

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
