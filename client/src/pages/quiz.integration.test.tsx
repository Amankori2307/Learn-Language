import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { QuizModeEnum } from "@shared/domain/enums";
import QuizPage from "./quiz";

const setLocation = vi.fn();

vi.mock("wouter", () => ({
  useLocation: () => ["/quiz", setLocation],
  useSearch: () => `?mode=${QuizModeEnum.NEW_WORDS}`,
}));

vi.mock("@/components/layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/use-quiz", () => ({
  useGenerateQuiz: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
  useSubmitAnswer: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe("QuizPage integration", () => {
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
});
