export type DesignSystemGovernanceRule = "arbitrary-layout" | "hex-color" | "legacy-vh";

export type DesignSystemGovernanceAllowlistEntry = {
  filePath: string;
  rule: DesignSystemGovernanceRule;
  match: string;
  owner: string;
  reason: string;
  followUp: string;
};

export const designSystemGovernanceAllowlist: DesignSystemGovernanceAllowlistEntry[] = [];
