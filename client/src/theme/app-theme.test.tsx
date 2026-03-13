import { describe, expect, it } from "vitest";
import {
  APP_THEME_DEFINITIONS,
  AppThemeId,
  DEFAULT_APP_THEME,
  getAppThemeIdForProviderTheme,
  getDefaultProviderTheme,
  getNextImplementedProviderTheme,
  getProviderThemeForAppTheme,
  IMPLEMENTED_APP_THEMES,
  IMPLEMENTED_PROVIDER_THEMES,
  isImplementedAppTheme,
} from "@/theme/app-theme";

describe("app theme config", () => {
  it("uses warm as the default app theme", () => {
    expect(DEFAULT_APP_THEME).toBe(AppThemeId.WARM);
    expect(getDefaultProviderTheme()).toBe("warm");
  });

  it("keeps future planned themes in the enum/config without marking them implemented", () => {
    expect(APP_THEME_DEFINITIONS.some((theme) => theme.id === AppThemeId.MINIMAL)).toBe(true);
    expect(isImplementedAppTheme(AppThemeId.MINIMAL)).toBe(true);
    expect(isImplementedAppTheme(AppThemeId.WARM)).toBe(true);
  });

  it("maps implemented themes to provider theme values", () => {
    expect(IMPLEMENTED_APP_THEMES.map((theme) => theme.id)).toEqual([
      AppThemeId.CURRENT,
      AppThemeId.MINIMAL,
      AppThemeId.WARM,
      AppThemeId.SOOTHING,
      AppThemeId.PLAYFUL,
      AppThemeId.HIGH_CONTRAST,
      AppThemeId.BLACK,
    ]);
    expect(IMPLEMENTED_PROVIDER_THEMES).toEqual([
      "dark",
      "minimal",
      "warm",
      "soothing",
      "playful",
      "high-contrast",
      "black",
    ]);
    expect(getProviderThemeForAppTheme(AppThemeId.CURRENT)).toBe("dark");
    expect(getProviderThemeForAppTheme(AppThemeId.MINIMAL)).toBe("minimal");
    expect(getProviderThemeForAppTheme(AppThemeId.WARM)).toBe("warm");
    expect(getProviderThemeForAppTheme(AppThemeId.SOOTHING)).toBe("soothing");
    expect(getProviderThemeForAppTheme(AppThemeId.PLAYFUL)).toBe("playful");
    expect(getProviderThemeForAppTheme(AppThemeId.HIGH_CONTRAST)).toBe("high-contrast");
    expect(getProviderThemeForAppTheme(AppThemeId.BLACK)).toBe("black");
  });

  it("cycles between the implemented themes using provider theme values", () => {
    expect(getAppThemeIdForProviderTheme("dark")).toBe(AppThemeId.CURRENT);
    expect(getAppThemeIdForProviderTheme("minimal")).toBe(AppThemeId.MINIMAL);
    expect(getNextImplementedProviderTheme("dark")).toBe("minimal");
    expect(getNextImplementedProviderTheme("minimal")).toBe("warm");
    expect(getNextImplementedProviderTheme("warm")).toBe("soothing");
    expect(getNextImplementedProviderTheme("soothing")).toBe("playful");
    expect(getNextImplementedProviderTheme("playful")).toBe("high-contrast");
    expect(getNextImplementedProviderTheme("high-contrast")).toBe("black");
    expect(getNextImplementedProviderTheme("black")).toBe("dark");
  });
});
