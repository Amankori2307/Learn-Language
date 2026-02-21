import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { LanguageEnum, ReviewStatusEnum, UserTypeEnum } from "@shared/domain/enums";
import ReviewPage from "./review";

const transitionMutate = vi.fn();
const bulkMutateAsync = vi.fn().mockResolvedValue({ updated: 1, skipped: 0 });
const createDraftMutateAsync = vi.fn().mockResolvedValue({ id: 99, reviewStatus: ReviewStatusEnum.DRAFT, examplesCreated: 1 });

vi.mock("@/components/layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: {
      id: "reviewer-1",
      role: UserTypeEnum.REVIEWER,
      email: "reviewer@example.com",
    },
  }),
}));

vi.mock("@/hooks/use-review", () => ({
  useReviewQueue: () => ({
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
  }),
  useReviewHistory: () => ({
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
      events: [],
    },
    isLoading: false,
    isError: false,
  }),
  useTransitionReview: () => ({
    mutate: transitionMutate,
    isPending: false,
  }),
  useBulkTransitionReview: () => ({
    mutateAsync: bulkMutateAsync,
    isPending: false,
  }),
  useCreateReviewDraft: () => ({
    mutateAsync: createDraftMutateAsync,
    isPending: false,
  }),
}));

describe("ReviewPage integration", () => {
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

  it("creates a draft with example payload", async () => {
    const user = userEvent.setup();
    render(<ReviewPage />);

    await user.type(screen.getByPlaceholderText("Original script word/phrase"), "నమస్కారం");
    await user.type(screen.getByPlaceholderText("Romanized pronunciation"), "namaskaaram");
    await user.type(screen.getByPlaceholderText("Meaning in English"), "hello");
    await user.clear(screen.getByLabelText("Part of Speech"));
    await user.type(screen.getByLabelText("Part of Speech"), "phrase");
    await user.type(screen.getByPlaceholderText("Example sentence in source script"), "ఆమె నమస్కారం చెప్పింది.");
    await user.type(screen.getByPlaceholderText("Example pronunciation"), "aame namaskaaram cheppindi");
    await user.type(screen.getByPlaceholderText("Example meaning in English"), "She said hello.");

    await user.click(screen.getByRole("button", { name: "Create Draft" }));

    expect(createDraftMutateAsync).toHaveBeenCalledTimes(1);
    expect(createDraftMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        language: LanguageEnum.TELUGU,
        pronunciation: "namaskaaram",
        english: "hello",
        partOfSpeech: "phrase",
      }),
    );
  });
});
