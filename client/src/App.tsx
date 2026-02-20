import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "next-themes";

import Dashboard from "@/pages/dashboard";
import QuizPage from "@/pages/quiz";
import ClustersPage from "@/pages/clusters";
import ContextualPage from "@/pages/contextual";
import TutorPage from "@/pages/tutor";
import LeaderboardPage from "@/pages/leaderboard";
import ProfilePage from "@/pages/profile";
import ReviewPage from "@/pages/review";
import HistoryPage from "@/pages/history";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Routes */}
      <Route path="/">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/quiz">
        {() => <ProtectedRoute component={QuizPage} />}
      </Route>
      <Route path="/clusters">
        {() => <ProtectedRoute component={ClustersPage} />}
      </Route>
      <Route path="/leaderboard">
        {() => <ProtectedRoute component={LeaderboardPage} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={ProfilePage} />}
      </Route>
      <Route path="/history">
        {() => <ProtectedRoute component={HistoryPage} />}
      </Route>
      <Route path="/review">
        {() => <ProtectedRoute component={ReviewPage} />}
      </Route>
      <Route path="/contextual">
        {() => <ProtectedRoute component={ContextualPage} />}
      </Route>
      <Route path="/tutor">
        {() => <ProtectedRoute component={TutorPage} />}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
