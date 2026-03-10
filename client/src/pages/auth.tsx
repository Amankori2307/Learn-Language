import { APP_BRAND_NAME } from "@shared/domain/constants/app-brand";
import { useAuthPageViewModel } from "@/features/auth/use-auth-page-view-model";
import { PendingButton } from "@/components/ui/pending-button";

export default function AuthPage() {
  const { isLoginPending, handleLogin } = useAuthPageViewModel();

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

          <h2 className="text-5xl font-bold mb-6 tracking-tight">
            Master languages the natural way.
          </h2>
          <p className="text-lg opacity-90 leading-relaxed">
            Learn vocabulary through semantic clusters, spaced repetition, and real-world examples.
            {APP_BRAND_NAME} helps you build fluency step by step.
          </p>
        </div>
      </div>

      {/* Right: Login */}
      <div className="flex flex-col items-center justify-center bg-background p-5 sm:p-8">
        <div className="max-w-md w-full space-y-6 text-center sm:space-y-8">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-primary px-6 py-8 text-left text-primary-foreground shadow-xl lg:hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-emerald-500/80" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground/80">
                {APP_BRAND_NAME}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Learn in short sessions that actually stick.
              </h2>
              <p className="mt-3 text-sm leading-6 text-primary-foreground/85">
                Clusters, spaced repetition, and contextual review are all ready after sign in.
              </p>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
            <p className="mt-2 text-muted-foreground">Sign in to continue with {APP_BRAND_NAME}</p>
          </div>

          <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-xl sm:p-8">
            <PendingButton
              size="lg"
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
              onClick={handleLogin}
              pending={isLoginPending}
              pendingLabel="Redirecting..."
            >
              Continue to Sign In
            </PendingButton>

            <p className="mt-6 text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
