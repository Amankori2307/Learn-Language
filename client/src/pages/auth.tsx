import { useAuthPageViewModel } from "@/features/auth/use-auth-page-view-model";
import { AuthBrandPanel } from "@/features/auth/auth-brand-panel";
import { AuthSignInPanel } from "@/features/auth/auth-sign-in-panel";

export default function AuthPage() {
  const { isLoginPending, handleLogin } = useAuthPageViewModel();

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthBrandPanel />
      <AuthSignInPanel isLoginPending={isLoginPending} handleLogin={handleLogin} />
    </div>
  );
}
