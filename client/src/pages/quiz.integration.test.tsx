import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuizModeEnum, QuizQuestionTypeEnum } from "@shared/domain/enums";
import QuizPage from "./quiz";

const setLocation = vi.fn();
const submitAnswerMock = vi.fn();
const quizDataState = {
  data: [] as Array<{
    wordId: number;
    type: QuizQuestionTypeEnum;
    questionText: string;
    pronunciation: string | null;
    imageUrl: string | null;
    options: Array<{ id: number; text: string }>;
  }>,
};

vi.mock("wouter", () => ({
  useLocation: () => ["/quiz", setLocation],
  useSearch: () => `?mode=${QuizModeEnum.NEW_WORDS}`,
}));

vi.mock("@/components/layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/use-quiz", () => ({
  useGenerateQuiz: () => ({
    data: quizDataState.data,
    isLoading: false,
    isError: false,
  }),
  useSubmitAnswer: () => ({
    mutateAsync: submitAnswerMock,
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-feedback-effects", () => ({
  useFeedbackEffects: () => ({
    enabled: false,
    toggle: vi.fn(),
  }),
}));

vi.mock("@/lib/feedback-effects", () => ({
  runSuccessEffects: vi.fn(),
  runErrorEffects: vi.fn(),
}));

describe("QuizPage integration", () => {
  beforeEach(() => {
    setLocation.mockReset();
    submitAnswerMock.mockReset();
    quizDataState.data = [];
  });

  it("shows revision actions when no questions are available", async () => {
    const user = userEvent.setup();
    render(<QuizPage />);

    expect(screen.getByText("Session Complete")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Daily Revision" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Weak Words Drill" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Practice by Cluster" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Review Attempt History" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Weak Words Drill" }));
    expect(setLocation).toHaveBeenCalledWith(`/quiz?mode=${QuizModeEnum.WEAK_WORDS}`);
  });

  it("starts reinforcement loop from completion CTA after an incorrect answer", async () => {
    quizDataState.data = [
      {
        wordId: 11,
        type: QuizQuestionTypeEnum.SOURCE_TO_TARGET,
        questionText: "నమస్తే",
        pronunciation: "namaste",
        imageUrl: null,
        options: [
          { id: 11, text: "hello" },
          { id: 12, text: "thank you" },
        ],
      },
    ];
    submitAnswerMock.mockResolvedValue({
      isCorrect: false,
      correctAnswer: {
        id: 11,
        originalScript: "నమస్తే",
        english: "hello",
        transliteration: "namaste",
        exampleSentences: ["నమస్తే, మీరు ఎలా ఉన్నారు?"],
      },
      examples: [
        {
          originalScript: "నమస్తే, మీరు ఎలా ఉన్నారు?",
          pronunciation: "namaste, meeru ela unnaru?",
          meaning: "Hello, how are you?",
        },
      ],
      progressUpdate: {
        streak: 0,
        masteryLevel: 1,
        nextReview: new Date().toISOString(),
      },
    });

    const user = userEvent.setup();
    render(<QuizPage />);

    await user.click(screen.getByRole("button", { name: "Option thank you" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: /Start Reinforcement Loop/ }));

    expect(setLocation).toHaveBeenCalledWith(`/quiz?mode=${QuizModeEnum.WEAK_WORDS}`);
  });
});
