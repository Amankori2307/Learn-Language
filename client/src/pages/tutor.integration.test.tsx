import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TutorChatRoleEnum } from "@shared/domain/enums";
import TutorPage from "./tutor";

const viewModel = vi.fn();

vi.mock("@/components/layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/features/tutor/use-tutor-page-view-model", () => ({
  useTutorPageViewModel: () => viewModel(),
}));

describe("TutorPage integration", () => {
  beforeEach(() => {
    viewModel.mockReset();
  });

  it("renders tutor guidance and existing chat history", () => {
    viewModel.mockReturnValue({
      input: "",
      setInput: vi.fn(),
      sendMessage: vi.fn(),
      chat: [
        {
          role: TutorChatRoleEnum.TUTOR,
          text: "Welcome. Write a sentence and I will give vocabulary-focused feedback.",
        },
      ],
    });

    render(<TutorPage />);

    expect(screen.getByText("Tutor Mode (Text)")).toBeTruthy();
    expect(screen.getByText(/vocabulary coaching with safe local logic/i)).toBeTruthy();
    expect(screen.getByText("Welcome. Write a sentence and I will give vocabulary-focused feedback.")).toBeTruthy();
  });

  it("forwards send actions through the tutor chat panel", async () => {
    const user = userEvent.setup();
    const setInput = vi.fn();
    const sendMessage = vi.fn();

    viewModel.mockReturnValue({
      input: "",
      setInput,
      sendMessage,
      chat: [
        { role: TutorChatRoleEnum.USER, text: "I need water" },
        { role: TutorChatRoleEnum.TUTOR, text: "Try using learned vocabulary." },
      ],
    });

    render(<TutorPage />);

    await user.type(screen.getByPlaceholderText("Write a sentence..."), "hello{enter}");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(setInput).toHaveBeenCalled();
    expect(sendMessage).toHaveBeenCalledTimes(2);
  });
});
