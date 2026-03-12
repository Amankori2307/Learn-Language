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

vi.mock("@/hooks/use-hybrid-audio", () => ({
  useHybridAudio: () => ({
    activeKey: null,
    play: vi.fn(),
  }),
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
    await user.click(screen.getByRole("button", { name: "Return Dashboard" }));

    expect(refetchQuizMock).toHaveBeenCalledTimes(1);
    expect(setLocation).toHaveBeenCalledWith("/dashboard");
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

  it("shows inline submit error messaging when answer submission fails", async () => {
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
    submitAnswerMock.mockRejectedValueOnce(new Error("Could not submit your answer right now."));

    const user = userEvent.setup();
    render(<QuizPage />);

    await user.click(screen.getByRole("button", { name: "Option hello" }));
    await user.click(screen.getByRole("button", { name: "Check Answer" }));

    expect(screen.getByText("Could not submit your answer right now.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Check Answer" })).toBeTruthy();
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

  it("keeps the quiz route responsive with mobile-first session shell and desktop split card", () => {
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

    const { container } = render(<QuizPage />);

    expect(
      container.querySelector(
        ".flex.h-screen.min-h-screen.flex-col.overflow-hidden.bg-background.h-dvh.min-h-dvh",
      ),
    ).toBeTruthy();
    expect(
      container.querySelector(
        ".flex.min-h-0.flex-1.items-stretch.justify-center.overflow-hidden.px-2.pb-2.pt-1.sm\\:p-4.md\\:px-6.md\\:pt-4.md\\:pb-8",
      ),
    ).toBeTruthy();
    expect(
      container.querySelector(
        ".relative.flex.h-full.min-h-0.w-full.flex-col.overflow-hidden.rounded-\\[var\\(--radius-xl\\)\\].md\\:mx-auto.md\\:max-h-\\[var\\(--pane-quiz-session-max-height\\)\\]",
      ),
    ).toBeTruthy();
    expect(container.querySelector(".grid.min-h-0.flex-1.grid-cols-1.grid-rows-\\[auto_minmax\\(0\\,1fr\\)\\].lg\\:grid-cols-\\[1\\.05fr_1fr\\].lg\\:grid-rows-1")).toBeTruthy();
  });
});
