import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateVocabularyDraftForm } from "./create-vocabulary-draft-form";
import { LanguageEnum, PartOfSpeechEnum, VocabularyTagEnum } from "@shared/domain/enums";

const useCreateVocabularyDraftFormMock = vi.fn();

vi.mock("./use-create-vocabulary-draft-form", () => ({
  useCreateVocabularyDraftForm: () => useCreateVocabularyDraftFormMock(),
}));

vi.mock("@/components/review/vocabulary-draft-examples", () => ({
  VocabularyDraftExamples: () => <div>Examples section</div>,
}));

describe("CreateVocabularyDraftForm", () => {
  beforeEach(() => {
    useCreateVocabularyDraftFormMock.mockReturnValue({
      createError: null,
      createSuccess: null,
      draftLanguage: LanguageEnum.TELUGU,
      setDraftLanguage: vi.fn(),
      draftOriginalScript: "",
      setDraftOriginalScript: vi.fn(),
      draftPronunciation: "",
      setDraftPronunciation: vi.fn(),
      draftEnglish: "",
      setDraftEnglish: vi.fn(),
      draftPartOfSpeech: PartOfSpeechEnum.NOUN,
      setDraftPartOfSpeech: vi.fn(),
      draftAudioUrl: "",
      setDraftAudioUrl: vi.fn(),
      draftImageUrl: "",
      setDraftImageUrl: vi.fn(),
      draftSourceUrl: "",
      setDraftSourceUrl: vi.fn(),
      draftTags: [VocabularyTagEnum.MANUAL_DRAFT],
      setDraftTags: vi.fn(),
      draftClusterIds: [],
      setDraftClusterIds: vi.fn(),
      draftExamples: [],
      clusterOptions: [{ value: "1", label: "Greetings (10)" }],
      availableClustersQuery: { isLoading: false, isError: false },
      updateExample: vi.fn(),
      addExample: vi.fn(),
      removeExample: vi.fn(),
      submitDraft: vi.fn(),
      isSubmitting: false,
    });
  });

  it("renders cluster loading, submit pending, and result messaging from the view-model", () => {
    useCreateVocabularyDraftFormMock.mockReturnValue({
      ...useCreateVocabularyDraftFormMock(),
      createError: "Create failed",
      createSuccess: "Draft created",
      availableClustersQuery: { isLoading: true, isError: false },
      isSubmitting: true,
    });

    render(<CreateVocabularyDraftForm />);

    expect(screen.getByText("Create Vocabulary Draft")).toBeTruthy();
    expect(screen.getByText("Loading clusters...")).toBeTruthy();
    expect(screen.getByText("Create failed")).toBeTruthy();
    expect(screen.getByText("Draft created")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Creating..." }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(screen.getByText("Examples section")).toBeTruthy();
  });

  it("renders cluster failure state when cluster options fail to load", () => {
    useCreateVocabularyDraftFormMock.mockReturnValue({
      ...useCreateVocabularyDraftFormMock(),
      availableClustersQuery: { isLoading: false, isError: true },
    });

    render(<CreateVocabularyDraftForm />);

    expect(screen.getByText("Failed to load clusters.")).toBeTruthy();
  });
});
