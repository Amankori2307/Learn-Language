const AUTH_TOKEN_STORAGE_KEY = "learn_lang_jwt_token";
const AUTH_REDIRECT_ERROR_PARAM = "authError";

export type AuthRedirectErrorCode = "cancelled" | "provider" | "configuration";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export function readAuthTokenFromUrl(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const hashValue = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hashValue);
  const hashToken = hashParams.get("token");
  if (hashToken) {
    return hashToken;
  }

  const searchToken = new URLSearchParams(window.location.search).get("token");
  return searchToken;
}

export function readAuthErrorFromUrl(): AuthRedirectErrorCode | null {
  if (typeof window === "undefined") {
    return null;
  }

  const hashValue = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hashValue);
  const hashError = hashParams.get(AUTH_REDIRECT_ERROR_PARAM);
  if (isAuthRedirectErrorCode(hashError)) {
    return hashError;
  }

  const searchError = new URLSearchParams(window.location.search).get(AUTH_REDIRECT_ERROR_PARAM);
  return isAuthRedirectErrorCode(searchError) ? searchError : null;
}

export function clearAuthTokenFromUrl(): void {
  if (typeof window === "undefined") {
    return;
  }

  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete("token");
  currentUrl.hash = "";
  window.history.replaceState({}, "", `${currentUrl.pathname}${currentUrl.search}`);
}

export function clearAuthErrorFromUrl(): void {
  if (typeof window === "undefined") {
    return;
  }

  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete(AUTH_REDIRECT_ERROR_PARAM);

  const hashValue = currentUrl.hash.startsWith("#") ? currentUrl.hash.slice(1) : currentUrl.hash;
  const hashParams = new URLSearchParams(hashValue);
  hashParams.delete(AUTH_REDIRECT_ERROR_PARAM);
  currentUrl.hash = hashParams.toString() ? `#${hashParams.toString()}` : "";

  window.history.replaceState(
    {},
    "",
    `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
  );
}

function isAuthRedirectErrorCode(value: string | null): value is AuthRedirectErrorCode {
  return value === "cancelled" || value === "provider" || value === "configuration";
}
