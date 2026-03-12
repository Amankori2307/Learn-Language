import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppThemeProvider } from "@/theme/app-theme-provider";

const themeProviderSpy = vi.fn();

vi.mock("next-themes", () => ({
  ThemeProvider: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
    themeProviderSpy(props);
    return <div data-testid="theme-provider">{children}</div>;
  },
}));

describe("AppThemeProvider", () => {
  it("wires the default theme seam and implemented theme list into next-themes", () => {
    render(
      <AppThemeProvider>
        <div>content</div>
      </AppThemeProvider>,
    );

    expect(screen.getByTestId("theme-provider")).toBeTruthy();
    expect(screen.getByText("content")).toBeTruthy();
    expect(themeProviderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        attribute: "class",
        defaultTheme: "dark",
        enableSystem: false,
        themes: ["dark", "minimal", "warm", "playful", "high-contrast", "rainbow"],
      }),
    );
  });
});
