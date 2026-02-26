import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { APP_BRAND_NAME } from "@shared/domain/constants/app-brand";
import { authService } from "@/services/authService";
import { clearAuthTokenFromUrl, readAuthTokenFromUrl } from "@/services/authTokenStorage";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

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
    window.location.href = authService.getLoginUrl();
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Branding */}
      <div className="relative bg-primary hidden lg:flex flex-col items-center justify-center p-12 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1588661803731-0df0b8754245?q=80&w=2574&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary" />
        
        <div className="relative z-10 max-w-lg text-center">
          {/* Decorative Source Language Script bg text */}
          <h1 className="text-9xl font-originalScript opacity-10 absolute -top-32 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap">
            {APP_BRAND_NAME}
          </h1>
          
          <h2 className="text-5xl font-bold mb-6 tracking-tight">Master languages the natural way.</h2>
          <p className="text-lg opacity-90 leading-relaxed">
            Learn vocabulary through semantic clusters, spaced repetition, and real-world examples. 
            {APP_BRAND_NAME} helps you build fluency step by step.
          </p>
        </div>
      </div>

      {/* Right: Login */}
      <div className="flex flex-col items-center justify-center p-8 bg-background">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
            <p className="mt-2 text-muted-foreground">Sign in to continue with {APP_BRAND_NAME}</p>
          </div>

          <div className="bg-card p-8 rounded-3xl shadow-xl border border-border/50">
            <Button 
              size="lg" 
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20" 
              onClick={handleLogin}
            >
              Continue to Sign In
            </Button>
            
            <p className="mt-6 text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
