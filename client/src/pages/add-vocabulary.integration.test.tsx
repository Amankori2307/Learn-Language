import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageEnum, PartOfSpeechEnum, UserTypeEnum } from "@shared/domain/enums";
import AddVocabularyPage from "./add-vocabulary";
import { apiClient } from "@/services/apiClient";

const createDraftMutateAsync = vi
  .fn()
  .mockResolvedValue({ id: 99, reviewStatus: "draft", examplesCreated: 1 });
let currentUserRole = UserTypeEnum.REVIEWER;

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
  useCreateReviewDraft: () => ({
    mutateAsync: createDraftMutateAsync,
    isPending: false,
  }),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

vi.mock("@/services/apiClient", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: [] }),
  },
  buildApiUrl: (path: string) => path,
}));

describe("AddVocabularyPage integration", () => {
  beforeEach(() => {
    currentUserRole = UserTypeEnum.REVIEWER;
  });

  it("creates a draft with example payload", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

    render(
      <QueryClientProvider client={queryClient}>
        <AddVocabularyPage />
      </QueryClientProvider>,
    );

    await user.type(screen.getByPlaceholderText("Original script word/phrase"), "నమస్కారం");
    await user.type(screen.getByPlaceholderText("Romanized pronunciation"), "namaskaaram");
    await user.type(screen.getByPlaceholderText("Meaning in English"), "hello");
    await user.click(screen.getByRole("combobox", { name: "Part of Speech" }));
    await user.click(await screen.findByText("Phrase"));
    await user.type(
      screen.getByPlaceholderText("Example sentence in source script"),
      "ఆమె నమస్కారం చెప్పింది.",
    );
    await user.type(
      screen.getByPlaceholderText("Example pronunciation"),
      "aame namaskaaram cheppindi",
    );
    await user.type(screen.getByPlaceholderText("Example meaning in English"), "She said hello.");

    await user.click(screen.getByRole("button", { name: "Create Draft" }));

    expect(createDraftMutateAsync).toHaveBeenCalledTimes(1);
    expect(createDraftMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        language: LanguageEnum.TELUGU,
        pronunciation: "namaskaaram",
        english: "hello",
        partOfSpeech: PartOfSpeechEnum.PHRASE,
      }),
    );
  });

  it("renders draft creation failure messaging in the page composition", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    createDraftMutateAsync.mockRejectedValueOnce(new Error("Draft creation failed"));
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

    render(
      <QueryClientProvider client={queryClient}>
        <AddVocabularyPage />
      </QueryClientProvider>,
    );

    await user.type(screen.getByPlaceholderText("Original script word/phrase"), "నమస్కారం");
    await user.type(screen.getByPlaceholderText("Romanized pronunciation"), "namaskaaram");
    await user.type(screen.getByPlaceholderText("Meaning in English"), "hello");
    await user.type(
      screen.getByPlaceholderText("Example sentence in source script"),
      "ఆమె నమస్కారం చెప్పింది.",
    );
    await user.type(
      screen.getByPlaceholderText("Example pronunciation"),
      "aame namaskaaram cheppindi",
    );
    await user.type(screen.getByPlaceholderText("Example meaning in English"), "She said hello.");

    await user.click(screen.getByRole("button", { name: "Create Draft" }));

    await waitFor(() => {
      expect(screen.getByText("Draft creation failed")).toBeTruthy();
    });
    expect(screen.getByText("Add Vocabulary")).toBeTruthy();
    expect(screen.getByText("Create Vocabulary Draft")).toBeTruthy();
  });

  it("renders reviewer-only access state for learner users", () => {
    currentUserRole = UserTypeEnum.LEARNER;
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <AddVocabularyPage />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Review Access Required")).toBeTruthy();
    expect(screen.getByText("Only reviewer/admin roles can add vocabulary drafts.")).toBeTruthy();
    expect(screen.queryByText("Create Vocabulary Draft")).toBeNull();
  });
});
