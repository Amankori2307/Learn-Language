import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContextualStoryGrid } from "./contextual-story-grid";

describe("ContextualStoryGrid", () => {
  it("renders contextual story cards with pronunciation and meaning", () => {
    render(
      <ContextualStoryGrid
        storyLines={[
          {
            originalScript: "నాకు నీళ్లు కావాలి",
            pronunciation: "naaku neellu kaavaali",
            english: "I need water",
          },
          {
            originalScript: "స్టేషన్ ఎక్కడ ఉంది?",
            pronunciation: "station ekkada undi",
            english: "Where is the station?",
          },
        ]}
      />,
    );

    expect(screen.getByText("Context 1")).toBeTruthy();
    expect(screen.getByText("Context 2")).toBeTruthy();
    expect(screen.getAllByText(/Pronunciation:/)).toHaveLength(2);
    expect(screen.getByText("I need water")).toBeTruthy();
    expect(screen.getByText("Where is the station?")).toBeTruthy();
  });
});
