import { APP_BRAND_NAME } from "@shared/domain/constants/app-brand";

export function AuthBootstrapPanel() {
  return (
    <div className="flex min-h-screen min-h-dvh flex-col items-center justify-center bg-background p-6 text-center">
      <div className="w-full max-w-md rounded-3xl border border-border/50 bg-card p-8 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {APP_BRAND_NAME}
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
          Restoring your session
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Signing you in and preparing your dashboard.
        </p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
