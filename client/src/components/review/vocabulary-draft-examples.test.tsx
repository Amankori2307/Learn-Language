import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VocabularyDraftExamples } from "./vocabulary-draft-examples";

describe("VocabularyDraftExamples", () => {
  it("forwards field updates and add/remove actions", async () => {
    const user = userEvent.setup();
    const updateExample = vi.fn();
    const addExample = vi.fn();
    const removeExample = vi.fn();

    render(
      <VocabularyDraftExamples
        draftExamples={[
          {
            originalScript: "",
            pronunciation: "",
            englishSentence: "",
            contextTag: "general",
            difficulty: 2,
          },
          {
            originalScript: "",
            pronunciation: "",
            englishSentence: "",
            contextTag: "travel",
            difficulty: 3,
          },
        ]}
        updateExample={updateExample}
        addExample={addExample}
        removeExample={removeExample}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add Example" }));
    await user.type(screen.getAllByPlaceholderText("Example sentence in source script")[0], "నమస్తే");
    await user.click(screen.getAllByRole("button", { name: "Remove" })[0]);

    expect(addExample).toHaveBeenCalledTimes(1);
    expect(updateExample).toHaveBeenCalled();
    expect(removeExample).toHaveBeenCalledWith(0);
  });

  it("disables remove when only one example remains", () => {
    render(
      <VocabularyDraftExamples
        draftExamples={[
          {
            originalScript: "",
            pronunciation: "",
            englishSentence: "",
            contextTag: "general",
            difficulty: 2,
          },
        ]}
        updateExample={vi.fn()}
        addExample={vi.fn()}
        removeExample={vi.fn()}
      />,
    );

    expect((screen.getByRole("button", { name: "Remove" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });
});
