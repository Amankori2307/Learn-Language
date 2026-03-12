import { APP_BRAND_NAME } from "@shared/domain/constants/app-brand";
import { SurfaceMessage } from "@/components/ui/page-states";
import { PendingButton } from "@/components/ui/pending-button";

export function AuthSignInPanel({
  isLoginPending,
  authError,
  handleLogin,
}: {
  isLoginPending: boolean;
  authError: {
    title: string;
    description: string;
  } | null;
  handleLogin: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-5 sm:p-8">
      <div className="w-full max-w-md space-y-6 text-center sm:space-y-8">
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
          {authError ? (
            <SurfaceMessage
              title={authError.title}
              description={authError.description}
              tone="error"
              className="mb-5 p-5 text-left"
            />
          ) : null}
          <PendingButton
            size="lg"
            className="h-12 w-full text-base font-semibold shadow-lg shadow-primary/20"
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
  );
}
