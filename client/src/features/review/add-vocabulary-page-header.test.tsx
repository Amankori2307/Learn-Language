import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AddVocabularyPageHeader } from "./add-vocabulary-page-header";

describe("AddVocabularyPageHeader", () => {
  it("renders the add-vocabulary heading and supporting copy", () => {
    render(<AddVocabularyPageHeader />);

    expect(screen.getByText("Add Vocabulary")).toBeTruthy();
    expect(
      screen.getByText("Add new entries with examples. Items enter the review lifecycle as drafts."),
    ).toBeTruthy();
  });
});
