import { useAuthPageViewModel } from "@/features/auth/use-auth-page-view-model";
import { AuthBrandPanel } from "@/features/auth/auth-brand-panel";
import { AuthBootstrapPanel } from "@/features/auth/auth-bootstrap-panel";
import { AuthSignInPanel } from "@/features/auth/auth-sign-in-panel";

export default function AuthPage() {
  const { isLoginPending, isBootstrapping, authError, handleLogin } = useAuthPageViewModel();

  if (isBootstrapping) {
    return <AuthBootstrapPanel />;
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <AuthBrandPanel />
      <AuthSignInPanel
        isLoginPending={isLoginPending}
        authError={authError}
        handleLogin={handleLogin}
      />
    </div>
  );
}
