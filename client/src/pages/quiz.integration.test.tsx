import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuizModeEnum, QuizQuestionTypeEnum } from "@shared/domain/enums";
import { APP_STORAGE_KEYS } from "@shared/domain/constants/app-brand";
import QuizPage from "./quiz";

const setLocation = vi.fn();
const submitAnswerMock = vi.fn();
const refetchQuizMock = vi.fn();
let searchMode: QuizModeEnum = QuizModeEnum.NEW_WORDS;
let quizIsLoading = false;
let quizIsError = false;
const quizDataState = {
  data: [] as Array<{
    wordId: number;
    type: QuizQuestionTypeEnum;
    questionText: string;
    pronunciation: string | null;
    audioUrl?: string | null;
    imageUrl: string | null;
    options: Array<{ id: number; text: string }>;
  }>,
};

vi.mock("wouter", () => ({
  useLocation: () => ["/quiz", setLocation],
  useSearch: () => `?mode=${searchMode}`,
}));

vi.mock("@/components/layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/use-quiz", () => ({
  useGenerateQuiz: () => ({
    data: quizDataState.data,
    isLoading: quizIsLoading,
    isError: quizIsError,
    refetch: refetchQuizMock,
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
    window.localStorage.clear();
    setLocation.mockReset();
    submitAnswerMock.mockReset();
    refetchQuizMock.mockReset();
    quizIsLoading = false;
    quizIsError = false;
    quizDataState.data = [];
    searchMode = QuizModeEnum.NEW_WORDS;
  });

  it("renders a retryable route-level error surface when quiz loading fails", async () => {
    const user = userEvent.setup();
    quizIsError = true;
    render(<QuizPage />);

    expect(screen.getByText("Could not load quiz session")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Retry Session" }));
    await user.click(screen.getByRole("button", { name: "Return Home" }));

    expect(refetchQuizMock).toHaveBeenCalledTimes(1);
    expect(setLocation).toHaveBeenCalledWith("/");
  });

  it("shows new-word completion copy when new_words queue is empty", async () => {
    const user = userEvent.setup();
    render(<QuizPage />);

    expect(screen.getByText("Session Complete")).toBeTruthy();
    expect(screen.getByText("You finished the current new-word queue.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Daily Revision" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Weak Words Drill" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Practice by Cluster" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "View Analytics" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Weak Words Drill" }));
    expect(setLocation).toHaveBeenCalledWith(`/quiz?mode=${QuizModeEnum.WEAK_WORDS}`);
  });

  it("shows default completion copy when daily review queue is empty", () => {
    searchMode = QuizModeEnum.DAILY_REVIEW;
    render(<QuizPage />);

    expect(screen.getByText("Session Complete")).toBeTruthy();
    expect(
      screen.getByText("Great job! You've completed all due items for this session."),
    ).toBeTruthy();
  });

  it.each([
    QuizModeEnum.DAILY_REVIEW,
    QuizModeEnum.NEW_WORDS,
    QuizModeEnum.CLUSTER,
    QuizModeEnum.WEAK_WORDS,
    QuizModeEnum.LISTEN_IDENTIFY,
    QuizModeEnum.COMPLEX_WORKOUT,
  ])("renders mode shell without crashing for mode=%s when queue is empty", (mode) => {
    searchMode = mode;
    render(<QuizPage />);
    expect(screen.getByText("Session Complete")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Daily Revision" })).toBeTruthy();
  });

  it("starts reinforcement loop from completion CTA after an incorrect answer", async () => {
    quizDataState.data = [
      {
        wordId: 11,
        type: QuizQuestionTypeEnum.SOURCE_TO_TARGET,
        questionText: "నమస్తే",
        pronunciation: "namaste",
        audioUrl: null,
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
    await user.click(screen.getByRole("button", { name: "Check Answer" }));
    await user.keyboard("{Enter}");
    await user.click(screen.getByRole("button", { name: /Start Reinforcement Loop/ }));

    expect(setLocation).toHaveBeenCalledWith(`/quiz?mode=${QuizModeEnum.WEAK_WORDS}`);
  });

  it("shows confidence controls when the learner preference is enabled", () => {
    window.localStorage.setItem(APP_STORAGE_KEYS.quizConfidenceEnabled, "true");
    quizDataState.data = [
      {
        wordId: 11,
        type: QuizQuestionTypeEnum.SOURCE_TO_TARGET,
        questionText: "నమస్తే",
        pronunciation: "namaste",
        audioUrl: null,
        imageUrl: null,
        options: [
          { id: 11, text: "hello" },
          { id: 12, text: "thank you" },
        ],
      },
    ];

    render(<QuizPage />);

    expect(screen.getByLabelText("Answer confidence")).toBeTruthy();
    expect(screen.getByText("Used to grade recall quality")).toBeTruthy();
  });
});
