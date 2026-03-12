import axios from "axios";
import { getAuthToken } from "./authTokenStorage";
import { resolveApiBaseUrl } from "@/config/runtime";

export const BASE_URL = resolveApiBaseUrl(typeof window !== "undefined" ? window.location : undefined);

export function buildApiUrl(path: string): string {
  if (!path) {
    return path;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  if (!BASE_URL) {
    return path;
  }
  return `${BASE_URL}${path}`;
}

export const apiClient = axios.create({
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (!token) {
    return config;
  }

  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
