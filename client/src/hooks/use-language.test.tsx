import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { APP_STORAGE_KEYS } from "@shared/domain/constants/app-brand";
import { LanguageEnum } from "@shared/domain/enums";
import { useLearningLanguage } from "./use-language";

function Harness() {
  const { language, languageLabel, options } = useLearningLanguage();

  return (
    <div>
      <span>{language}</span>
      <span>{languageLabel}</span>
      <span>{options.map((option) => option.label).join(",")}</span>
    </div>
  );
}

describe("useLearningLanguage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("exposes Telugu as the only live learner language option", () => {
    render(<Harness />);

    expect(screen.getByText(LanguageEnum.TELUGU)).toBeTruthy();
    expect(screen.getAllByText("Telugu").length).toBeGreaterThan(0);
    expect(screen.queryByText("Hindi")).toBeNull();
  });

  it("falls back to Telugu when storage contains a hidden language", () => {
    window.localStorage.setItem(APP_STORAGE_KEYS.selectedLanguage, LanguageEnum.HINDI);

    render(<Harness />);

    expect(screen.getByText(LanguageEnum.TELUGU)).toBeTruthy();
    expect(screen.queryByText(LanguageEnum.HINDI)).toBeNull();
  });
});
