import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TutorChatRoleEnum } from "@shared/domain/enums";
import { TutorChatPanel } from "./tutor-chat-panel";

describe("TutorChatPanel", () => {
  it("renders chat messages and sends on button click and enter", async () => {
    const user = userEvent.setup();
    const setInput = vi.fn();
    const sendMessage = vi.fn();

    render(
      <TutorChatPanel
        input=""
        setInput={setInput}
        sendMessage={sendMessage}
        chat={[
          { role: TutorChatRoleEnum.USER, text: "I need water" },
          { role: TutorChatRoleEnum.TUTOR, text: "Try saying: నాకు నీళ్లు కావాలి" },
        ]}
      />,
    );

    expect(screen.getByText("You:")).toBeTruthy();
    expect(screen.getByText("Tutor:")).toBeTruthy();

    await user.type(screen.getByPlaceholderText("Write a sentence..."), "hello{enter}");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(setInput).toHaveBeenCalled();
    expect(sendMessage).toHaveBeenCalledTimes(2);
  });
});
