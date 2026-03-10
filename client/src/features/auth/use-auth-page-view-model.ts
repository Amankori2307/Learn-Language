import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/authService";
import { clearAuthTokenFromUrl, readAuthTokenFromUrl } from "@/services/authTokenStorage";

export function useAuthPageViewModel() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoginPending, setIsLoginPending] = useState(false);

  useEffect(() => {
    const tokenFromUrl = readAuthTokenFromUrl();
    if (!tokenFromUrl) {
      return;
    }

    authService.setToken(tokenFromUrl);
    clearAuthTokenFromUrl();
    setLocation("/");
  }, [setLocation]);

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const handleLogin = () => {
    setIsLoginPending(true);
    window.location.href = authService.getLoginUrl();
  };

  return {
    isLoading,
    user,
    isLoginPending,
    handleLogin,
  };
}
