import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useClustersForLanguage } from "./use-clusters";

const getMock = vi.fn();

vi.mock("@/services/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => getMock(...args),
  },
  buildApiUrl: (path: string) => path,
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useClustersForLanguage", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("fetches the cluster list through the shared clusters hook seam", async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        error: false,
        message: "ok",
        requestId: "clusters-request",
        data: [
          {
            id: 1,
            name: "Greetings",
            type: "topic",
            description: null,
            wordCount: 10,
          },
        ],
      },
    });

    const { result } = renderHook(() => useClustersForLanguage("telugu"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          id: 1,
          name: "Greetings",
          type: "topic",
          description: null,
          wordCount: 10,
        },
      ]);
    });

    expect(getMock).toHaveBeenCalledWith("/api/clusters?language=telugu");
  });
});
