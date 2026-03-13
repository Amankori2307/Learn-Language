export const AppThemeId = {
  CURRENT: "current",
  MINIMAL: "minimal",
  WARM: "warm",
  SOOTHING: "soothing",
  PLAYFUL: "playful",
  HIGH_CONTRAST: "high-contrast",
  BLACK: "black",
} as const;

export type AppThemeId = (typeof AppThemeId)[keyof typeof AppThemeId];

export type AppThemeAvailability = "implemented" | "planned";

export type AppThemeDefinition = {
  id: AppThemeId;
  label: string;
  availability: AppThemeAvailability;
  providerTheme: string;
  selector: string;
};

export const APP_THEME_DEFINITIONS: readonly AppThemeDefinition[] = [
  {
    id: AppThemeId.CURRENT,
    label: "Dark",
    availability: "implemented",
    providerTheme: "dark",
    selector: ".dark",
  },
  {
    id: AppThemeId.MINIMAL,
    label: "Light",
    availability: "implemented",
    providerTheme: "minimal",
    selector: ".minimal",
  },
  {
    id: AppThemeId.WARM,
    label: "Warm",
    availability: "implemented",
    providerTheme: "warm",
    selector: ".warm",
  },
  {
    id: AppThemeId.SOOTHING,
    label: "Soothing",
    availability: "implemented",
    providerTheme: "soothing",
    selector: ".soothing",
  },
  {
    id: AppThemeId.PLAYFUL,
    label: "Playful",
    availability: "implemented",
    providerTheme: "playful",
    selector: ".playful",
  },
  {
    id: AppThemeId.HIGH_CONTRAST,
    label: "High Contrast",
    availability: "implemented",
    providerTheme: "high-contrast",
    selector: ".high-contrast",
  },
  {
    id: AppThemeId.BLACK,
    label: "Black",
    availability: "implemented",
    providerTheme: "black",
    selector: ".black",
  },
] as const;

export const DEFAULT_APP_THEME = AppThemeId.CURRENT;

export const IMPLEMENTED_APP_THEMES = APP_THEME_DEFINITIONS.filter(
  (theme) => theme.availability === "implemented",
);

export const IMPLEMENTED_PROVIDER_THEMES = IMPLEMENTED_APP_THEMES.map((theme) => theme.providerTheme);
export const IMPLEMENTED_APP_THEME_IDS = IMPLEMENTED_APP_THEMES.map((theme) => theme.id);
export const IMPLEMENTED_THEME_SELECTORS = IMPLEMENTED_APP_THEMES.map((theme) => ({
  providerTheme: theme.providerTheme,
  selector: theme.selector,
}));

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

export function getAppThemeIdForProviderTheme(providerTheme?: string | null): AppThemeId {
  const definition = APP_THEME_DEFINITIONS.find((theme) => theme.providerTheme === providerTheme);

  return definition?.id ?? DEFAULT_APP_THEME;
}

export function getNextImplementedAppTheme(themeId: AppThemeId): AppThemeId {
  const currentIndex = IMPLEMENTED_APP_THEME_IDS.indexOf(themeId);

  if (currentIndex === -1) {
    return DEFAULT_APP_THEME;
  }

  const nextIndex = (currentIndex + 1) % IMPLEMENTED_APP_THEME_IDS.length;
  return IMPLEMENTED_APP_THEME_IDS[nextIndex] ?? DEFAULT_APP_THEME;
}

export function getNextImplementedProviderTheme(providerTheme?: string | null): string {
  const activeThemeId = getAppThemeIdForProviderTheme(providerTheme);
  return getProviderThemeForAppTheme(getNextImplementedAppTheme(activeThemeId));
}
