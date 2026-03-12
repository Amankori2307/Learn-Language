import type { PropsWithChildren } from "react";
import { ThemeProvider } from "next-themes";
import { getDefaultProviderTheme, IMPLEMENTED_PROVIDER_THEMES } from "@/theme/app-theme";

export function AppThemeProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={getDefaultProviderTheme()}
      enableSystem={false}
      themes={IMPLEMENTED_PROVIDER_THEMES}
    >
      {children}
    </ThemeProvider>
  );
}
