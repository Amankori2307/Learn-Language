import type { SrsConfig } from "../schema";

export const DEFAULT_SRS_CONFIG_VERSION = "v1";

export type SrsConfigSnapshot = {
  version: string;
  easeMin: number;
  easeMax: number;
  incorrectEasePenalty: number;
};

export const DEFAULT_SRS_CONFIG: SrsConfigSnapshot = {
  version: DEFAULT_SRS_CONFIG_VERSION,
  easeMin: 1.3,
  easeMax: 3.0,
  incorrectEasePenalty: 0.2,
};

export function resolveSrsConfig(row?: SrsConfig | null): SrsConfigSnapshot {
  if (!row?.config) {
    return DEFAULT_SRS_CONFIG;
  }

  const easeMin = Number(row.config.easeMin);
  const easeMax = Number(row.config.easeMax);
  const incorrectEasePenalty = Number(row.config.incorrectEasePenalty);

  if (!Number.isFinite(easeMin) || !Number.isFinite(easeMax) || !Number.isFinite(incorrectEasePenalty)) {
    return DEFAULT_SRS_CONFIG;
  }

  if (easeMin <= 0 || easeMax <= easeMin || incorrectEasePenalty <= 0) {
    return DEFAULT_SRS_CONFIG;
  }

  return {
    version: row.version || DEFAULT_SRS_CONFIG_VERSION,
    easeMin,
    easeMax,
    incorrectEasePenalty,
  };
}
