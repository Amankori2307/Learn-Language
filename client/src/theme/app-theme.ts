export enum AppThemeId {
  CURRENT = "current",
  MINIMAL = "minimal",
  WARM = "warm",
  MIDNIGHT = "midnight",
  EDITORIAL = "editorial",
  PLAYFUL = "playful",
  HIGH_CONTRAST = "high-contrast",
}

export type AppThemeAvailability = "implemented" | "planned";

export type AppThemeDefinition = {
  id: AppThemeId;
  label: string;
  availability: AppThemeAvailability;
  providerTheme: string;
};

export const APP_THEME_DEFINITIONS: readonly AppThemeDefinition[] = [
  {
    id: AppThemeId.CURRENT,
    label: "Current",
    availability: "implemented",
    providerTheme: "dark",
  },
  {
    id: AppThemeId.MINIMAL,
    label: "Minimal",
    availability: "planned",
    providerTheme: "minimal",
  },
  {
    id: AppThemeId.WARM,
    label: "Warm",
    availability: "planned",
    providerTheme: "warm",
  },
  {
    id: AppThemeId.MIDNIGHT,
    label: "Midnight",
    availability: "planned",
    providerTheme: "midnight",
  },
  {
    id: AppThemeId.EDITORIAL,
    label: "Editorial",
    availability: "planned",
    providerTheme: "editorial",
  },
  {
    id: AppThemeId.PLAYFUL,
    label: "Playful",
    availability: "planned",
    providerTheme: "playful",
  },
  {
    id: AppThemeId.HIGH_CONTRAST,
    label: "High Contrast",
    availability: "planned",
    providerTheme: "high-contrast",
  },
] as const;

export const DEFAULT_APP_THEME = AppThemeId.CURRENT;

export const IMPLEMENTED_APP_THEMES = APP_THEME_DEFINITIONS.filter(
  (theme) => theme.availability === "implemented",
);

export const IMPLEMENTED_PROVIDER_THEMES = IMPLEMENTED_APP_THEMES.map((theme) => theme.providerTheme);

export function getAppThemeDefinition(themeId: AppThemeId): AppThemeDefinition {
  const definition = APP_THEME_DEFINITIONS.find((theme) => theme.id === themeId);

  if (!definition) {
    throw new Error(`Unknown app theme: ${themeId}`);
  }

  return definition;
}

export function getProviderThemeForAppTheme(themeId: AppThemeId): string {
  return getAppThemeDefinition(themeId).providerTheme;
}

export function isImplementedAppTheme(themeId: AppThemeId): boolean {
  return getAppThemeDefinition(themeId).availability === "implemented";
}

export function getDefaultProviderTheme(): string {
  return getProviderThemeForAppTheme(DEFAULT_APP_THEME);
}
