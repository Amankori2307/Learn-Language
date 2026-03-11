import { describe, expect, it } from "vitest";
import {
  APP_THEME_DEFINITIONS,
  AppThemeId,
  DEFAULT_APP_THEME,
  getDefaultProviderTheme,
  getProviderThemeForAppTheme,
  IMPLEMENTED_APP_THEMES,
  IMPLEMENTED_PROVIDER_THEMES,
  isImplementedAppTheme,
} from "@/theme/app-theme";

describe("app theme config", () => {
  it("uses current as the default app theme", () => {
    expect(DEFAULT_APP_THEME).toBe(AppThemeId.CURRENT);
    expect(getDefaultProviderTheme()).toBe("dark");
  });

  it("keeps future planned themes in the enum/config without marking them implemented", () => {
    expect(APP_THEME_DEFINITIONS.some((theme) => theme.id === AppThemeId.MINIMAL)).toBe(true);
    expect(isImplementedAppTheme(AppThemeId.MINIMAL)).toBe(false);
  });

  it("maps implemented themes to provider theme values", () => {
    expect(IMPLEMENTED_APP_THEMES.map((theme) => theme.id)).toEqual([AppThemeId.CURRENT]);
    expect(IMPLEMENTED_PROVIDER_THEMES).toEqual(["dark"]);
    expect(getProviderThemeForAppTheme(AppThemeId.CURRENT)).toBe("dark");
  });
});
