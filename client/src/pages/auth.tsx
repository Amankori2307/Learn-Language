import { APP_BRAND_NAME } from "@shared/domain/constants/app-brand";
import { useAuthPageViewModel } from "@/features/auth/use-auth-page-view-model";
import { AuthSignInPanel } from "@/features/auth/auth-sign-in-panel";

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
      <AuthSignInPanel isLoginPending={isLoginPending} handleLogin={handleLogin} />
    </div>
  );
}
