import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/authService";
import {
  clearAuthErrorFromUrl,
  clearAuthTokenFromUrl,
  readAuthErrorFromUrl,
  readAuthTokenFromUrl,
  type AuthRedirectErrorCode,
} from "@/services/authTokenStorage";
import { trackAnalyticsEvent } from "@/lib/analytics";

type AuthPageErrorState = {
  code: AuthRedirectErrorCode;
  title: string;
  description: string;
};

function mapAuthError(code: AuthRedirectErrorCode): AuthPageErrorState {
  if (code === "configuration") {
    return {
      code,
      title: "Sign-in is temporarily unavailable",
      description: "The OAuth configuration failed. Please try again later or contact support.",
    };
  }

  if (code === "cancelled") {
    return {
      code,
      title: "Sign-in was not completed",
      description: "Your provider sign-in was cancelled before the app could finish logging you in.",
    };
  }

  return {
    code,
    title: "Sign-in failed",
    description: "The provider sign-in flow returned an error. Please try again.",
  };
}

export function useAuthPageViewModel() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoginPending, setIsLoginPending] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(() => Boolean(readAuthTokenFromUrl()));
  const [authError, setAuthError] = useState<AuthPageErrorState | null>(null);

  useEffect(() => {
    const tokenFromUrl = readAuthTokenFromUrl();
    if (!tokenFromUrl) {
      const authErrorCode = readAuthErrorFromUrl();
      if (authErrorCode) {
        clearAuthErrorFromUrl();
        setAuthError(mapAuthError(authErrorCode));
        trackAnalyticsEvent("auth_login_failed", {
          route: "/auth",
          source: "oauth_redirect",
          errorCode: authErrorCode,
        });
      }
      setIsBootstrapping(false);
      return;
    }

    setAuthError(null);
    authService.setToken(tokenFromUrl);
    clearAuthTokenFromUrl();
    trackAnalyticsEvent("auth_login_completed", {
      route: "/auth",
      source: "token_handoff",
    });
    setLocation("/dashboard");
  }, [setLocation]);

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  const handleLogin = () => {
    setIsLoginPending(true);
    setAuthError(null);
    clearAuthErrorFromUrl();
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
    authError,
    handleLogin,
  };
}
