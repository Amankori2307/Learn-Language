import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WordBucketsPage from "./word-buckets";

const viewModel = vi.fn();

vi.mock("@/components/layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/features/analytics/use-word-buckets-view-model", () => ({
  useWordBucketsViewModel: () => viewModel(),
}));

describe("WordBucketsPage integration", () => {
  beforeEach(() => {
    viewModel.mockReset();
  });

  it("renders an error surface when the bucket request fails", () => {
    viewModel.mockReturnValue({
      bucket: "learning",
      page: 1,
      totalPages: 1,
      setPage: vi.fn(),
      data: null,
      isLoading: false,
      isError: true,
      retry: vi.fn(),
      changeBucket: vi.fn(),
      navigate: vi.fn(),
    });

    render(<WordBucketsPage />);

    expect(screen.getByText("Could not load bucket words")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("renders bucket rows when data is available", () => {
    viewModel.mockReturnValue({
      bucket: "learning",
      page: 1,
      totalPages: 1,
      setPage: vi.fn(),
      isLoading: false,
      isError: false,
      retry: vi.fn(),
      changeBucket: vi.fn(),
      navigate: vi.fn(),
      data: {
        title: "Learning",
        meaning: "Words in progress",
        howToImprove: "Review daily.",
        total: 1,
        words: [
          {
            wordId: 11,
            transliteration: "namaste",
            originalScript: "నమస్తే",
            english: "hello",
            masteryLevel: "learning",
            wrongCount: 2,
            nextReview: null,
          },
        ],
      },
    });

    render(<WordBucketsPage />);

    expect(screen.getAllByText(/namaste/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/hello/i).length).toBeGreaterThan(0);
  });
});
