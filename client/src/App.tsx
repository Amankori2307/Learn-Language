import { useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { AppAsyncIndicator } from "@/components/app-async-indicator";
import { AppThemeProvider } from "@/theme/app-theme-provider";
import { APP_BRAND_NAME } from "@shared/domain/constants/app-brand";
import { getSeoRouteDefinition } from "@shared/domain/constants/seo";

import Dashboard from "@/pages/dashboard";
import QuizPage from "@/pages/quiz";
import ClustersPage from "@/pages/clusters";
import ContextualPage from "@/pages/contextual";
import TutorPage from "@/pages/tutor";
import LeaderboardPage from "@/pages/leaderboard";
import ProfilePage from "@/pages/profile";
import ReviewPage from "@/pages/review";
import AddVocabularyPage from "@/pages/add-vocabulary";
import HistoryPage from "@/pages/history";
import WordBucketsPage from "@/pages/word-buckets";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";
import { DashboardPageSkeleton } from "@/components/ui/page-states";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen min-h-dvh bg-background p-4 md:p-8">
        <DashboardPageSkeleton />
      </div>
    );
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
      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/quiz">{() => <ProtectedRoute component={QuizPage} />}</Route>
      <Route path="/clusters">{() => <ProtectedRoute component={ClustersPage} />}</Route>
      <Route path="/leaderboard">{() => <ProtectedRoute component={LeaderboardPage} />}</Route>
      <Route path="/profile">{() => <ProtectedRoute component={ProfilePage} />}</Route>
      <Route path="/history">{() => <ProtectedRoute component={HistoryPage} />}</Route>
      <Route path="/analytics">{() => <ProtectedRoute component={HistoryPage} />}</Route>
      <Route path="/analytics/words">{() => <ProtectedRoute component={WordBucketsPage} />}</Route>
      <Route path="/review">{() => <ProtectedRoute component={ReviewPage} />}</Route>
      <Route path="/review/add">{() => <ProtectedRoute component={AddVocabularyPage} />}</Route>
      <Route path="/contextual">{() => <ProtectedRoute component={ContextualPage} />}</Route>
      <Route path="/tutor">{() => <ProtectedRoute component={TutorPage} />}</Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();

  useEffect(() => {
    const path = location.split(/[?#]/)[0] || "/";
    const routeMetadata = getSeoRouteDefinition(path);
    document.title = routeMetadata?.title ?? `Not Found | ${APP_BRAND_NAME}`;
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <TooltipProvider>
          <AppAsyncIndicator />
          <Toaster />
          <Router />
        </TooltipProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
