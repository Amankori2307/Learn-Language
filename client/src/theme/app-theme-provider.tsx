import type { PropsWithChildren } from "react";
import { ThemeProvider } from "next-themes";
import { getDefaultProviderTheme } from "@/theme/app-theme";

export function AppThemeProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={getDefaultProviderTheme()}
      enableSystem={false}
    >
      {children}
    </ThemeProvider>
  );
}
