import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiClient, buildApiUrl } from "@/services/apiClient";

function toErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  const status = axiosError.response?.status;
  const message =
    axiosError.response?.data?.message ??
    axiosError.message ??
    "Request failed";
  if (!status) {
    return message;
  }
  return `${status}: ${message}`;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<{ data: unknown }> {
  const res = await apiClient({
    url: buildApiUrl(url),
    method,
    data,
  });
  return { data: res.data };
}

type UnauthorizedBehavior = "returnNull" | "throw";
export function getQueryFn<T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> {
  const { on401: unauthorizedBehavior } = options;
  return async ({ queryKey }) => {
    try {
      const res = await apiClient.get(buildApiUrl(queryKey.join("/") as string));
      return res.data as T;
    } catch (error) {
      const status = (error as AxiosError).response?.status;
      if (unauthorizedBehavior === "returnNull" && status === 401) {
        return null as unknown as T;
      }
      throw new Error(toErrorMessage(error), { cause: error });
    }
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
