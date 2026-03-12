import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartStyle, type ChartConfig } from "@/components/ui/chart";

describe("ChartStyle", () => {
  it("renders theme selectors for the implemented named themes", () => {
    const config: ChartConfig = {
      score: {
        label: "Score",
        theme: {
          dark: "#111111",
          minimal: "#eeeeee",
        },
      },
    };

    const { container } = render(<ChartStyle id="chart-1" config={config} />);
    const style = container.querySelector("style");

    expect(style?.innerHTML.includes(".dark [data-chart=chart-1]")).toBe(true);
    expect(style?.innerHTML.includes(".minimal [data-chart=chart-1]")).toBe(true);
    expect(style?.innerHTML.includes("--color-score: #111111;")).toBe(true);
    expect(style?.innerHTML.includes("--color-score: #eeeeee;")).toBe(true);
  });

  it("falls back to a color entry when a themed value is not provided", () => {
    const config: ChartConfig = {
      attempts: {
        label: "Attempts",
        color: "#123456",
      },
    };

    const { container } = render(<ChartStyle id="chart-2" config={config} />);
    const style = container.querySelector("style");

    expect(style?.innerHTML.includes(".dark [data-chart=chart-2]")).toBe(true);
    expect(style?.innerHTML.includes(".minimal [data-chart=chart-2]")).toBe(true);
    expect(style?.innerHTML.match(/--color-attempts: #123456;/g)?.length).toBe(2);
  });
});
