const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export function toApiUrl(path: string): string {
  if (!path) {
    return path;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  if (!path.startsWith("/api/")) {
    return path;
  }
  if (!API_BASE_URL) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}

export function toAuthUrl(path: "/api/login" | "/api/logout"): string {
  return toApiUrl(path);
}

