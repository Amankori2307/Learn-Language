function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return trimmed;
}

export function buildAvatarUrl(input: {
  profileImageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string | undefined {
  const explicit = normalizeUrl(input.profileImageUrl ?? "");
  if (explicit) return explicit;

  const fullName = `${input.firstName ?? ""} ${input.lastName ?? ""}`.trim();
  const seed = fullName || input.email?.trim() || "";
  if (!seed) return undefined;

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&size=256&background=0f766e&color=ffffff&bold=true`;
}
