import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/authService";
import { clearAuthTokenFromUrl, readAuthTokenFromUrl } from "@/services/authTokenStorage";
import { trackAnalyticsEvent } from "@/lib/analytics";

export function useAuthPageViewModel() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoginPending, setIsLoginPending] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(() => Boolean(readAuthTokenFromUrl()));

  useEffect(() => {
    const tokenFromUrl = readAuthTokenFromUrl();
    if (!tokenFromUrl) {
      setIsBootstrapping(false);
      return;
    }

    authService.setToken(tokenFromUrl);
    clearAuthTokenFromUrl();
    trackAnalyticsEvent("auth_login_completed", {
      route: "/auth",
      source: "token_handoff",
    });
    setLocation("/");
  }, [setLocation]);

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const handleLogin = () => {
    setIsLoginPending(true);
    trackAnalyticsEvent("auth_login_started", {
      route: "/auth",
      source: "google_oauth",
    });
    window.location.href = authService.getLoginUrl();
  };

  return {
    isLoading,
    isBootstrapping: isBootstrapping || isLoading,
    user,
    isLoginPending,
    handleLogin,
  };
}
