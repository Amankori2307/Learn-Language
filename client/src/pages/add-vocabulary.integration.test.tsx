import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { LanguageEnum, UserTypeEnum } from "@shared/domain/enums";
import AddVocabularyPage from "./add-vocabulary";

const createDraftMutateAsync = vi
  .fn()
  .mockResolvedValue({ id: 99, reviewStatus: "draft", examplesCreated: 1 });

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
  useCreateReviewDraft: () => ({
    mutateAsync: createDraftMutateAsync,
    isPending: false,
  }),
}));

describe("AddVocabularyPage integration", () => {
  it("creates a draft with example payload", async () => {
    const user = userEvent.setup();
    render(<AddVocabularyPage />);

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
