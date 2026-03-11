import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageEnum, ReviewStatusEnum, UserTypeEnum } from "@shared/domain/enums";
import ReviewPage from "./review";

const transitionMutate = vi.fn();
const bulkMutateAsync = vi.fn().mockResolvedValue({ updated: 1, skipped: 0 });
let currentUserRole = UserTypeEnum.REVIEWER;
let reviewQueueState = {
  data: [
    {
      id: 11,
      language: LanguageEnum.TELUGU,
      originalScript: "namaste",
      transliteration: "namaste",
      english: "hello",
      partOfSpeech: "phrase",
      reviewStatus: ReviewStatusEnum.PENDING_REVIEW,
      sourceUrl: "https://example.com/source",
      sourceCapturedAt: "2026-02-20T11:00:00.000Z",
      submittedBy: "u-1",
      submittedAt: "2026-02-20T11:00:00.000Z",
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null,
    },
  ],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
};
let reviewHistoryState = {
  data: {
    word: {
      id: 11,
      originalScript: "namaste",
      transliteration: "namaste",
      english: "hello",
      reviewStatus: ReviewStatusEnum.PENDING_REVIEW,
      sourceUrl: "https://example.com/source",
      sourceCapturedAt: "2026-02-20T11:00:00.000Z",
      reviewNotes: null,
    },
    clusters: [],
    relatedClusterWords: [],
    events: [],
  },
  isLoading: false,
  isError: false,
};

vi.mock("@/components/layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: {
      id: "reviewer-1",
      role: currentUserRole,
      email: "reviewer@example.com",
    },
  }),
}));

vi.mock("@/hooks/use-review", () => ({
  useReviewQueue: () => reviewQueueState,
  useReviewHistory: () => reviewHistoryState,
  useTransitionReview: () => ({
    mutate: transitionMutate,
    isPending: false,
  }),
  useBulkTransitionReview: () => ({
    mutateAsync: bulkMutateAsync,
    isPending: false,
  }),
  useCreateReviewDraft: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe("ReviewPage integration", () => {
  beforeEach(() => {
    currentUserRole = UserTypeEnum.REVIEWER;
    reviewQueueState = {
      data: [
        {
          id: 11,
          language: LanguageEnum.TELUGU,
          originalScript: "namaste",
          transliteration: "namaste",
          english: "hello",
          partOfSpeech: "phrase",
          reviewStatus: ReviewStatusEnum.PENDING_REVIEW,
          sourceUrl: "https://example.com/source",
          sourceCapturedAt: "2026-02-20T11:00:00.000Z",
          submittedBy: "u-1",
          submittedAt: "2026-02-20T11:00:00.000Z",
          reviewedBy: null,
          reviewedAt: null,
          reviewNotes: null,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    reviewHistoryState = {
      data: {
        word: {
          id: 11,
          originalScript: "namaste",
          transliteration: "namaste",
          english: "hello",
          reviewStatus: ReviewStatusEnum.PENDING_REVIEW,
          sourceUrl: "https://example.com/source",
          sourceCapturedAt: "2026-02-20T11:00:00.000Z",
          reviewNotes: null,
        },
        clusters: [],
        relatedClusterWords: [],
        events: [],
      },
      isLoading: false,
      isError: false,
    };
  });

  it("runs bulk approve from selected queue items", async () => {
    const user = userEvent.setup();
    render(<ReviewPage />);

    const notesInput = screen.getByLabelText("Review Notes (applied to bulk action)");
    await user.type(notesInput, "verified by reviewer");

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    const bulkApprove = screen.getByRole("button", { name: "Bulk Approve" });
    await user.click(bulkApprove);

    expect(bulkMutateAsync).toHaveBeenCalledTimes(1);
    expect(bulkMutateAsync).toHaveBeenCalledWith({
      ids: [11],
      toStatus: ReviewStatusEnum.APPROVED,
      notes: "verified by reviewer",
    });
  });

  it("runs per-item approve action", async () => {
    const user = userEvent.setup();
    render(<ReviewPage />);

    const row = screen.getByText("namaste (namaste)").closest("div");
    expect(row).toBeTruthy();

    const approveButtons = screen.getAllByRole("button", { name: "Approve" });
    await user.click(approveButtons[0]);

    expect(transitionMutate).toHaveBeenCalledWith({
      id: 11,
      toStatus: ReviewStatusEnum.APPROVED,
      notes: undefined,
    });
  });

  it("renders reviewer-only access state for learner users", () => {
    currentUserRole = UserTypeEnum.LEARNER;

    render(<ReviewPage />);

    expect(screen.getByText("Review Access Required")).toBeTruthy();
    expect(screen.getByText("Only reviewer/admin roles can access vocabulary review tools.")).toBeTruthy();
    expect(screen.queryByText("Review Queue")).toBeNull();
  });

  it("renders queue loading state for reviewer users", () => {
    reviewQueueState = {
      data: [],
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    };

    const { container } = render(<ReviewPage />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders queue error state and retry action for reviewer users", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    reviewQueueState = {
      data: [],
      isLoading: false,
      isError: true,
      refetch,
    };

    render(<ReviewPage />);

    expect(screen.getByText("Failed to load queue")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders empty queue messaging when no items are available", () => {
    reviewQueueState = {
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };

    render(<ReviewPage />);

    expect(screen.getByText("Queue is empty")).toBeTruthy();
    expect(screen.getByText("There are no items in this review state right now.")).toBeTruthy();
  });

  it("renders review-history loading state after selecting an item", async () => {
    const user = userEvent.setup();
    reviewHistoryState = {
      data: null,
      isLoading: true,
      isError: false,
    };

    const { container } = render(<ReviewPage />);

    await user.click(screen.getByRole("button", { name: "View History" }));
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders review-history error state after selecting an item", async () => {
    const user = userEvent.setup();
    reviewHistoryState = {
      data: null,
      isLoading: false,
      isError: true,
    };

    render(<ReviewPage />);

    await user.click(screen.getByRole("button", { name: "View History" }));
    expect(screen.getByText("Failed to load history")).toBeTruthy();
  });

  it("renders empty review-history events after selecting an item", async () => {
    const user = userEvent.setup();

    render(<ReviewPage />);

    await user.click(screen.getByRole("button", { name: "View History" }));
    expect(screen.getByText("No review events yet.")).toBeTruthy();
  });
});
